import type {
	ExtensionAPI,
	ExtensionCommandContext,
	ExtensionContext,
} from '@earendil-works/pi-coding-agent';
import {fingerprintSnapshot, hasSubstantiveFeedback} from './aggregate';
import {runSanityCheck} from './checker';
import {collectPullfrogSnapshot} from './github';
import {notifyPullfrogReady} from './notifications';
import {
	acquireCheckLock,
	getRepositoryContext,
	getStatePath,
	readState,
	reviewKey,
	updateState,
} from './state';
import type {
	MonitorState,
	PullfrogPrState,
	PullfrogSnapshot,
	RepositoryContext,
	ReviewBranchMetadata,
	SanityResult,
} from './types';
import {REVIEW_BRANCH_ENTRY} from './types';
import {cleanStaleReviewWorktrees} from './worktree';

const READY_WIDGET = 'pullfrog-ready';
const REVIEW_WIDGET = 'pullfrog-review';
const STATUS_KEY = 'pullfrog-monitor';
const POLL_INTERVAL_MS = 45_000;
const UI_INTERVAL_MS = 5_000;
const SETTLE_MS = 20_000;

const actionableCount = (result: SanityResult | null) =>
	result?.findings.filter((finding) => finding.verdict === 'agree').length ?? 0;

const getReviewMetadata = (
	ctx: ExtensionContext,
): ReviewBranchMetadata | null => {
	const branch = ctx.sessionManager.getBranch();
	for (let index = branch.length - 1; index >= 0; index--) {
		const entry = branch[index];
		if (
			entry.type === 'custom' &&
			entry.customType === REVIEW_BRANCH_ENTRY &&
			entry.data &&
			typeof entry.data === 'object'
		) {
			return entry.data as ReviewBranchMetadata;
		}
	}
	return null;
};

const formatResult = (result: SanityResult) => {
	const findings = result.findings
		.map((finding) => {
			const evidence = finding.evidence
				.map(
					(item) =>
						`- ${item.path}${item.line ? `:${item.line}` : ''}: ${item.explanation}`,
				)
				.join('\n');
			const validation = finding.suggestedValidation
				.map((item) => `- ${item}`)
				.join('\n');
			return [
				`### [${finding.severity} · ${finding.verdict}] ${finding.title}`,
				`Source: ${finding.sourceUrl}`,
				`Confidence: ${Math.round(finding.confidence * 100)}%`,
				'',
				finding.rationale,
				evidence ? `\nEvidence:\n${evidence}` : '',
				`\nSuggested direction: ${finding.suggestedDirection}`,
				validation ? `\nSuggested validation:\n${validation}` : '',
			]
				.filter(Boolean)
				.join('\n');
		})
		.join('\n\n');
	return [
		`## 🐸 Pullfrog sanity review — PR #${result.prNumber}`,
		'',
		`Pull request: ${result.prUrl}`,
		`Reviewed head: \`${result.reviewedHead}\``,
		'',
		result.summary,
		'',
		findings || 'No concrete findings were reported.',
	].join('\n');
};

const createPrState = (
	snapshot: PullfrogSnapshot,
	monitoring: boolean,
): PullfrogPrState => ({
	repository: snapshot.repository,
	prNumber: snapshot.prNumber,
	prUrl: snapshot.prUrl,
	title: snapshot.title,
	headSha: snapshot.headSha,
	monitoring,
	currentFingerprint: null,
	checkedFingerprint: null,
	settleAfter: null,
	status: monitoring ? 'watching' : 'complete',
	result: null,
	viewed: true,
	error: null,
	detectedAt: null,
	checkedAt: null,
	notifiedAt: null,
});

const updateSnapshotMetadata = (
	entry: PullfrogPrState,
	snapshot: PullfrogSnapshot,
) => {
	entry.prUrl = snapshot.prUrl;
	entry.title = snapshot.title;
	entry.headSha = snapshot.headSha;
};

const describeStatus = (state: MonitorState) => {
	const entries = Object.values(state.reviews);
	if (entries.length === 0) {
		return 'Pullfrog monitor: nothing monitored or checked yet.';
	}
	return [
		'Pullfrog monitor',
		'',
		...entries
			.sort((a, b) => b.prNumber - a.prNumber)
			.map((entry) => {
				const findings = actionableCount(entry.result);
				const suffix =
					entry.result && !entry.viewed && findings > 0
						? ` · ${findings} finding${findings === 1 ? '' : 's'} ready`
						: '';
				const mode = entry.monitoring ? 'monitored' : 'one-time';
				return `#${entry.prNumber} · ${mode} · ${entry.status}${suffix}${entry.error ? ` · ${entry.error}` : ''}`;
			}),
	].join('\n');
};

export default function pullfrogMonitor(pi: ExtensionAPI) {
	let generation = 0;
	let activeContext: ExtensionContext | null = null;
	let repository: RepositoryContext | null = null;
	let statePath: string | null = null;
	let reviewMetadata: ReviewBranchMetadata | null = null;
	let pollTimer: NodeJS.Timeout | undefined;
	let uiTimer: NodeJS.Timeout | undefined;
	let runtimeAbort: AbortController | null = null;
	let polling = false;
	const activeChecks = new Map<string, Promise<void>>();

	const clearTimers = () => {
		if (pollTimer) {
			clearTimeout(pollTimer);
			pollTimer = undefined;
		}
		if (uiTimer) {
			clearInterval(uiTimer);
			uiTimer = undefined;
		}
	};

	const renderUi = async (expectedGeneration: number) => {
		if (expectedGeneration !== generation || !activeContext || !statePath) {
			return;
		}
		reviewMetadata = getReviewMetadata(activeContext);
		if (reviewMetadata) {
			activeContext.ui.setWidget(REVIEW_WIDGET, [
				`🐸 Reviewing Pullfrog findings for PR #${reviewMetadata.prNumber} · Return with /pullfrog-end`,
			]);
			activeContext.ui.setWidget(READY_WIDGET, undefined);
		} else {
			activeContext.ui.setWidget(REVIEW_WIDGET, undefined);
		}
		const state = await readState(statePath);
		if (expectedGeneration !== generation || !activeContext) {
			return;
		}
		const entries = Object.values(state.reviews);
		const checking = entries.filter((entry) => entry.status === 'checking');
		const waiting = entries.filter((entry) => entry.status === 'waiting');
		if (checking.length > 0) {
			const first = checking[0];
			activeContext.ui.setStatus(
				STATUS_KEY,
				`🐸 Sanity-checking Pullfrog review for PR #${first.prNumber}${checking.length > 1 ? ` · ${checking.length - 1} more checking` : ''}…`,
			);
		} else if (waiting.length > 0) {
			const first = waiting[0];
			activeContext.ui.setStatus(
				STATUS_KEY,
				`🐸 Pullfrog feedback detected on PR #${first.prNumber} · Waiting for review to settle…`,
			);
		} else {
			activeContext.ui.setStatus(STATUS_KEY, undefined);
		}
		if (reviewMetadata) {
			return;
		}
		const ready = entries.filter(
			(entry) =>
				entry.result && !entry.viewed && actionableCount(entry.result) > 0,
		);
		if (ready.length === 0) {
			activeContext.ui.setWidget(READY_WIDGET, undefined);
		} else if (ready.length === 1) {
			const count = actionableCount(ready[0].result);
			activeContext.ui.setWidget(READY_WIDGET, [
				`🐸 Pullfrog review ready · ${count} finding${count === 1 ? '' : 's'} · Use /pullfrog`,
			]);
		} else {
			activeContext.ui.setWidget(READY_WIDGET, [
				`🐸 ${ready.length} Pullfrog reviews ready · Use /pullfrog`,
			]);
		}
	};

	const launchCheck = async (
		snapshot: PullfrogSnapshot,
		fingerprint: string,
		ctx: ExtensionContext,
	) => {
		if (!repository || !statePath || !runtimeAbort || !ctx.model) {
			ctx.ui.notify(
				'A model must be selected to run a sanity check.',
				'warning',
			);
			return 'unavailable' as const;
		}
		const key = reviewKey(snapshot.repository, snapshot.prNumber);
		if (activeChecks.has(key)) {
			return 'busy' as const;
		}
		const release = await acquireCheckLock(statePath, snapshot.prNumber);
		if (!release) {
			await renderUi(generation);
			return 'busy' as const;
		}
		const expectedGeneration = generation;
		try {
			await updateState(statePath, (state) => {
				const entry = state.reviews[key] ?? createPrState(snapshot, false);
				state.reviews[key] = entry;
				updateSnapshotMetadata(entry, snapshot);
				entry.currentFingerprint = fingerprint;
				entry.status = 'checking';
				entry.settleAfter = null;
				entry.error = null;
			});
			await renderUi(expectedGeneration);
		} catch (error) {
			await release();
			throw error;
		}
		const checkRepository = repository;
		const checkStatePath = statePath;
		const checkSignal = runtimeAbort.signal;
		const task = runSanityCheck({
			repository: checkRepository,
			snapshot,
			fingerprint,
			model: ctx.model,
			modelRegistry: ctx.modelRegistry,
			thinkingLevel: pi.getThinkingLevel(),
			signal: checkSignal,
		})
			.then(async (result) => {
				const count = actionableCount(result);
				const updated = await updateState(checkStatePath, (state) => {
					const entry = state.reviews[key];
					if (!entry || entry.currentFingerprint !== fingerprint) {
						return false;
					}
					entry.result = result;
					entry.checkedFingerprint = fingerprint;
					entry.checkedAt = new Date().toISOString();
					entry.viewed = count === 0;
					entry.status =
						count > 0 ? 'ready' : entry.monitoring ? 'watching' : 'complete';
					entry.error = null;
					entry.notifiedAt = new Date().toISOString();
					return true;
				});
				if (!updated.result) {
					return;
				}
				if (count > 0) {
					notifyPullfrogReady(
						`Pullfrog PR #${snapshot.prNumber}`,
						`${count} finding${count === 1 ? '' : 's'} worth reviewing — run /pullfrog`,
					);
				} else if (expectedGeneration === generation && activeContext) {
					activeContext.ui.notify(
						`🐸 Pullfrog review checked for PR #${snapshot.prNumber} · Nothing actionable`,
						'info',
					);
				}
			})
			.catch(async (error) => {
				await updateState(checkStatePath, (state) => {
					const entry = state.reviews[key];
					if (!entry) {
						return;
					}
					entry.status = checkSignal.aborted
						? 'checking'
						: entry.monitoring
							? 'waiting'
							: 'failed';
					entry.settleAfter =
						!checkSignal.aborted && entry.monitoring
							? new Date(Date.now() + SETTLE_MS).toISOString()
							: null;
					entry.error = error instanceof Error ? error.message : String(error);
				});
				if (
					!checkSignal.aborted &&
					expectedGeneration === generation &&
					activeContext
				) {
					activeContext.ui.notify(
						`🐸 Pullfrog sanity check failed for PR #${snapshot.prNumber}`,
						'warning',
					);
				}
			})
			.finally(async () => {
				await release();
				activeChecks.delete(key);
				await renderUi(generation);
			});
		activeChecks.set(key, task);
		return 'started' as const;
	};

	const processMonitoredPr = async (
		entry: PullfrogPrState,
		expectedGeneration: number,
	) => {
		if (!repository || !statePath || !activeContext) {
			return;
		}
		const snapshot = await collectPullfrogSnapshot({
			repository: entry.repository,
			cwd: repository.root,
			prNumber: entry.prNumber,
			signal: runtimeAbort?.signal,
		});
		const key = reviewKey(entry.repository, entry.prNumber);
		if (snapshot.state !== 'OPEN') {
			await updateState(statePath, (state) => {
				const current = state.reviews[key];
				if (current) {
					current.monitoring = false;
					current.status = 'complete';
				}
			});
			return;
		}
		const fingerprint = fingerprintSnapshot(snapshot);
		if (!hasSubstantiveFeedback(snapshot)) {
			await updateState(statePath, (state) => {
				const current = state.reviews[key];
				if (!current) {
					return;
				}
				updateSnapshotMetadata(current, snapshot);
				current.currentFingerprint = fingerprint;
				current.checkedFingerprint = fingerprint;
				current.status = current.monitoring ? 'watching' : 'complete';
				current.settleAfter = null;
				current.error = null;
			});
			return;
		}
		const decision = await updateState(statePath, (state) => {
			const current = state.reviews[key];
			if (!current || (!current.monitoring && current.status !== 'checking')) {
				return 'none' as const;
			}
			updateSnapshotMetadata(current, snapshot);
			if (current.currentFingerprint !== fingerprint) {
				current.currentFingerprint = fingerprint;
				current.status = 'waiting';
				current.detectedAt = new Date().toISOString();
				current.settleAfter = new Date(Date.now() + SETTLE_MS).toISOString();
				current.error = null;
				return 'wait' as const;
			}
			if (current.checkedFingerprint === fingerprint) {
				return 'none' as const;
			}
			if (
				current.status === 'checking' ||
				(current.settleAfter && Date.parse(current.settleAfter) <= Date.now())
			) {
				return 'check' as const;
			}
			return 'wait' as const;
		});
		if (decision.result === 'check' && expectedGeneration === generation) {
			await launchCheck(snapshot, fingerprint, activeContext);
		}
	};

	const poll = async (expectedGeneration: number) => {
		if (
			polling ||
			expectedGeneration !== generation ||
			!repository ||
			!statePath ||
			!activeContext
		) {
			return;
		}
		polling = true;
		try {
			const state = await readState(statePath);
			for (const entry of Object.values(state.reviews).filter(
				(item) => item.monitoring || item.status === 'checking',
			)) {
				if (expectedGeneration !== generation) {
					return;
				}
				await processMonitoredPr(entry, expectedGeneration);
			}
		} catch (error) {
			if (expectedGeneration === generation && activeContext) {
				activeContext.ui.notify(
					`Pullfrog monitor paused: ${error instanceof Error ? error.message : String(error)}`,
					'warning',
				);
			}
		} finally {
			polling = false;
			await renderUi(expectedGeneration);
		}
	};

	const schedulePoll = (expectedGeneration: number) => {
		const jitter = Math.floor(Math.random() * 10_001) - 5_000;
		pollTimer = setTimeout(() => {
			void poll(expectedGeneration).finally(() => {
				if (expectedGeneration === generation) {
					schedulePoll(expectedGeneration);
				}
			});
		}, POLL_INTERVAL_MS + jitter);
		pollTimer.unref?.();
	};

	const resolveCurrent = async (ctx: ExtensionContext) => {
		const repo = repository ?? (await getRepositoryContext(ctx.cwd));
		let snapshot: PullfrogSnapshot;
		try {
			snapshot = await collectPullfrogSnapshot({
				repository: repo.repository,
				cwd: repo.root,
				signal: runtimeAbort?.signal,
			});
		} catch (error) {
			const processError = error as {message?: string; stderr?: string};
			const details = `${processError.message ?? ''}\n${processError.stderr ?? ''}`;
			if (
				/no pull requests? found|no pull request found|could not resolve to a pull request/i.test(
					details,
				)
			) {
				throw new Error('No open pull request found for the current branch.');
			}
			throw error;
		}
		if (snapshot.state !== 'OPEN') {
			throw new Error(
				'The pull request associated with the current branch is no longer open.',
			);
		}
		return {repo, snapshot};
	};

	const startMonitoring = async (
		ctx: ExtensionCommandContext,
		provided?: PullfrogSnapshot,
	) => {
		const {snapshot} = provided
			? {snapshot: provided}
			: await resolveCurrent(ctx);
		if (!statePath) {
			throw new Error('Pullfrog monitor state is unavailable');
		}
		const key = reviewKey(snapshot.repository, snapshot.prNumber);
		const fingerprint = fingerprintSnapshot(snapshot);
		const substantive = hasSubstantiveFeedback(snapshot);
		await updateState(statePath, (state) => {
			const entry = state.reviews[key] ?? createPrState(snapshot, true);
			state.reviews[key] = entry;
			entry.monitoring = true;
			updateSnapshotMetadata(entry, snapshot);
			if (substantive && entry.checkedFingerprint !== fingerprint) {
				entry.currentFingerprint = fingerprint;
				entry.status = 'waiting';
				entry.detectedAt = new Date().toISOString();
				entry.settleAfter = new Date(Date.now() + SETTLE_MS).toISOString();
			} else {
				entry.currentFingerprint = fingerprint;
				entry.status = 'watching';
				entry.settleAfter = null;
			}
			entry.error = null;
		});
		ctx.ui.notify(`🐸 Monitoring Pullfrog on PR #${snapshot.prNumber}`, 'info');
		await renderUi(generation);
	};

	const checkNow = async (
		ctx: ExtensionCommandContext,
		provided?: PullfrogSnapshot,
	) => {
		const {snapshot} = provided
			? {snapshot: provided}
			: await resolveCurrent(ctx);
		if (!statePath) {
			throw new Error('Pullfrog monitor state is unavailable');
		}
		if (!hasSubstantiveFeedback(snapshot)) {
			ctx.ui.notify(
				'No completed Pullfrog review found on the current PR. Use /pullfrog-monitor start to wait for one.',
				'info',
			);
			return;
		}
		const fingerprint = fingerprintSnapshot(snapshot);
		ctx.ui.setStatus(
			STATUS_KEY,
			`🐸 Sanity-checking Pullfrog review for PR #${snapshot.prNumber}…`,
		);
		const outcome = await launchCheck(snapshot, fingerprint, ctx);
		if (outcome === 'busy') {
			ctx.ui.notify(
				`🐸 A Pullfrog sanity check for PR #${snapshot.prNumber} is already running`,
				'info',
			);
		}
		if (outcome !== 'started') {
			await renderUi(generation);
		}
	};

	const stopMonitoring = async (
		ctx: ExtensionCommandContext,
		provided?: PullfrogSnapshot,
	) => {
		const {snapshot} = provided
			? {snapshot: provided}
			: await resolveCurrent(ctx);
		if (!statePath) {
			throw new Error('Pullfrog monitor state is unavailable');
		}
		const key = reviewKey(snapshot.repository, snapshot.prNumber);
		const stopped = await updateState(statePath, (state) => {
			const entry = state.reviews[key];
			if (!entry?.monitoring) {
				return false;
			}
			entry.monitoring = false;
			if (entry.status === 'watching' || entry.status === 'waiting') {
				entry.status = 'complete';
				entry.settleAfter = null;
			}
			return true;
		});
		ctx.ui.notify(
			stopped.result
				? `🐸 Stopped monitoring Pullfrog on PR #${snapshot.prNumber}`
				: `PR #${snapshot.prNumber} is not being monitored`,
			'info',
		);
		await renderUi(generation);
	};

	const runMonitorAction = async (
		action: string,
		ctx: ExtensionCommandContext,
		provided?: PullfrogSnapshot,
	) => {
		if (action === 'status') {
			if (!statePath) {
				throw new Error('Pullfrog monitor state is unavailable');
			}
			ctx.ui.notify(describeStatus(await readState(statePath)), 'info');
			return;
		}
		if (action === 'start') {
			await startMonitoring(ctx, provided);
			return;
		}
		if (action === 'check') {
			await checkNow(ctx, provided);
			return;
		}
		if (action === 'stop') {
			await stopMonitoring(ctx, provided);
			return;
		}
		ctx.ui.notify(`Unknown action: ${action}`, 'warning');
	};

	pi.on('session_start', async (_event, ctx) => {
		generation++;
		const expectedGeneration = generation;
		clearTimers();
		runtimeAbort?.abort();
		runtimeAbort = new AbortController();
		activeContext = ctx;
		reviewMetadata = getReviewMetadata(ctx);
		ctx.ui.setWidget(READY_WIDGET, undefined);
		ctx.ui.setWidget(REVIEW_WIDGET, undefined);
		ctx.ui.setStatus(STATUS_KEY, undefined);
		try {
			repository = await getRepositoryContext(ctx.cwd);
			statePath = getStatePath(repository);
			void cleanStaleReviewWorktrees(repository).catch(() => undefined);
			await renderUi(expectedGeneration);
			void poll(expectedGeneration);
			schedulePoll(expectedGeneration);
			uiTimer = setInterval(
				() => void renderUi(expectedGeneration),
				UI_INTERVAL_MS,
			);
			uiTimer.unref?.();
		} catch (error) {
			ctx.ui.notify(
				`Pullfrog monitor unavailable: ${error instanceof Error ? error.message : String(error)}`,
				'warning',
			);
		}
	});

	pi.on('session_tree', async (_event, ctx) => {
		activeContext = ctx;
		reviewMetadata = getReviewMetadata(ctx);
		await renderUi(generation);
	});

	pi.on('session_shutdown', (_event, ctx) => {
		generation++;
		clearTimers();
		runtimeAbort?.abort();
		runtimeAbort = null;
		activeContext = null;
		repository = null;
		statePath = null;
		reviewMetadata = null;
		polling = false;
		ctx.ui.setWidget(READY_WIDGET, undefined);
		ctx.ui.setWidget(REVIEW_WIDGET, undefined);
		ctx.ui.setStatus(STATUS_KEY, undefined);
	});

	pi.registerCommand('pullfrog-monitor', {
		description: 'Monitor or sanity-check Pullfrog feedback on the current PR',
		getArgumentCompletions: (prefix) => {
			const query = prefix.trim().toLowerCase();
			const actions = [
				{
					value: 'start',
					description: 'Continuously monitor the current PR',
				},
				{
					value: 'check',
					description: 'Sanity-check existing Pullfrog feedback once',
				},
				{
					value: 'stop',
					description: 'Stop monitoring the current PR',
				},
				{
					value: 'status',
					description: 'Show monitored, checking, and ready PRs',
				},
			];
			const matches = actions.filter(
				(action) =>
					!query ||
					action.value.startsWith(query) ||
					action.description.toLowerCase().includes(query),
			);
			return matches.length
				? matches.map((action) => ({
						value: action.value,
						label: action.value,
						description: action.description,
					}))
				: null;
		},
		handler: async (args, ctx) => {
			try {
				const action = args.trim().toLowerCase();
				if (action) {
					await runMonitorAction(action, ctx);
					return;
				}
				const {snapshot} = await resolveCurrent(ctx);
				if (!statePath) {
					throw new Error('Pullfrog monitor state is unavailable');
				}
				const current = (await readState(statePath)).reviews[
					reviewKey(snapshot.repository, snapshot.prNumber)
				];
				const options = current?.monitoring
					? [
							'Check existing review now',
							'Stop monitoring',
							'Show monitor status',
						]
					: [
							'Start monitoring',
							'Check existing review once',
							'Show monitor status',
						];
				const selected = await ctx.ui.select(
					`Pullfrog monitor — PR #${snapshot.prNumber}`,
					options,
				);
				if (!selected) {
					return;
				}
				const selectedAction = selected.startsWith('Start')
					? 'start'
					: selected.startsWith('Check')
						? 'check'
						: selected.startsWith('Stop')
							? 'stop'
							: 'status';
				await runMonitorAction(selectedAction, ctx, snapshot);
			} catch (error) {
				ctx.ui.notify(
					error instanceof Error
						? error.message
						: 'Could not resolve the current pull request',
					'warning',
				);
			}
		},
	});

	pi.registerCommand('pullfrog', {
		description: 'Open completed Pullfrog sanity-review findings',
		handler: async (_args, ctx) => {
			if (getReviewMetadata(ctx)) {
				ctx.ui.notify(
					`Already reviewing Pullfrog findings. Use /pullfrog-end to return.`,
					'info',
				);
				return;
			}
			if (!statePath) {
				ctx.ui.notify('Pullfrog monitor state is unavailable', 'warning');
				return;
			}
			const state = await readState(statePath);
			let ready = Object.values(state.reviews)
				.filter(
					(entry) =>
						entry.result && !entry.viewed && actionableCount(entry.result) > 0,
				)
				.sort((a, b) => (b.checkedAt ?? '').localeCompare(a.checkedAt ?? ''));
			if (ready.length === 0) {
				ctx.ui.notify('No Pullfrog sanity reviews are ready.', 'info');
				return;
			}
			try {
				const current = await resolveCurrent(ctx);
				ready = ready.sort((a, b) =>
					a.prNumber === current.snapshot.prNumber
						? -1
						: b.prNumber === current.snapshot.prNumber
							? 1
							: 0,
				);
			} catch {
				// Ready reviews remain available even when the current branch has no PR.
			}
			let selected = ready[0];
			if (ready.length > 1) {
				const labels = ready.map((entry) => {
					const count = actionableCount(entry.result);
					return `#${entry.prNumber} · ${count} finding${count === 1 ? '' : 's'} · ${entry.title}`;
				});
				const choice = await ctx.ui.select('Pullfrog reviews', labels);
				if (!choice) {
					return;
				}
				selected = ready[labels.indexOf(choice)];
			}
			if (!selected.result) {
				return;
			}
			let originId = ctx.sessionManager.getLeafId();
			if (!originId) {
				pi.appendEntry('pullfrog-origin-anchor', {
					createdAt: new Date().toISOString(),
				});
				originId = ctx.sessionManager.getLeafId();
			}
			if (!originId) {
				ctx.ui.notify('Could not create a review branch anchor', 'error');
				return;
			}
			const firstUser = ctx.sessionManager.getBranch().find((entry) => {
				if (entry.type !== 'message') {
					return false;
				}
				const message = entry.message as {role?: string};
				return message.role === 'user';
			});
			const navigated = await ctx.navigateTree(firstUser?.id ?? originId, {
				summarize: false,
				label: `pullfrog-pr-${selected.prNumber}`,
			});
			if (navigated.cancelled) {
				return;
			}
			const metadata: ReviewBranchMetadata = {
				originId,
				repository: selected.repository,
				prNumber: selected.prNumber,
				fingerprint: selected.result.fingerprint,
				result: selected.result,
			};
			pi.appendEntry(REVIEW_BRANCH_ENTRY, metadata);
			pi.sendMessage(
				{
					customType: 'pullfrog-sanity-report',
					content: formatResult(selected.result),
					display: true,
					details: selected.result,
				},
				{triggerTurn: false},
			);
			await updateState(statePath, (nextState) => {
				const entry =
					nextState.reviews[reviewKey(selected.repository, selected.prNumber)];
				if (entry && entry.result?.fingerprint === metadata.fingerprint) {
					entry.viewed = true;
				}
			});
			reviewMetadata = metadata;
			await renderUi(generation);
		},
	});

	pi.registerCommand('pullfrog-end', {
		description: 'Leave the current Pullfrog review branch',
		handler: async (_args, ctx) => {
			const metadata = getReviewMetadata(ctx);
			if (!metadata) {
				ctx.ui.notify('Not in a Pullfrog review branch', 'info');
				return;
			}
			const choice = await ctx.ui.select('Finish Pullfrog review:', [
				'Return only',
				'Return and carry findings summary',
			]);
			if (!choice) {
				return;
			}
			const result = metadata.result;
			const navigated = await ctx.navigateTree(metadata.originId, {
				summarize: false,
			});
			if (navigated.cancelled) {
				return;
			}
			reviewMetadata = null;
			if (choice === 'Return and carry findings summary' && result) {
				pi.sendMessage(
					{
						customType: 'pullfrog-review-handoff',
						content: formatResult(result),
						display: true,
						details: result,
					},
					{triggerTurn: false},
				);
			}
			await renderUi(generation);
		},
	});
}
