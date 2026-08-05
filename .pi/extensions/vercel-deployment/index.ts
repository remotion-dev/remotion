import type {
	ExtensionAPI,
	ExtensionContext,
} from '@earendil-works/pi-coding-agent';

export const VERCEL_WIDGET_KEY = 'remotion-vercel-deployment';
export const POLL_INTERVAL_MS = 60_000;

const COMMAND_TIMEOUT_MS = 30_000;
const PREVIEW_LABEL = 'Preview ↗';
const OSC_8_CLOSE = '\u001B]8;;\u001B\\';

type DeploymentState = 'ready' | 'pending' | 'failed' | 'unknown';

export type VercelDeployment = {
	prNumber: number;
	previewUrl: string;
	deploymentUrl: string;
	state: DeploymentState;
};

type VercelProject = Omit<VercelDeployment, 'prNumber'>;

type PullRequestComment = {
	author?: {login?: string};
	body?: string;
	createdAt?: string;
};

const safeUrl = (
	value: unknown,
	isAllowed: (url: URL) => boolean,
): string | null => {
	if (typeof value !== 'string' || /[\u0000-\u001f\u007f-\u009f]/.test(value)) {
		return null;
	}

	try {
		const url = new URL(value);
		if (
			url.protocol !== 'https:' ||
			url.username ||
			url.password ||
			!isAllowed(url)
		) {
			return null;
		}
		return url.toString();
	} catch {
		return null;
	}
};

const safePreviewUrl = (value: unknown) =>
	safeUrl(value, (url) => url.hostname.endsWith('.vercel.app'));

const safeDeploymentUrl = (value: unknown) =>
	safeUrl(
		value,
		(url) =>
			url.hostname === 'vercel.com' &&
			url.pathname.startsWith('/remotion/remotion/'),
	);

const deploymentState = (value: unknown): DeploymentState => {
	if (typeof value !== 'string') {
		return 'unknown';
	}

	const normalized = value.trim().toUpperCase().replaceAll(' ', '_');
	if (normalized === 'READY' || normalized === 'DEPLOYED') {
		return 'ready';
	}
	if (['BUILDING', 'QUEUED', 'INITIALIZING', 'PENDING'].includes(normalized)) {
		return 'pending';
	}
	if (['ERROR', 'FAILED', 'CANCELED', 'CANCELLED'].includes(normalized)) {
		return 'failed';
	}
	return 'unknown';
};

const parseMarkdownProject = (body: string): VercelProject | null => {
	for (const line of body.split(/\r?\n/)) {
		if (!line.includes('[remotion](https://vercel.com/remotion/remotion)')) {
			continue;
		}

		const previewMatch = line.match(/\[Preview\]\((https:\/\/[^)\s]+)\)/i);
		const deploymentMatch = line.match(
			/\[([^\]]+)\]\((https:\/\/vercel\.com\/remotion\/remotion\/[^)\s]+)\)/i,
		);
		const previewUrl = safePreviewUrl(previewMatch?.[1]);
		const deploymentUrl = safeDeploymentUrl(deploymentMatch?.[2]);
		if (!previewUrl || !deploymentUrl) {
			continue;
		}

		return {
			previewUrl,
			deploymentUrl,
			state: deploymentState(deploymentMatch?.[1]),
		};
	}

	return null;
};

const parseEncodedProject = (body: string): VercelProject | null => {
	const encoded = body.match(/^\[vc\]: #[^:\r\n]+:([A-Za-z0-9+/_=-]+)$/m)?.[1];
	if (!encoded) {
		return null;
	}

	try {
		const value = JSON.parse(
			Buffer.from(encoded, 'base64').toString('utf8'),
		) as {
			projects?: Array<{
				name?: unknown;
				inspectorUrl?: unknown;
				previewUrl?: unknown;
				nextCommitStatus?: unknown;
			}>;
		};
		const project = value.projects?.find(
			(candidate) => candidate.name === 'remotion',
		);
		const rawPreviewUrl =
			typeof project?.previewUrl === 'string' &&
			!project.previewUrl.startsWith('https://')
				? `https://${project.previewUrl}`
				: project?.previewUrl;
		const previewUrl = safePreviewUrl(rawPreviewUrl);
		const deploymentUrl = safeDeploymentUrl(project?.inspectorUrl);
		if (!previewUrl || !deploymentUrl) {
			return null;
		}

		return {
			previewUrl,
			deploymentUrl,
			state: deploymentState(project?.nextCommitStatus),
		};
	} catch {
		return null;
	}
};

export const parseVercelComment = (body: string): VercelProject | null => {
	return parseMarkdownProject(body) ?? parseEncodedProject(body);
};

const isVercelComment = (comment: PullRequestComment) => {
	const login = comment.author?.login?.toLowerCase();
	return login === 'vercel' || login === 'vercel[bot]';
};

export const fetchVercelDeployment = async ({
	pi,
	cwd,
}: {
	pi: ExtensionAPI;
	cwd: string;
}): Promise<VercelDeployment | null> => {
	const result = await pi.exec(
		'gh',
		['pr', 'view', '--json', 'number,state,comments'],
		{cwd, timeout: COMMAND_TIMEOUT_MS},
	);
	if (result.code !== 0) {
		return null;
	}

	try {
		const pullRequest = JSON.parse(result.stdout) as {
			number?: unknown;
			state?: unknown;
			comments?: PullRequestComment[];
		};
		if (
			pullRequest.state !== 'OPEN' ||
			typeof pullRequest.number !== 'number' ||
			!Number.isSafeInteger(pullRequest.number) ||
			pullRequest.number <= 0
		) {
			return null;
		}

		const comments = [...(pullRequest.comments ?? [])]
			.filter(isVercelComment)
			.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
		for (const comment of comments) {
			const project = parseVercelComment(comment.body ?? '');
			if (project) {
				return {
					prNumber: pullRequest.number,
					...project,
				};
			}
		}
		return null;
	} catch {
		return null;
	}
};

const terminalLink = (label: string, url: string) =>
	`\u001B]8;;${url}\u001B\\${label}${OSC_8_CLOSE}`;

const presentWidget = (
	ctx: ExtensionContext,
	deployment: VercelDeployment | null,
) => {
	ctx.ui.setWidget(
		VERCEL_WIDGET_KEY,
		deployment
			? (_tui, theme) => ({
					render(width: number) {
						const availableWidth = Math.max(0, Math.floor(width));
						if (availableWidth === 0) {
							return [''];
						}

						const status =
							deployment.state === 'ready'
								? {color: 'success' as const, symbol: '✓'}
								: deployment.state === 'pending'
									? {color: 'warning' as const, symbol: '…'}
									: deployment.state === 'failed'
										? {color: 'error' as const, symbol: '×'}
										: {color: 'dim' as const, symbol: '·'};
						const fullLabel = `Vercel ${status.symbol} ${PREVIEW_LABEL}`;
						if ([...fullLabel].length <= availableWidth) {
							const line = `${theme.fg('dim', 'Vercel')} ${theme.fg(
								status.color,
								status.symbol,
							)} ${terminalLink(
								theme.fg('mdLink', PREVIEW_LABEL),
								deployment.previewUrl,
							)}`;
							return [
								`${' '.repeat(availableWidth - [...fullLabel].length)}${line}`,
							];
						}

						const compactLabel = [...PREVIEW_LABEL]
							.slice(0, availableWidth)
							.join('');
						return [
							`${' '.repeat(
								availableWidth - [...compactLabel].length,
							)}${terminalLink(
								theme.fg('mdLink', compactLabel),
								deployment.previewUrl,
							)}`,
						];
					},
					invalidate() {},
				})
			: undefined,
		// Work-context owns a separate widget in this placement. Keeping a
		// distinct key lets Pi stack both without either extension replacing the
		// other, while right alignment makes the two rows read as one status area.
		{placement: 'belowEditor'},
	);
};

export default function remotionVercelDeployment(pi: ExtensionAPI) {
	let generation = 0;
	let activeContext: ExtensionContext | null = null;
	let timer: ReturnType<typeof setInterval> | undefined;
	let refreshRunning: Promise<void> | null = null;
	let refreshQueued = false;

	const stopTimer = () => {
		if (timer) {
			clearInterval(timer);
			timer = undefined;
		}
	};

	const requestRefresh = (ctx: ExtensionContext) => {
		if (ctx.mode !== 'tui' || activeContext !== ctx) {
			return;
		}
		if (refreshRunning) {
			refreshQueued = true;
			return;
		}

		const expectedGeneration = generation;
		const refresh = fetchVercelDeployment({pi, cwd: ctx.cwd})
			.then((deployment) => {
				if (expectedGeneration === generation && activeContext === ctx) {
					presentWidget(ctx, deployment);
				}
			})
			.catch(() => {
				// GitHub and Vercel discovery is best-effort. The next refresh retries.
			})
			.finally(() => {
				if (refreshRunning !== refresh) {
					return;
				}
				refreshRunning = null;
				if (
					refreshQueued &&
					expectedGeneration === generation &&
					activeContext === ctx
				) {
					refreshQueued = false;
					requestRefresh(ctx);
				}
			});
		refreshRunning = refresh;
	};

	pi.on('session_start', (_event, ctx) => {
		generation++;
		stopTimer();
		activeContext = ctx;
		refreshRunning = null;
		refreshQueued = false;
		if (ctx.mode !== 'tui') {
			return;
		}

		presentWidget(ctx, null);
		requestRefresh(ctx);
		timer = setInterval(() => requestRefresh(ctx), POLL_INTERVAL_MS);
		timer.unref?.();
	});

	pi.on('agent_settled', (_event, ctx) => {
		requestRefresh(ctx);
	});

	pi.on('session_shutdown', (_event, ctx) => {
		generation++;
		stopTimer();
		activeContext = null;
		refreshRunning = null;
		refreshQueued = false;
		if (ctx.mode === 'tui') {
			ctx.ui.setWidget(VERCEL_WIDGET_KEY, undefined);
		}
	});
}
