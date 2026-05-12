import {existsSync} from 'node:fs';
import {readdir, readFile, stat} from 'node:fs/promises';
import {dirname, extname, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {runCommand} from './command';
import {runSkillEvalComparison} from './compare';
import type {SkillEvalComparison, SkillEvalManifest} from './manifest';
import {scenarios, type SkillEvalScenario} from './scenarios';

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
const runningScenarios = new Set<string>();

const escapeHtml = (value: string) =>
	value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');

const readJson = async <T>(file: string): Promise<T> => {
	return JSON.parse(await readFile(file, 'utf-8')) as T;
};

const listFilesRecursively = async (dir: string): Promise<string[]> => {
	if (!existsSync(dir)) {
		return [];
	}

	const entries = await readdir(dir, {withFileTypes: true});
	const files = await Promise.all(
		entries.map((entry) => {
			const absolutePath = join(dir, entry.name);

			if (entry.isDirectory()) {
				if (entry.name === 'node_modules') {
					return [];
				}

				return listFilesRecursively(absolutePath);
			}

			return [absolutePath];
		}),
	);

	return files.flat().sort();
};

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

const html = ({body, title}: {body: string; title: string}) => `<!doctype html>
<html>
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>${escapeHtml(title)}</title>
	<style>
		:root {
			color-scheme: light;
			font-family: Inter, ui-sans-serif, system-ui, sans-serif;
		}
		* { box-sizing: border-box; }
		body {
			background: #fafafa;
			color: #18181b;
			margin: 0;
		}
		a {
			color: inherit;
			font-weight: 520;
			text-decoration: none;
		}
		a:hover { color: #09090b; }
		h1 {
			font-size: 28px;
			font-weight: 650;
			letter-spacing: -0.04em;
			margin: 0;
		}
		h2 {
			font-size: 15px;
			font-weight: 620;
			letter-spacing: -0.01em;
			margin: 0;
		}
		p {
			color: #71717a;
			font-size: 14px;
			margin: 0;
		}
		pre {
			background: #f4f4f5;
			border: 1px solid #e4e4e7;
			border-radius: 12px;
			color: #3f3f46;
			font-size: 12px;
			line-height: 1.5;
			margin: 12px 0 0;
			max-height: 300px;
			overflow: auto;
			padding: 12px;
			white-space: pre-wrap;
		}
		button {
			background: #18181b;
			border: 0;
			border-radius: 999px;
			color: #fff;
			cursor: pointer;
			font: inherit;
			font-size: 13px;
			font-weight: 620;
			padding: 8px 13px;
		}
		button:hover { background: #27272a; }
		button:disabled {
			background: #d4d4d8;
			color: #71717a;
			cursor: progress;
		}
		.app-shell {
			isolation: isolate;
			margin: 0 auto;
			max-width: 1180px;
			min-width: 0;
			padding: 32px 24px 48px;
		}
		.topbar {
			align-items: flex-start;
			display: flex;
			gap: 20px;
			justify-content: space-between;
			margin-bottom: 22px;
		}
		.eyebrow {
			color: #a1a1aa;
			font-size: 13px;
			font-weight: 560;
			margin-bottom: 8px;
		}
		.stack {
			display: grid;
			gap: 14px;
			min-width: 0;
		}
		.grid {
			display: grid;
			gap: 12px;
		}
		.scenario-grid { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
		.card {
			background: #fff;
			border: 1px solid #e4e4e7;
			border-radius: 18px;
			min-width: 0;
			padding: 16px;
		}
		.card-link:hover {
			border-color: #d4d4d8;
			box-shadow: 0 12px 30px rgba(24, 24, 27, 0.06);
		}
		.card-header {
			align-items: flex-start;
			display: flex;
			gap: 12px;
			justify-content: space-between;
		}
		.card-title {
			display: grid;
			gap: 4px;
			min-width: 0;
		}
		.meta, .links {
			align-items: center;
			display: flex;
			flex-wrap: wrap;
			gap: 8px;
			margin-top: 12px;
		}
		.meta span {
			color: #71717a;
			font-size: 12px;
		}
		.pill {
			background: #f4f4f5;
			border-radius: 999px;
			color: #52525b;
			font-size: 12px;
			padding: 4px 8px;
		}
		.link-row {
			align-items: center;
			display: flex;
			flex-wrap: wrap;
			gap: 12px;
		}
		.section-offset { margin-top: 12px; }
		.section-offset-lg { margin-top: 14px; }
		.secondary-link {
			color: #52525b;
			font-size: 13px;
		}
		.primary-link {
			color: #18181b;
			font-size: 13px;
		}
		.subtle {
			color: #a1a1aa;
			font-size: 12px;
		}
		.artifacts {
			display: grid;
			gap: 12px;
			grid-template-columns: 1fr 1fr;
		}
		.artifact-card {
			background: #fff;
			border: 1px solid #e4e4e7;
			border-radius: 16px;
			padding: 10px;
		}
		.artifact-top {
			align-items: center;
			display: flex;
			justify-content: space-between;
			margin-bottom: 8px;
		}
		video, img, .empty-artifact {
			aspect-ratio: 16 / 9;
			background: #18181b;
			border-radius: 12px;
			display: grid;
			object-fit: contain;
			place-items: center;
			width: 100%;
		}
		.empty-artifact {
			color: #a1a1aa;
			font-size: 13px;
		}
		.caption {
			color: #71717a;
			font-size: 12px;
			margin-top: 8px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		details {
			background: #fff;
			border: 1px solid #e4e4e7;
			border-radius: 16px;
			min-width: 0;
			padding: 14px;
		}
		summary {
			color: #27272a;
			cursor: pointer;
			font-size: 14px;
			font-weight: 620;
		}
		.diff-rendered {
			background: #fafafa;
			border: 1px solid #e4e4e7;
			border-radius: 12px;
			font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
			font-size: 12px;
			line-height: 1.45;
			margin: 12px 0 0;
			max-height: 520px;
			max-width: 100%;
			min-width: 0;
			overflow: auto;
		}
		.diff-file { border-top: 1px solid #e4e4e7; padding: 10px 0; }
		.diff-file:first-child { border-top: 0; }
		.diff-file-header { color: #27272a; font-weight: 620; padding: 0 12px 8px; }
		.diff-hunk-header {
			background: #f4f4f5;
			color: #71717a;
			padding: 2px 12px;
			white-space: pre;
		}
		.diff-line {
			display: grid;
			grid-template-columns: 22px 1fr;
			min-width: max-content;
			padding: 0 12px;
			white-space: pre;
		}
		.diff-line-prefix { color: #a1a1aa; user-select: none; }
		.diff-line-added { background: #ecfdf5; color: #166534; }
		.diff-line-removed { background: #fef2f2; color: #991b1b; }
		.diff-line-context { color: #3f3f46; }
		.status {
			color: #854d0e;
			font-size: 13px;
			margin-top: 12px;
		}
		.job-log {
			max-height: 360px;
			white-space: pre-wrap;
		}
		@media (max-width: 900px) {
			.app-shell { padding: 24px 16px 36px; }
			.topbar { flex-direction: column; }
			.artifacts { grid-template-columns: 1fr; }
		}
	</style>
</head>
<body>
<div class="app-shell">
${body}
</div>
</body>
</html>`;

const renderArtifact = (manifest: SkillEvalManifest) => {
	const artifact = getPreferredArtifact(manifest);

	if (!artifact) {
		return '<div class="empty-artifact">No visual artifact found</div>';
	}

	const href = toFileUrl(artifact.path);

	if (artifact.type === 'image') {
		return `<a href="${href}"><img src="${href}" alt="${escapeHtml(
			artifact.relativePath,
		)}" /></a>`;
	}

	return `<video src="${href}" controls preload="metadata"></video>`;
};

const renderRunPanel = ({
	label,
	manifest,
	manifestPath,
}: {
	label: string;
	manifest: SkillEvalManifest;
	manifestPath: string;
}) => {
	const artifact = getPreferredArtifact(manifest);

	return `<section class="artifact-card">
		<div class="artifact-top">
			<h2>${escapeHtml(label)}</h2>
			<div class="link-row">
				<a class="secondary-link" href="${toFileUrl(manifest.pi.htmlExport)}">Pi export</a>
				<a class="secondary-link" href="${toFileUrl(manifestPath)}">Manifest</a>
			</div>
		</div>
		${renderArtifact(manifest)}
		<div class="caption">${escapeHtml(artifact?.relativePath ?? 'No artifact')}</div>
	</section>`;
};

const renderScenarioCard = ({
	latest,
	scenario,
}: {
	latest: SkillEvalComparison | undefined;
	scenario: SkillEvalScenario;
}) => `
	<article class="card card-link">
		<div class="card-header">
			<div class="card-title">
				<h2><a href="/scenarios/${encodeURIComponent(scenario.id)}">${escapeHtml(
					scenario.id,
				)}</a></h2>
				<p>${escapeHtml(scenario.model)}</p>
			</div>
			<span class="pill">${latest ? 'Ready' : 'New'}</span>
		</div>
		${
			latest
				? `<p class="subtle section-offset-lg">Last run ${escapeHtml(
						formatDate(latest.completedAt),
					)}</p>
					<div class="link-row section-offset">
						<a class="primary-link" href="${toComparisonUrl(
							latest,
						)}">Latest comparison</a>
						<a class="secondary-link" href="/scenarios/${encodeURIComponent(
							scenario.id,
						)}">Scenario</a>
					</div>`
				: `<p class="subtle section-offset-lg">No comparisons yet.</p>
					<div class="link-row section-offset">
						<a class="primary-link" href="/scenarios/${encodeURIComponent(
							scenario.id,
						)}">Open scenario</a>
					</div>`
		}
	</article>`;

const renderHome = async () => {
	const latest = await getLatestComparisonByScenario();

	return html({
		body: `<header class="topbar">
			<div>
				<p class="eyebrow">Skills evals</p>
				<h1>Remotion Skills Evals</h1>
				<p>Run scenario-scoped skill comparisons and review the results.</p>
			</div>
		</header>
		<main class="grid scenario-grid">
			${scenarios
				.map((scenario) =>
					renderScenarioCard({latest: latest.get(scenario.id), scenario}),
				)
				.join('\n')}
		</main>`,
		title: 'Remotion Skills Evals',
	});
};

const renderScenario = async (scenario: SkillEvalScenario) => {
	const activeJob = getActiveJob(scenario.id);
	const latest = (await getLatestComparisonByScenario()).get(scenario.id);

	return html({
		body: `<header class="topbar">
			<div>
				<p class="eyebrow">Scenario</p>
				<h1>${escapeHtml(scenario.id)}</h1>
				<p>${escapeHtml(scenario.model)}</p>
			</div>
			<button id="run-comparison" data-scenario="${escapeHtml(
				scenario.id,
			)}">Run comparison</button>
		</header>
		<main class="stack">
		<section class="card">
			<div class="card-header">
				<div class="card-title">
					<h2>Latest comparison</h2>
					${
						latest
							? `<p>Completed ${escapeHtml(formatDate(latest.completedAt))}</p>`
							: '<p>No comparisons yet.</p>'
					}
				</div>
				${
					latest
						? `<a class="primary-link" href="${toComparisonUrl(
								latest,
							)}">Open latest</a>`
						: ''
				}
			</div>
			${
				latest
					? `<p class="subtle section-offset">${escapeHtml(
							latest.before.hash,
						)} -> ${escapeHtml(latest.after.hash)}</p>`
					: ''
			}
			<p id="job-status" class="status">${
				activeJob ? escapeHtml(activeJob.message ?? activeJob.status) : ''
			}</p>
			<pre id="job-log" class="job-log" ${
				activeJob?.logs.length ? '' : 'hidden'
			}>${escapeHtml(activeJob?.logs.join('') ?? '')}</pre>
		</section>
		<details>
			<summary>Prompt</summary>
			<pre>${escapeHtml(scenario.prompt)}</pre>
		</details>
		</main>
		<script>
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
		</script>`,
		title: scenario.id,
	});
};

const renderComparison = (comparisonData: ComparisonWithManifests) => {
	const {afterManifest, beforeManifest, comparison, skillDiff} = comparisonData;

	return html({
		body: `<header class="topbar">
			<div>
				<p class="eyebrow">Comparison</p>
				<h1>${escapeHtml(comparison.scenarioId)}</h1>
				<p>${escapeHtml(beforeManifest.model)}</p>
			</div>
			<div class="link-row">
				<span class="pill">${escapeHtml(formatDate(comparison.completedAt))}</span>
				<a class="secondary-link" href="/scenarios/${encodeURIComponent(
					comparison.scenarioId,
				)}">Scenario</a>
			</div>
		</header>
		<main class="stack">
			<div class="artifacts">
				${renderRunPanel({
					label: 'Before',
					manifest: beforeManifest,
					manifestPath: comparison.before.manifestPath,
				})}
				${renderRunPanel({
					label: 'After',
					manifest: afterManifest,
					manifestPath: comparison.after.manifestPath,
				})}
			</div>
			<details open>
				<summary>Skill diff</summary>
				<div id="rendered-diff" class="diff-rendered" hidden></div>
				<pre id="raw-diff">${escapeHtml(skillDiff)}</pre>
			</details>
			<details>
				<summary>Prompt</summary>
				<pre>${escapeHtml(afterManifest.prompt)}</pre>
			</details>
		</main>
		<script src="https://cdn.jsdelivr.net/npm/diff@5/dist/diff.min.js"></script>
		<script>
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
						return 'diff-line-added';
					}

					if (line.startsWith('-')) {
						return 'diff-line-removed';
					}

					return 'diff-line-context';
				};

				renderedDiff.replaceChildren(
					...patches.map((patch) => {
						const file = document.createElement('section');
						file.className = 'diff-file';
						const header = document.createElement('div');
						header.className = 'diff-file-header';
						header.textContent = patch.newFileName || patch.oldFileName || 'Diff';
						file.append(header);

						for (const hunk of patch.hunks) {
							const hunkHeader = document.createElement('div');
							hunkHeader.className = 'diff-hunk-header';
							hunkHeader.textContent = '@@ -' + hunk.oldStart + ',' + hunk.oldLines + ' +' + hunk.newStart + ',' + hunk.newLines + ' @@';
							file.append(hunkHeader);

							for (const line of hunk.lines) {
								const row = document.createElement('div');
								row.className = 'diff-line ' + lineClass(line);
								const prefix = document.createElement('span');
								prefix.className = 'diff-line-prefix';
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
		</script>`,
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
	runningScenarios.add(scenario.id);

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
		})
		.finally(() => {
			runningScenarios.delete(scenario.id);
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

			return htmlResponse(await renderComparison(comparisonData));
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
