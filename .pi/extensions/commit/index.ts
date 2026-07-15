import {readFile} from 'node:fs/promises';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import type {
	ExtensionAPI,
	ExtensionCommandContext,
} from '@earendil-works/pi-coding-agent';

const MESSAGE_TYPE = 'remotion-commit-result';
const PROMPT_MESSAGE_TYPE = 'remotion-commit-worker-prompt';
const STATUS_KEY = 'remotion-commit';
const WORKER_STATUSES = [
	'committed',
	'updated_pr',
	'no_changes',
	'failed',
] as const;
const RESULT_FIELDS = [
	'status',
	'commit',
	'pr',
	'verification',
	'notes',
] as const;

type CommitDisplayStatus = 'ok' | 'failed';
type WorkerStatus = (typeof WORKER_STATUSES)[number];

interface CommitResultDetails {
	userContext?: string;
	workerLeafId?: string | null;
	status?: CommitDisplayStatus;
}

let commitWorkerRunning = false;
let agentEndWaiter: ((messages: unknown[]) => void) | undefined;
let latestCommitWorkerMessages: unknown[] | undefined;

export default function remotionCommitExtension(pi: ExtensionAPI) {
	pi.on('agent_end', (event) => {
		if (commitWorkerRunning) {
			latestCommitWorkerMessages = event.messages;
		}

		agentEndWaiter?.(event.messages);
		agentEndWaiter = undefined;
	});

	pi.on('context', (event) => {
		return {
			messages: event.messages.filter((message) => {
				const customType = (message as {customType?: string}).customType;
				if (customType === MESSAGE_TYPE) {
					return false;
				}

				if (customType === PROMPT_MESSAGE_TYPE && !commitWorkerRunning) {
					return false;
				}

				return true;
			}),
		};
	});

	const sendResultAtSourceLeaf = async (
		ctx: ExtensionCommandContext,
		sourceLeafId: string | null | undefined,
		message: {
			customType: string;
			content: string;
			display: boolean;
			details?: CommitResultDetails;
		},
	) => {
		if (!ctx.isIdle()) {
			await ctx.waitForIdle();
		}

		pi.sendMessage(message);

		const currentLeafId = ctx.sessionManager.getLeafId();
		if (sourceLeafId && currentLeafId && currentLeafId !== sourceLeafId) {
			await ctx.navigateTree(sourceLeafId, {summarize: false});
		}
	};

	pi.registerCommand('commit', {
		description:
			'Commit changes and create or update a PR. Usage: /commit [optional context]',
		handler: async (args, ctx) => {
			if (commitWorkerRunning) {
				ctx.ui.notify('Commit worker is already running', 'warning');
				return;
			}

			commitWorkerRunning = true;
			const userContext = args?.trim() ?? '';
			let sourceLeafId: string | null | undefined;
			ctx.ui.setStatus(STATUS_KEY, 'waiting for current turn...');

			try {
				await ctx.waitForIdle();
				sourceLeafId = ctx.sessionManager.getLeafId();
				const prompt = await buildWorkerPrompt(userContext);

				ctx.ui.setStatus(STATUS_KEY, 'running in session branch...');
				ctx.ui.notify('Starting commit worker', 'info');

				const agentEnd = waitForNextAgentEndAfterIdle(ctx);
				latestCommitWorkerMessages = undefined;

				pi.sendMessage(
					{
						customType: PROMPT_MESSAGE_TYPE,
						content: prompt,
						display: false,
						details: {userContext},
					},
					{triggerTurn: true, deliverAs: 'followUp'},
				);

				const messages = await agentEnd;
				const workerLeafId = ctx.sessionManager.getLeafId();
				const workerPromptIndex = findLastCustomMessageIndex(
					messages,
					PROMPT_MESSAGE_TYPE,
				);
				const summary =
					workerPromptIndex >= 0
						? extractLastAssistantText(messages, workerPromptIndex)
						: '';
				const assistantError =
					workerPromptIndex >= 0
						? extractLastAssistantError(messages, workerPromptIndex)
						: undefined;

				if (assistantError) {
					if (sourceLeafId && workerLeafId && workerLeafId !== sourceLeafId) {
						await ctx.navigateTree(sourceLeafId, {summarize: false});
					}

					await sendResultAtSourceLeaf(ctx, sourceLeafId, {
						customType: MESSAGE_TYPE,
						content: formatFailure(`Commit worker errored: ${assistantError}`),
						display: true,
						details: {
							userContext,
							workerLeafId,
							status: 'failed',
						},
					});
					ctx.ui.notify(`Commit worker failed:\n${assistantError}`, 'error');
					return;
				}

				if (!summary) {
					if (sourceLeafId && workerLeafId && workerLeafId !== sourceLeafId) {
						await ctx.navigateTree(sourceLeafId, {summarize: false});
					}

					await sendResultAtSourceLeaf(ctx, sourceLeafId, {
						customType: MESSAGE_TYPE,
						content: formatFailure(
							'Commit worker finished without producing a result.',
						),
						display: true,
						details: {
							userContext,
							workerLeafId,
							status: 'failed',
						},
					});
					ctx.ui.notify('Commit worker produced no result', 'error');
					return;
				}

				if (sourceLeafId && workerLeafId && workerLeafId !== sourceLeafId) {
					const navigation = await ctx.navigateTree(sourceLeafId, {
						summarize: false,
					});
					if (navigation.cancelled) {
						pi.sendMessage({
							customType: MESSAGE_TYPE,
							content: formatFailure(
								'Commit worker finished, but returning to the original session branch was cancelled.',
							),
							display: true,
							details: {
								userContext,
								workerLeafId,
								status: 'failed',
							},
						});
						ctx.ui.notify(
							'Commit finished, but session tree navigation was cancelled',
							'warning',
						);
						return;
					}
				}

				const workerResult = parseWorkerResult(summary);
				if (!workerResult) {
					await sendResultAtSourceLeaf(ctx, sourceLeafId, {
						customType: MESSAGE_TYPE,
						content: formatFailure(
							'Commit worker returned a malformed result. Inspect its session-tree branch for details.',
						),
						display: true,
						details: {
							userContext,
							workerLeafId,
							status: 'failed',
						},
					});
					ctx.ui.notify('Commit worker returned a malformed result', 'error');
					return;
				}

				await sendResultAtSourceLeaf(ctx, sourceLeafId, {
					customType: MESSAGE_TYPE,
					content: workerResult.content,
					display: true,
					details: {
						userContext,
						workerLeafId,
						status: workerResult.displayStatus,
					},
				});
				ctx.ui.notify(
					workerResult.displayStatus === 'failed'
						? `Commit worker failed:\n${workerResult.content}`
						: `Commit worker finished:\n${workerResult.content}`,
					workerResult.displayStatus === 'failed' ? 'error' : 'info',
				);
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				if (sourceLeafId) {
					await ctx.navigateTree(sourceLeafId, {summarize: false});
				}

				await sendResultAtSourceLeaf(ctx, sourceLeafId, {
					customType: MESSAGE_TYPE,
					content: formatFailure(`Commit worker failed: ${message}`),
					display: true,
					details: {userContext, status: 'failed'},
				});
				ctx.ui.notify(`Commit worker failed:\n${message}`, 'error');
			} finally {
				ctx.ui.setStatus(STATUS_KEY, undefined);
				commitWorkerRunning = false;
				agentEndWaiter = undefined;
				latestCommitWorkerMessages = undefined;
			}
		},
	});
}

const buildWorkerPrompt = async (userContext: string) => {
	const extensionDirectory = dirname(fileURLToPath(import.meta.url));
	const template = await readFile(
		join(extensionDirectory, 'worker-prompt.md'),
		'utf8',
	);

	return template.replaceAll(
		'{{userContext}}',
		() => userContext || '(none provided)',
	);
};

const waitForNextAgentEndAfterIdle = (ctx: ExtensionCommandContext) => {
	return new Promise<unknown[]>((resolve) => {
		agentEndWaiter = (messages) => {
			void (async () => {
				if (!ctx.isIdle()) {
					await ctx.waitForIdle();
				}

				resolve(latestCommitWorkerMessages ?? messages);
			})();
		};
	});
};

const parseWorkerResult = (content: string) => {
	const lines = content.trim().split(/\r?\n/);
	if (lines.length !== RESULT_FIELDS.length) {
		return null;
	}

	for (let index = 0; index < RESULT_FIELDS.length; index++) {
		const prefix = `${RESULT_FIELDS[index]}: `;
		if (
			!lines[index].startsWith(prefix) ||
			!lines[index].slice(prefix.length).trim()
		) {
			return null;
		}
	}

	const status = lines[0].slice('status: '.length).trim();
	if (!WORKER_STATUSES.includes(status as WorkerStatus)) {
		return null;
	}

	return {
		content: lines.join('\n'),
		displayStatus: status === 'failed' ? ('failed' as const) : ('ok' as const),
	};
};

const formatFailure = (notes: string) => {
	const singleLineNotes = notes.replace(/\s+/g, ' ').trim();
	return [
		'status: failed',
		'commit: none',
		'pr: none',
		'verification: Not run',
		`notes: ${singleLineNotes}`,
	].join('\n');
};

const findLastCustomMessageIndex = (
	messages: unknown[],
	customType: string,
) => {
	for (let index = messages.length - 1; index >= 0; index--) {
		const message = messages[index] as {customType?: string};
		if (message.customType === customType) {
			return index;
		}
	}

	return -1;
};

const extractLastAssistantText = (messages: unknown[], afterIndex = -1) => {
	const message = findLastAssistantMessage(messages, afterIndex);
	return message ? extractTextFromContent(message.content).trim() : '';
};

const extractLastAssistantError = (messages: unknown[], afterIndex = -1) => {
	const message = findLastAssistantMessage(messages, afterIndex);
	if (message?.stopReason !== 'error') {
		return undefined;
	}

	return message.errorMessage?.trim() || 'Unknown provider error';
};

const findLastAssistantMessage = (messages: unknown[], afterIndex = -1) => {
	for (let index = messages.length - 1; index > afterIndex; index--) {
		const message = messages[index] as {
			role?: string;
			content?: unknown;
			stopReason?: string;
			errorMessage?: string;
		};
		if (message.role === 'assistant') {
			return message;
		}
	}

	return undefined;
};

const extractTextFromContent = (content: unknown): string => {
	if (typeof content === 'string') {
		return content;
	}

	if (!Array.isArray(content)) {
		return '';
	}

	return content
		.map((part) => {
			if (
				part &&
				typeof part === 'object' &&
				'type' in part &&
				part.type === 'text' &&
				'text' in part &&
				typeof part.text === 'string'
			) {
				return part.text;
			}

			return '';
		})
		.filter(Boolean)
		.join('\n');
};
