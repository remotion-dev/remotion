import {existsSync} from 'node:fs';
import {readFile, stat} from 'node:fs/promises';
import {dirname, extname, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderToStaticMarkup} from 'react-dom/server';
import {scenarios, type SkillEvalScenario} from '../scenarios';
import {runCommand} from './command';
import {runSkillEvalComparison} from './compare';
import {listFilesRecursively, readJson} from './files';
import type {SkillEvalComparison, SkillEvalManifest} from './manifest';

type ComparisonWithManifests = {
	afterManifest: SkillEvalManifest;
	beforeManifest: SkillEvalManifest;
	comparison: SkillEvalComparison;
	skillDiff: string;
};

type Job = {
	id: string;
	logs: string[];
	scenarioId: string;
	startedAt: string;
	status: 'running' | 'completed' | 'failed' | 'skipped';
	comparisonUrl?: string;
	error?: string;
	message?: string;
};

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(packageRoot, '..', '..');
const runsRoot = join(packageRoot, '.runs');
const comparisonsRoot = join(runsRoot, 'comparisons');
const port = Number(process.env.PORT ?? 4321);
const origin = `http://localhost:${port}`;
const jobs = new Map<string, Job>();

const formatDate = (value: string) =>
	new Intl.DateTimeFormat('en', {
		dateStyle: 'medium',
		timeStyle: 'medium',
	}).format(new Date(value));

const toFileUrl = (file: string) => {
	const relativePath = relative(runsRoot, file);

	if (relativePath.startsWith('..')) {
		throw new Error(`Cannot serve file outside .runs: ${file}`);
	}

	return `/files/${relativePath.split(/[\\/]/).map(encodeURIComponent).join('/')}`;
};

const toComparisonUrl = (comparison: SkillEvalComparison) =>
	`/comparisons/${encodeURIComponent(comparison.scenarioId)}/${encodeURIComponent(
		comparison.id,
	)}`;

const getPreferredArtifact = (manifest: SkillEvalManifest) =>
	manifest.artifacts.find((artifact) => artifact.type === 'video') ??
	manifest.artifacts[0];

const loadComparisons = async () => {
	const files = (await listFilesRecursively(comparisonsRoot)).filter((file) =>
		file.endsWith('/comparison.json'),
	);
	const comparisons = await Promise.all(
		files.map((file) => readJson<SkillEvalComparison>(file)),
	);

	comparisons.sort((a, b) => b.completedAt.localeCompare(a.completedAt));

	return comparisons;
};

const getLatestComparisonByScenario = async () => {
	const latest = new Map<string, SkillEvalComparison>();

	for (const comparison of await loadComparisons()) {
		if (!latest.has(comparison.scenarioId)) {
			latest.set(comparison.scenarioId, comparison);
		}
	}

	return latest;
};

const loadComparison = async (
	scenarioId: string,
	comparisonId: string,
): Promise<ComparisonWithManifests | null> => {
	const comparisonPath = join(
		comparisonsRoot,
		scenarioId,
		comparisonId,
		'comparison.json',
	);

	if (!existsSync(comparisonPath)) {
		return null;
	}

	const comparison = await readJson<SkillEvalComparison>(comparisonPath);
	const [beforeManifest, afterManifest, skillDiff] = await Promise.all([
		readJson<SkillEvalManifest>(comparison.before.manifestPath),
		readJson<SkillEvalManifest>(comparison.after.manifestPath),
		readFile(comparison.skillDiffPath, 'utf-8'),
	]);

	return {afterManifest, beforeManifest, comparison, skillDiff};
};

const getScenario = (id: string) =>
	scenarios.find((scenario) => scenario.id === id) ?? null;

const getActiveJob = (scenarioId: string) =>
	[...jobs.values()].find(
		(job) => job.scenarioId === scenarioId && job.status === 'running',
	);

const AppLayout = ({children}: {children: React.ReactNode}) => (
	<div className="isolate mx-auto max-w-6xl px-6 py-6 max-md:px-4">
		<nav className="mb-8 flex items-center justify-between border-b border-zinc-200 pb-4">
			<a className="text-sm font-semibold text-zinc-900" href="/">
				Skills Evals
			</a>
			<a
				className="text-[0.8125rem] font-medium text-zinc-500 hover:text-zinc-900"
				href="/"
			>
				All scenarios
			</a>
		</nav>
		{children}
	</div>
);

const page = ({children, title}: {children: React.ReactNode; title: string}) =>
	`<!doctype html>${renderToStaticMarkup(
		<html>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<title>{title}</title>
				<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4" />
			</head>
			<body className="bg-zinc-50 text-zinc-900 antialiased">
				<AppLayout>{children}</AppLayout>
			</body>
		</html>,
	)}`;

const Header = ({
	action,
	eyebrow,
	subtitle,
	title,
}: {
	action?: React.ReactNode;
	eyebrow: string;
	subtitle: string;
	title: string;
}) => (
	<header className="mb-6 flex items-start justify-between gap-5 max-md:flex-col">
		<div>
			<p className="mb-2 text-[0.8125rem] font-medium text-zinc-400">
				{eyebrow}
			</p>
			<h1 className="text-3xl font-semibold tracking-tight text-balance">
				{title}
			</h1>
			<p className="text-sm text-zinc-500 text-pretty">{subtitle}</p>
		</div>
		{action}
	</header>
);

const Card = ({children}: {children: React.ReactNode}) => (
	<section className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4">
		{children}
	</section>
);

const Pill = ({children}: {children: React.ReactNode}) => (
	<span className="rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-600">
		{children}
	</span>
);

const ScenarioCard = ({
	latest,
	scenario,
}: {
	latest: SkillEvalComparison | undefined;
	scenario: SkillEvalScenario;
}) => (
	<a
		className="block rounded-2xl border border-zinc-200 bg-white p-4 hover:border-zinc-300 hover:shadow-[0_12px_30px_rgba(24,24,27,0.06)]"
		href={`/scenarios/${encodeURIComponent(scenario.id)}`}
	>
		<div className="flex items-start justify-between gap-3">
			<div className="min-w-0">
				<h2 className="text-[0.9375rem] font-semibold">{scenario.id}</h2>
				<p className="text-sm text-zinc-500">{scenario.model}</p>
			</div>
			<Pill>{latest ? 'Ready' : 'New'}</Pill>
		</div>
		<p className="mt-4 text-xs text-zinc-400">
			{latest
				? `Last run ${formatDate(latest.completedAt)}`
				: 'No comparisons yet.'}
		</p>
	</a>
);

const renderHome = async () => {
	const latest = await getLatestComparisonByScenario();

	return page({
		children: (
			<>
				<Header
					eyebrow="Skills evals"
					subtitle="Run scenario-scoped skill comparisons and review the results."
					title="Remotion Skills Evals"
				/>
				<main className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-3">
					{scenarios.map((scenario) => (
						<ScenarioCard
							key={scenario.id}
							latest={latest.get(scenario.id)}
							scenario={scenario}
						/>
					))}
				</main>
			</>
		),
		title: 'Remotion Skills Evals',
	});
};

const ScenarioRuns = ({comparisons}: {comparisons: SkillEvalComparison[]}) => {
	if (comparisons.length === 0) {
		return <p className="text-sm text-zinc-500">No runs yet.</p>;
	}

	return (
		<div className="mt-3 grid">
			{comparisons.map((comparison) => (
				<a
					className="flex items-center justify-between gap-4 border-t border-zinc-100 py-3 first:border-t-0 first:pt-0 last:pb-0"
					href={toComparisonUrl(comparison)}
					key={comparison.id}
				>
					<div>
						<h3 className="text-sm font-semibold text-zinc-800">
							{formatDate(comparison.completedAt)}
						</h3>
						<p className="mt-1 text-[0.8125rem] text-zinc-500">
							{comparison.before.hash} -&gt; {comparison.after.hash}
						</p>
					</div>
					<div className="whitespace-nowrap text-right text-xs text-zinc-400">
						{comparison.before.source ?? 'baseline'}
					</div>
				</a>
			))}
		</div>
	);
};

const ScenarioPageScript = ({activeJob}: {activeJob: Job | undefined}) => (
	<script
		dangerouslySetInnerHTML={{
			__html: `
const button = document.getElementById('run-comparison');
const log = document.getElementById('job-log');
const status = document.getElementById('job-status');
const activeJobId = ${JSON.stringify(activeJob?.id ?? null)};

const poll = async (jobId) => {
	const response = await fetch('/api/jobs/' + encodeURIComponent(jobId));
	const job = await response.json();
	status.textContent = job.message || job.status;
	if (job.logs?.length) {
		log.hidden = false;
		log.textContent = job.logs.join('');
		log.scrollTop = log.scrollHeight;
	}

	if (job.status === 'completed' && job.comparisonUrl) {
		location.href = job.comparisonUrl;
		return;
	}

	if (job.status === 'failed' || job.status === 'skipped') {
		button.disabled = false;
		return;
	}

	setTimeout(() => poll(jobId), 2000);
};

if (activeJobId) {
	button.disabled = true;
	log.hidden = false;
	poll(activeJobId);
}

button?.addEventListener('click', async () => {
	button.disabled = true;
	status.textContent = 'Starting comparison...';
	const response = await fetch('/api/compare/' + encodeURIComponent(button.dataset.scenario), {
		method: 'POST',
	});
	const job = await response.json();
	poll(job.id);
});
`,
		}}
	/>
);

const renderScenario = async (scenario: SkillEvalScenario) => {
	const activeJob = getActiveJob(scenario.id);
	const comparisons = (await loadComparisons()).filter(
		(comparison) => comparison.scenarioId === scenario.id,
	);
	const latest = comparisons[0];

	return page({
		children: (
			<>
				<Header
					action={
						<button
							className="rounded-full bg-zinc-900 px-3 py-2 text-[0.8125rem] font-semibold text-white hover:bg-zinc-800 disabled:bg-zinc-300 disabled:text-zinc-500"
							data-scenario={scenario.id}
							id="run-comparison"
						>
							Run comparison
						</button>
					}
					eyebrow="Scenario"
					subtitle={scenario.model}
					title={scenario.id}
				/>
				<main className="grid min-w-0 gap-4">
					<Card>
						<div>
							<h2 className="text-[0.9375rem] font-semibold">
								Latest comparison
							</h2>
							<p className="text-sm text-zinc-500">
								{latest
									? `Completed ${formatDate(latest.completedAt)}`
									: 'No comparisons yet.'}
							</p>
						</div>
						{latest ? (
							<p className="mt-3 text-xs text-zinc-400">
								{latest.before.hash} -&gt; {latest.after.hash}
							</p>
						) : null}
						<p
							className="mt-3 text-[0.8125rem] text-yellow-700"
							id="job-status"
						>
							{activeJob?.message ?? activeJob?.status ?? ''}
						</p>
						<pre
							className="mt-3 max-h-90 overflow-auto whitespace-pre-wrap rounded-xl border border-zinc-200 bg-zinc-100 p-3 text-xs text-zinc-700"
							hidden={!activeJob?.logs.length}
							id="job-log"
						>
							{activeJob?.logs.join('') ?? ''}
						</pre>
					</Card>
					<Card>
						<h2 className="text-[0.9375rem] font-semibold">Runs</h2>
						<ScenarioRuns comparisons={comparisons} />
					</Card>
					<details className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4">
						<summary className="cursor-pointer text-sm font-semibold">
							Prompt
						</summary>
						<pre className="mt-3 max-h-75 overflow-auto whitespace-pre-wrap rounded-xl border border-zinc-200 bg-zinc-100 p-3 text-xs text-zinc-700">
							{scenario.prompt}
						</pre>
					</details>
				</main>
				<ScenarioPageScript activeJob={activeJob} />
			</>
		),
		title: scenario.id,
	});
};

const Artifact = ({manifest}: {manifest: SkillEvalManifest}) => {
	const artifact = getPreferredArtifact(manifest);

	if (!artifact) {
		return (
			<div className="grid aspect-video place-items-center rounded-xl bg-zinc-900 text-[0.8125rem] text-zinc-400">
				No visual artifact found
			</div>
		);
	}

	const href = toFileUrl(artifact.path);

	if (artifact.type === 'image') {
		return (
			<a href={href}>
				<img
					alt={artifact.relativePath}
					className="aspect-video w-full rounded-xl bg-zinc-900 object-contain"
					src={href}
				/>
			</a>
		);
	}

	return (
		<video
			className="aspect-video w-full rounded-xl bg-zinc-900 object-contain"
			controls
			preload="metadata"
			src={href}
		/>
	);
};

const RunPanel = ({
	label,
	manifest,
	manifestPath,
}: {
	label: string;
	manifest: SkillEvalManifest;
	manifestPath: string;
}) => {
	const artifact = getPreferredArtifact(manifest);

	return (
		<section className="rounded-2xl border border-zinc-200 bg-white p-3">
			<div className="mb-2 flex items-center justify-between gap-3">
				<h2 className="text-[0.9375rem] font-semibold">{label}</h2>
				<div className="flex flex-wrap items-center gap-3">
					<a
						className="text-[0.8125rem] text-zinc-600"
						href={toFileUrl(manifest.pi.htmlExport)}
					>
						Pi export
					</a>
					<a
						className="text-[0.8125rem] text-zinc-600"
						href={toFileUrl(manifestPath)}
					>
						Manifest
					</a>
				</div>
			</div>
			<Artifact manifest={manifest} />
			<div className="mt-2 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-zinc-500">
				{artifact?.relativePath ?? 'No artifact'}
			</div>
		</section>
	);
};

const ComparisonDiffScript = () => (
	<>
		<script src="https://cdn.jsdelivr.net/npm/diff@5/dist/diff.min.js" />
		<script
			dangerouslySetInnerHTML={{
				__html: `
(() => {
	const rawDiff = document.getElementById('raw-diff');
	const renderedDiff = document.getElementById('rendered-diff');

	if (!rawDiff || !renderedDiff || !window.Diff?.parsePatch) {
		return;
	}

	const patches = window.Diff.parsePatch(rawDiff.textContent || '');

	if (patches.length === 0) {
		return;
	}

	const lineClass = (line) => {
		if (line.startsWith('+')) {
			return 'bg-emerald-50 text-green-800';
		}

		if (line.startsWith('-')) {
			return 'bg-red-50 text-red-800';
		}

		return 'text-zinc-700';
	};

	renderedDiff.replaceChildren(
		...patches.map((patch) => {
			const file = document.createElement('section');
			file.className = 'border-t border-zinc-200 py-2 first:border-t-0';
			const header = document.createElement('div');
			header.className = 'px-3 pb-2 font-semibold text-zinc-800';
			header.textContent = patch.newFileName || patch.oldFileName || 'Diff';
			file.append(header);

			for (const hunk of patch.hunks) {
				const hunkHeader = document.createElement('div');
				hunkHeader.className = 'bg-zinc-100 px-3 py-0.5 text-zinc-500 whitespace-pre';
				hunkHeader.textContent = '@@ -' + hunk.oldStart + ',' + hunk.oldLines + ' +' + hunk.newStart + ',' + hunk.newLines + ' @@';
				file.append(hunkHeader);

				for (const line of hunk.lines) {
					const row = document.createElement('div');
					row.className = 'grid grid-cols-[22px_1fr] min-w-max px-3 whitespace-pre ' + lineClass(line);
					const prefix = document.createElement('span');
					prefix.className = 'text-zinc-400 select-none';
					prefix.textContent = line[0] || ' ';
					const content = document.createElement('span');
					content.textContent = line.slice(1);
					row.append(prefix, content);
					file.append(row);
				}
			}

			return file;
		}),
	);
	renderedDiff.hidden = false;
	rawDiff.hidden = true;
})();
`,
			}}
		/>
	</>
);

const renderComparison = (comparisonData: ComparisonWithManifests) => {
	const {afterManifest, beforeManifest, comparison, skillDiff} = comparisonData;

	return page({
		children: (
			<>
				<Header
					action={
						<div className="flex flex-wrap items-center gap-3">
							<Pill>{formatDate(comparison.completedAt)}</Pill>
							<a
								className="text-[0.8125rem] text-zinc-600"
								href={`/scenarios/${encodeURIComponent(comparison.scenarioId)}`}
							>
								Scenario
							</a>
						</div>
					}
					eyebrow="Comparison"
					subtitle={beforeManifest.model}
					title={comparison.scenarioId}
				/>
				<main className="grid min-w-0 gap-4">
					<div className="grid grid-cols-2 gap-3 max-lg:grid-cols-1">
						<RunPanel
							label="Before"
							manifest={beforeManifest}
							manifestPath={comparison.before.manifestPath}
						/>
						<RunPanel
							label="After"
							manifest={afterManifest}
							manifestPath={comparison.after.manifestPath}
						/>
					</div>
					<details
						className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4"
						open
					>
						<summary className="cursor-pointer text-sm font-semibold">
							Skill diff
						</summary>
						<div
							className="mt-3 max-h-130 max-w-full min-w-0 overflow-auto rounded-xl border border-zinc-200 bg-zinc-50 font-mono text-xs"
							hidden
							id="rendered-diff"
						/>
						<pre
							className="mt-3 max-h-130 overflow-auto whitespace-pre-wrap rounded-xl border border-zinc-200 bg-zinc-100 p-3 text-xs text-zinc-700"
							id="raw-diff"
						>
							{skillDiff}
						</pre>
					</details>
					<details className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4">
						<summary className="cursor-pointer text-sm font-semibold">
							Prompt
						</summary>
						<pre className="mt-3 max-h-75 overflow-auto whitespace-pre-wrap rounded-xl border border-zinc-200 bg-zinc-100 p-3 text-xs text-zinc-700">
							{afterManifest.prompt}
						</pre>
					</details>
				</main>
				<ComparisonDiffScript />
			</>
		),
		title: `${comparison.scenarioId} Comparison`,
	});
};

const json = (value: unknown, init?: ResponseInit) =>
	new Response(JSON.stringify(value), {
		...init,
		headers: {
			'content-type': 'application/json',
			...init?.headers,
		},
	});

const htmlResponse = (value: string, init?: ResponseInit) =>
	new Response(value, {
		...init,
		headers: {
			'content-type': 'text/html; charset=utf-8',
			...init?.headers,
		},
	});

const notFound = () => htmlResponse('Not found', {status: 404});

const serveRunFile = async (pathname: string) => {
	const relativePath = decodeURIComponent(pathname.replace(/^\/files\//, ''));
	const file = resolve(runsRoot, relativePath);
	const resolvedRunsRoot = resolve(runsRoot);

	if (!file.startsWith(`${resolvedRunsRoot}/`)) {
		return notFound();
	}

	if (!existsSync(file) || !(await stat(file)).isFile()) {
		return notFound();
	}

	const contentType =
		{
			'.html': 'text/html; charset=utf-8',
			'.json': 'application/json',
			'.jsonl': 'application/x-ndjson',
			'.log': 'text/plain; charset=utf-8',
			'.mp4': 'video/mp4',
			'.png': 'image/png',
			'.webm': 'video/webm',
		}[extname(file)] ?? 'application/octet-stream';

	return new Response(Bun.file(file), {
		headers: {'content-type': contentType},
	});
};

const startComparison = (scenario: SkillEvalScenario) => {
	const existingJob = [...jobs.values()].find(
		(candidate) =>
			candidate.scenarioId === scenario.id && candidate.status === 'running',
	);

	if (existingJob) {
		return existingJob;
	}

	const job: Job = {
		id: `${Date.now()}-${scenario.id}`,
		logs: [],
		message: 'Running comparison...',
		scenarioId: scenario.id,
		startedAt: new Date().toISOString(),
		status: 'running',
	};

	jobs.set(job.id, job);

	const appendLog = (chunk: string) => {
		job.logs.push(chunk);

		if (job.logs.length > 1000) {
			job.logs.splice(0, job.logs.length - 1000);
		}
	};

	const comparisonPromise = runSkillEvalComparison(scenario, {onLog: appendLog})
		.then((result) => {
			if (result.skipped) {
				job.message = result.reason;
				job.status = 'skipped';
				return;
			}

			job.comparisonUrl = toComparisonUrl(result.comparison);
			job.message = 'Comparison complete.';
			job.status = 'completed';
		})
		.catch((error: unknown) => {
			job.error = error instanceof Error ? error.message : String(error);
			job.message = job.error;
			job.status = 'failed';
		});
	comparisonPromise.catch(() => undefined);

	return job;
};

const server = Bun.serve({
	fetch: async (request) => {
		const url = new URL(request.url);
		const {pathname} = url;

		if (pathname === '/') {
			return htmlResponse(await renderHome());
		}

		if (pathname.startsWith('/files/')) {
			return serveRunFile(pathname);
		}

		const scenarioMatch = pathname.match(/^\/scenarios\/([^/]+)$/);
		if (scenarioMatch) {
			const scenario = getScenario(decodeURIComponent(scenarioMatch[1]));

			if (!scenario) {
				return notFound();
			}

			return htmlResponse(await renderScenario(scenario));
		}

		const comparisonMatch = pathname.match(/^\/comparisons\/([^/]+)\/([^/]+)$/);
		if (comparisonMatch) {
			const comparisonData = await loadComparison(
				decodeURIComponent(comparisonMatch[1]),
				decodeURIComponent(comparisonMatch[2]),
			);

			if (!comparisonData) {
				return notFound();
			}

			return htmlResponse(renderComparison(comparisonData));
		}

		const compareMatch = pathname.match(/^\/api\/compare\/([^/]+)$/);
		if (request.method === 'POST' && compareMatch) {
			const scenario = getScenario(decodeURIComponent(compareMatch[1]));

			if (!scenario) {
				return json({error: 'Unknown scenario'}, {status: 404});
			}

			return json(startComparison(scenario));
		}

		const jobMatch = pathname.match(/^\/api\/jobs\/([^/]+)$/);
		if (jobMatch) {
			const job = jobs.get(decodeURIComponent(jobMatch[1]));

			if (!job) {
				return json({error: 'Unknown job'}, {status: 404});
			}

			return json(job);
		}

		return notFound();
	},
	hostname: '127.0.0.1',
	port,
});

process.stdout.write(`Skills eval server running at ${origin}\n`);

if (process.platform === 'darwin' && process.stdout.isTTY && !process.env.CI) {
	const openBrowser = async () => {
		await runCommand({
			command: ['open', origin],
			cwd: repoRoot,
		});
	};

	openBrowser().catch((error: unknown) => {
		process.stderr.write(
			`Could not open browser: ${
				error instanceof Error ? error.message : String(error)
			}\n`,
		);
	});
}

process.on('SIGINT', () => {
	server.stop();
	process.exit(0);
});
