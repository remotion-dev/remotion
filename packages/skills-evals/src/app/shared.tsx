import {dirname, isAbsolute, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderToStaticMarkup} from 'react-dom/server';
import type {SkillEvalComparison} from '../manifest';

export const packageRoot = resolve(
	dirname(fileURLToPath(import.meta.url)),
	'..',
	'..',
);
export const repoRoot = resolve(packageRoot, '..', '..');
export const runsRoot = join(packageRoot, '.runs');
export const comparisonsRoot = join(runsRoot, 'comparisons');
export const port = Number(process.env.PORT ?? 4321);
export const origin = `http://localhost:${port}`;

export type RenderMode = 'server' | 'static';

export type RenderOptions = {
	fileHrefPrefix?: string;
	mode?: RenderMode;
};

const defaultRenderOptions = {
	fileHrefPrefix: '/files',
	mode: 'server',
} satisfies Required<RenderOptions>;

export const getRenderOptions = (
	options: RenderOptions | undefined,
): Required<RenderOptions> => ({
	...defaultRenderOptions,
	...options,
});

const joinHref = (prefix: string, path: string) =>
	prefix === '' ? path : `${prefix.replace(/\/$/, '')}/${path}`;

const AppLayout = ({
	children,
	options,
}: {
	children: React.ReactNode;
	options: Required<RenderOptions>;
}) => (
	<div className="isolate mx-auto max-w-6xl px-6 py-6 max-md:px-4">
		{options.mode === 'server' ? (
			<nav className="mb-8 border-b border-zinc-200 pb-4">
				<a
					className="text-[0.8125rem] font-medium text-zinc-500 hover:text-zinc-900"
					href="/"
				>
					Scenarios
				</a>
			</nav>
		) : null}
		{children}
	</div>
);

export const page = ({
	children,
	renderOptions,
	title,
}: {
	children: React.ReactNode;
	renderOptions?: RenderOptions;
	title: string;
}) => {
	const options = getRenderOptions(renderOptions);

	return `<!doctype html>${renderToStaticMarkup(
		<html>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<title>{title}</title>
				<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4" />
			</head>
			<body className="bg-zinc-50 text-zinc-900 antialiased">
				<AppLayout options={options}>{children}</AppLayout>
			</body>
		</html>,
	)}`;
};

export const Header = ({
	action,
	eyebrow,
	subtitle,
	title,
}: {
	action?: React.ReactNode;
	eyebrow?: string;
	subtitle: string;
	title: string;
}) => (
	<header className="mb-6">
		<div className="min-w-0">
			{eyebrow ? (
				<p className="mb-2 text-[0.8125rem] font-medium text-zinc-400">
					{eyebrow}
				</p>
			) : null}
			<div className="flex items-center justify-between gap-5 max-md:flex-col max-md:items-start">
				<h1 className="text-3xl font-semibold tracking-tight text-balance">
					{title}
				</h1>
				{action}
			</div>
			<p className="text-sm text-zinc-500 text-pretty">{subtitle}</p>
		</div>
	</header>
);

export const Card = ({children}: {children: React.ReactNode}) => (
	<section className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4">
		{children}
	</section>
);

export const Pill = ({children}: {children: React.ReactNode}) => (
	<span className="rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-600">
		{children}
	</span>
);

export const formatDate = (value: string) =>
	new Intl.DateTimeFormat('en', {
		dateStyle: 'medium',
		timeStyle: 'medium',
	}).format(new Date(value));

export const formatDuration = (durationMs: number) => {
	const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	if (hours > 0) {
		return `${hours}h ${minutes}m ${seconds}s`;
	}

	if (minutes > 0) {
		return `${minutes}m ${seconds}s`;
	}

	return `${seconds}s`;
};

export const getDurationMs = ({
	completedAt,
	createdAt,
}: {
	completedAt: string;
	createdAt: string;
}) => new Date(completedAt).getTime() - new Date(createdAt).getTime();

export const toFileUrl = (file: string, options?: RenderOptions) => {
	const relativePath = relative(runsRoot, file);

	if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
		throw new Error(`Cannot serve file outside .runs: ${file}`);
	}

	return joinHref(
		getRenderOptions(options).fileHrefPrefix,
		relativePath.split(/[\\/]/).map(encodeURIComponent).join('/'),
	);
};

export const toComparisonUrl = (comparison: SkillEvalComparison) =>
	`/comparisons/${encodeURIComponent(comparison.scenarioId)}/${encodeURIComponent(
		comparison.id,
	)}`;

export const ShareResultButton = ({
	endpoint,
	label = 'Share',
}: {
	endpoint: string;
	label?: string;
}) => (
	<div className="relative">
		<button
			className="rounded-full border border-zinc-200 bg-white px-3 py-2 text-[0.8125rem] font-semibold text-zinc-700 hover:border-zinc-300 disabled:bg-zinc-100 disabled:text-zinc-400"
			data-share-endpoint={endpoint}
			id="share-result"
			type="button"
		>
			{label}
		</button>
		<div
			aria-live="polite"
			className="absolute right-0 top-full z-10 mt-2 w-[min(32rem,calc(100vw-2rem))] rounded-2xl border border-zinc-200 bg-white p-3 text-left shadow-[0_16px_40px_rgba(24,24,27,0.12)]"
			hidden
			id="share-result-output"
		/>
	</div>
);

export const ShareResultScript = () => (
	<script
		dangerouslySetInnerHTML={{
			__html: `
(() => {
	const button = document.getElementById('share-result');
	const output = document.getElementById('share-result-output');

	if (!button || !output) {
		return;
	}

	const closeOutput = () => {
		output.hidden = true;
	};

	const renderOutput = ({command, isError = false, message, title}) => {
		output.hidden = false;
		output.replaceChildren();

		const titleElement = document.createElement('p');
		titleElement.className = isError ? 'text-sm font-semibold text-red-700' : 'text-sm font-semibold text-zinc-900';
		titleElement.textContent = title;
		output.append(titleElement);

		if (message) {
			const messageElement = document.createElement('p');
			messageElement.className = isError ? 'mt-1 text-xs text-red-600' : 'mt-1 text-xs text-zinc-500';
			messageElement.textContent = message;
			output.append(messageElement);
		}

		if (!command) {
			return;
		}

		const commandRow = document.createElement('div');
		commandRow.className = 'mt-3 flex items-start gap-2';

		const commandElement = document.createElement('code');
		commandElement.className = 'min-w-0 flex-1 overflow-auto whitespace-pre rounded-xl bg-zinc-100 px-3 py-2 text-xs text-zinc-700';
		commandElement.textContent = command;
		commandRow.append(commandElement);

		const copyButton = document.createElement('button');
		copyButton.className = 'shrink-0 rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:border-zinc-300';
		copyButton.type = 'button';
		copyButton.textContent = 'Copy';
		copyButton.addEventListener('click', async () => {
			await navigator.clipboard?.writeText(command);
			copyButton.textContent = 'Copied';
			setTimeout(() => {
				copyButton.textContent = 'Copy';
			}, 1500);
		});
		commandRow.append(copyButton);
		output.append(commandRow);
	};

	document.addEventListener('click', (event) => {
		if (output.hidden) {
			return;
		}

		if (button.contains(event.target) || output.contains(event.target)) {
			return;
		}

		closeOutput();
	});

	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') {
			closeOutput();
		}
	});

	button.addEventListener('click', async () => {
		const endpoint = button.dataset.shareEndpoint;

		if (!endpoint) {
			return;
		}

		button.disabled = true;
		renderOutput({
			message: 'Preparing the static files locally.',
			title: 'Building share bundle...',
		});

		try {
			const response = await fetch(endpoint, {method: 'POST'});
			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Could not build share bundle.');
			}

			renderOutput({
				command: result.deployCommand,
				message: 'Static share bundle is ready. Deploy it with Vercel CLI:',
				title: 'Share bundle ready',
			});
		} catch (error) {
			renderOutput({
				isError: true,
				message: error instanceof Error ? error.message : String(error),
				title: 'Could not build share bundle',
			});
		} finally {
			button.disabled = false;
		}
	});
})();
`,
		}}
	/>
);

export const json = (value: unknown, init?: ResponseInit) =>
	new Response(JSON.stringify(value), {
		...init,
		headers: {
			'content-type': 'application/json',
			...init?.headers,
		},
	});

export const htmlResponse = (value: string, init?: ResponseInit) =>
	new Response(value, {
		...init,
		headers: {
			'content-type': 'text/html; charset=utf-8',
			...init?.headers,
		},
	});

export const notFound = () => htmlResponse('Not found', {status: 404});
