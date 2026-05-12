import {existsSync} from 'node:fs';
import {mkdir, readdir, readFile, writeFile} from 'node:fs/promises';
import {dirname, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import type {SkillEvalComparison, SkillEvalManifest} from './manifest';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const runsRoot = resolve(packageRoot, '.runs');

const listFilesRecursively = async (dir: string): Promise<string[]> => {
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

const escapeHtml = (value: string) =>
	value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');

const toHref = (fromDir: string, toFile: string) =>
	encodeURI(relative(fromDir, toFile).replaceAll('\\', '/'));

const toComparisonHref = (comparison: SkillEvalComparison) =>
	`http://localhost:4321/comparisons/${encodeURIComponent(
		comparison.scenarioId,
	)}/${encodeURIComponent(comparison.id)}`;

const formatDate = (value: string) =>
	new Intl.DateTimeFormat('en', {
		dateStyle: 'medium',
		timeStyle: 'medium',
	}).format(new Date(value));

const getLatestComparison = async () => {
	const comparisonFiles = (await listFilesRecursively(runsRoot)).filter(
		(file) => file.endsWith('/comparison.json'),
	);
	const comparisons = await Promise.all(
		comparisonFiles.map((comparisonPath) =>
			readFile(comparisonPath, 'utf-8').then(
				(contents) => JSON.parse(contents) as SkillEvalComparison,
			),
		),
	);

	comparisons.sort((a, b) => b.completedAt.localeCompare(a.completedAt));

	return comparisons[0] ?? null;
};

const renderLatestComparison = ({
	comparison,
}: {
	comparison: SkillEvalComparison | null;
}) => {
	if (!comparison) {
		return '';
	}

	return `
		<section class="latest-comparison">
			<div>
				<p class="eyebrow">Latest comparison</p>
				<h2>${escapeHtml(comparison.scenarioId)}</h2>
				<p>${escapeHtml(formatDate(comparison.completedAt))}</p>
			</div>
			<div class="run-meta">
				<span>before ${escapeHtml(comparison.before.hash)}</span>
				<span>after ${escapeHtml(comparison.after.hash)}</span>
			</div>
			<a class="primary-link" href="${toComparisonHref(comparison)}">Open in app</a>
		</section>`;
};

const renderArtifact = ({
	artifact,
	outputDir,
}: {
	artifact: SkillEvalManifest['artifacts'][number];
	outputDir: string;
}) => {
	const href = toHref(outputDir, artifact.path);

	if (artifact.type === 'image') {
		return `<a href="${href}"><img src="${href}" alt="${escapeHtml(
			artifact.relativePath,
		)}" /></a>`;
	}

	return `<video src="${href}" controls preload="metadata"></video>`;
};

const renderManifest = ({
	manifest,
	manifestPath,
	outputDir,
}: {
	manifest: SkillEvalManifest;
	manifestPath: string;
	outputDir: string;
}) => {
	const artifacts = manifest.artifacts
		.map(
			(artifact) => `
				<figure>
					${renderArtifact({artifact, outputDir})}
					<figcaption>${escapeHtml(artifact.relativePath)}</figcaption>
				</figure>`,
		)
		.join('\n');

	return `
		<article class="run-card">
			<header class="run-header">
				<div>
					<h2>${escapeHtml(manifest.id)}</h2>
					<p>${escapeHtml(manifest.model)}</p>
				</div>
				<div class="run-meta">
					<span>${escapeHtml(formatDate(manifest.completedAt))}</span>
					<span>skills ${escapeHtml(manifest.skillSnapshot.hash)}</span>
				</div>
			</header>
			<div class="run-body">
				<div class="artifacts">${artifacts}</div>
				<div class="run-details">
					<div class="links">
						<a href="${toHref(outputDir, manifest.pi.htmlExport)}">Pi export</a>
						<a href="${toHref(outputDir, manifestPath)}">Manifest</a>
					</div>
					<details>
						<summary>Prompt</summary>
						<pre>${escapeHtml(manifest.prompt)}</pre>
					</details>
					<details>
						<summary>Logs</summary>
						<div class="links">
							<a href="${toHref(outputDir, manifest.commands.pi.stdoutPath)}">Pi stdout</a>
							<a href="${toHref(outputDir, manifest.commands.pi.stderrPath)}">Pi stderr</a>
						</div>
					</details>
				</div>
			</div>
		</article>`;
};

export const generateGallery = async ({
	outputFile = `${runsRoot}/index.html`,
} = {}) => {
	await mkdir(dirname(outputFile), {recursive: true});

	if (!existsSync(runsRoot)) {
		await writeFile(
			outputFile,
			'<!doctype html><p>No skill eval runs found.</p>\n',
		);
		return outputFile;
	}

	const manifests = (await listFilesRecursively(runsRoot)).filter((file) =>
		file.endsWith('/manifest.json'),
	);
	const outputDir = dirname(outputFile);
	const latestComparison = await getLatestComparison();
	const loadedManifests = await Promise.all(
		manifests.map(async (manifestPath) => ({
			manifest: JSON.parse(
				await readFile(manifestPath, 'utf-8'),
			) as SkillEvalManifest,
			manifestPath,
		})),
	);

	loadedManifests.sort((a, b) =>
		b.manifest.completedAt.localeCompare(a.manifest.completedAt),
	);

	const body = loadedManifests
		.map(({manifest, manifestPath}) =>
			renderManifest({manifest, manifestPath, outputDir}),
		)
		.join('\n');

	await writeFile(
		outputFile,
		`<!doctype html>
<html>
<head>
	<meta charset="utf-8" />
	<title>Remotion Skills Evals</title>
	<style>
		:root { color-scheme: dark; }
		* { box-sizing: border-box; }
		body {
			background: #0b0f19;
			color: #e5e7eb;
			font-family: Inter, ui-sans-serif, system-ui, sans-serif;
			margin: 0;
			padding: 28px;
		}
		h1 { font-size: 24px; letter-spacing: -0.03em; margin: 0 0 18px; }
		a { color: #93c5fd; font-weight: 650; text-decoration: none; }
		a:hover { text-decoration: underline; }
		.eyebrow {
			color: #93c5fd;
			font-size: 12px;
			font-weight: 800;
			letter-spacing: 0.08em;
			margin: 0 0 4px;
			text-transform: uppercase;
		}
		pre {
			background: rgba(15, 23, 42, 0.82);
			border: 1px solid rgba(148, 163, 184, 0.18);
			border-radius: 10px;
			color: #cbd5e1;
			font-size: 12px;
			line-height: 1.45;
			margin: 10px 0 0;
			max-height: 160px;
			overflow: auto;
			padding: 12px;
			white-space: pre-wrap;
		}
		details { border-top: 1px solid rgba(148, 163, 184, 0.16); padding-top: 10px; }
		summary { color: #cbd5e1; cursor: pointer; font-size: 13px; font-weight: 700; }
		.latest-comparison {
			align-items: center;
			background: linear-gradient(180deg, rgba(37, 99, 235, 0.22), rgba(15, 23, 42, 0.72));
			border: 1px solid rgba(147, 197, 253, 0.28);
			border-radius: 16px;
			box-shadow: 0 16px 60px rgba(0, 0, 0, 0.24);
			display: grid;
			gap: 14px;
			grid-template-columns: 1fr auto auto;
			margin-bottom: 14px;
			padding: 14px;
		}
		.latest-comparison h2 {
			font-size: 19px;
			letter-spacing: -0.02em;
			margin: 0 0 4px;
		}
		.latest-comparison p { color: #94a3b8; margin: 0; }
		.primary-link {
			background: #93c5fd;
			border-radius: 999px;
			color: #0f172a;
			display: inline-flex;
			font-size: 13px;
			font-weight: 800;
			padding: 8px 12px;
		}
		.primary-link:hover { text-decoration: none; }
		.run-card {
			background: linear-gradient(180deg, rgba(30, 41, 59, 0.76), rgba(15, 23, 42, 0.72));
			border: 1px solid rgba(148, 163, 184, 0.18);
			border-radius: 16px;
			box-shadow: 0 16px 60px rgba(0, 0, 0, 0.24);
			margin-bottom: 14px;
			padding: 14px;
		}
		.run-header {
			align-items: flex-start;
			display: flex;
			gap: 16px;
			justify-content: space-between;
			margin-bottom: 12px;
		}
		.run-header h2 { font-size: 18px; letter-spacing: -0.02em; margin: 0 0 4px; }
		.run-header p { color: #94a3b8; font-size: 13px; margin: 0; }
		.run-meta {
			color: #94a3b8;
			display: flex;
			flex-wrap: wrap;
			font-size: 12px;
			gap: 8px;
			justify-content: flex-end;
		}
		.run-meta span {
			background: rgba(15, 23, 42, 0.74);
			border: 1px solid rgba(148, 163, 184, 0.14);
			border-radius: 999px;
			padding: 5px 9px;
		}
		.run-body { display: grid; gap: 14px; grid-template-columns: minmax(260px, 420px) 1fr; }
		.run-details { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
		.links { display: flex; flex-wrap: wrap; gap: 10px; }
		.artifacts { display: grid; gap: 10px; }
		figure { margin: 0; min-width: 0; }
		video, img {
			aspect-ratio: 16 / 9;
			background: #020617;
			border: 1px solid rgba(148, 163, 184, 0.18);
			border-radius: 12px;
			display: block;
			object-fit: contain;
			width: 100%;
		}
		figcaption {
			color: #94a3b8;
			font-size: 12px;
			margin-top: 6px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		@media (max-width: 820px) {
			body { padding: 18px; }
			.latest-comparison { grid-template-columns: 1fr; }
			.run-body { grid-template-columns: 1fr; }
			.run-header { flex-direction: column; }
			.run-meta { justify-content: flex-start; }
		}
	</style>
</head>
<body>
	<h1>Remotion Skills Evals</h1>
	${renderLatestComparison({comparison: latestComparison})}
	${body || '<p>No skill eval runs found.</p>'}
</body>
</html>
`,
	);

	return outputFile;
};
