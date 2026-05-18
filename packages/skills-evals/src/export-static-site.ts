import {existsSync} from 'node:fs';
import {cp, mkdir, rm, stat, writeFile} from 'node:fs/promises';
import {
	basename,
	dirname,
	isAbsolute,
	join,
	relative,
	resolve,
} from 'node:path';
import {renderComparison} from './app/comparison';
import {
	loadComparison,
	type ComparisonWithManifests,
} from './app/comparison-data';
import {loadRun, renderRun} from './app/run';
import {
	comparisonShareHref,
	renderShareIndex,
	runShareHref,
	type ShareResult,
} from './app/share';
import {
	comparisonsRoot,
	packageRoot,
	type RenderOptions,
	runsRoot,
} from './app/shared';
import {createTimestamp, readJson, sanitizePathPart, writeJson} from './files';
import type {SkillEvalComparison, SkillEvalManifest} from './manifest';

export type StaticExportRunTarget = {
	runId: string;
	scenarioId: string;
	type: 'run';
};

export type StaticExportComparisonTarget = {
	comparisonId: string;
	scenarioId: string;
	type: 'comparison';
};

export type StaticExportTarget =
	| StaticExportComparisonTarget
	| StaticExportRunTarget
	| string;

export type ExportStaticSiteOptions = {
	outDir?: string;
	targets: StaticExportTarget[];
};

type ResolvedRunTarget = {
	manifest: SkillEvalManifest;
	manifestPath: string;
	type: 'run';
};

type ResolvedComparisonTarget = {
	comparisonData: ComparisonWithManifests;
	comparisonPath: string;
	type: 'comparison';
};

type ResolvedTarget = ResolvedComparisonTarget | ResolvedRunTarget;

export type ExportStaticSiteResult = {
	deployCommand: string;
	indexHtmlPath: string;
	outDir: string;
	targetCount: number;
};

const siteRoot = join(packageRoot, '.site');

const toPosixPath = (path: string) => path.split(/[\\/]/).join('/');

const encodedRelativePath = (from: string, to: string) => {
	const path = toPosixPath(relative(from, to));

	return path === '' ? '.' : path;
};

const writeHtml = async (file: string, html: string) => {
	await mkdir(dirname(file), {recursive: true});
	await writeFile(file, html);
};

const assertInsideRunsRoot = (file: string) => {
	const relativePath = relative(runsRoot, file);

	if (
		relativePath.startsWith('..') ||
		relativePath === '..' ||
		isAbsolute(relativePath)
	) {
		throw new Error(`Cannot export file outside .runs: ${file}`);
	}

	return relativePath;
};

const copyRunAsset = async (outDir: string, file: string) => {
	if (!existsSync(file)) {
		return;
	}

	const relativePath = assertInsideRunsRoot(file);
	const destination = join(outDir, 'files', relativePath);

	await mkdir(dirname(destination), {recursive: true});
	await cp(file, destination);
};

const addIfExists = (assetPaths: Set<string>, file: string | undefined) => {
	if (file && existsSync(file)) {
		assetPaths.add(file);
	}
};

const collectManifestAssets = (
	assetPaths: Set<string>,
	manifest: SkillEvalManifest,
	manifestPath?: string,
) => {
	addIfExists(assetPaths, manifestPath);
	addIfExists(assetPaths, manifest.pi.htmlExport);

	for (const artifact of manifest.artifacts) {
		addIfExists(assetPaths, artifact.path);
	}

	for (const command of Object.values(manifest.commands)) {
		addIfExists(assetPaths, command.stdoutPath);
		addIfExists(assetPaths, command.stderrPath);
	}
};

const collectComparisonAssets = (
	assetPaths: Set<string>,
	comparisonData: ComparisonWithManifests,
	comparisonPath: string,
) => {
	addIfExists(assetPaths, comparisonPath);
	addIfExists(assetPaths, comparisonData.comparison.skillDiffPath);

	const comparisonRuns = comparisonData.comparison.runs ?? [
		{
			after: comparisonData.comparison.after,
			before: comparisonData.comparison.before,
			index: 1,
		},
	];

	for (const run of comparisonData.runs) {
		const metadata = comparisonRuns.find(
			(candidate) => candidate.index === run.index,
		);

		collectManifestAssets(
			assetPaths,
			run.beforeManifest,
			metadata?.before.manifestPath,
		);
		collectManifestAssets(
			assetPaths,
			run.afterManifest,
			metadata?.after.manifestPath,
		);
	}
};

const defaultOutDir = (targets: ResolvedTarget[]) => {
	if (targets.length === 1) {
		const target = targets[0];

		if (target.type === 'run') {
			return join(
				siteRoot,
				'runs',
				sanitizePathPart(target.manifest.id),
				sanitizePathPart(basename(target.manifest.runDir)),
			);
		}

		return join(
			siteRoot,
			'comparisons',
			sanitizePathPart(target.comparisonData.comparison.scenarioId),
			sanitizePathPart(target.comparisonData.comparison.id),
		);
	}

	const scenarioIds = [
		...new Set(
			targets.map((target) =>
				target.type === 'run'
					? target.manifest.id
					: target.comparisonData.comparison.scenarioId,
			),
		),
	];

	return join(
		siteRoot,
		'shares',
		sanitizePathPart(scenarioIds.length === 1 ? scenarioIds[0] : 'selection'),
		createTimestamp(),
	);
};

const resolveRunTarget = async (
	target: StaticExportRunTarget,
): Promise<ResolvedRunTarget> => {
	const manifest = await loadRun(target.scenarioId, target.runId);

	if (!manifest) {
		throw new Error(`Could not find run ${target.scenarioId}/${target.runId}.`);
	}

	return {
		manifest,
		manifestPath: join(
			runsRoot,
			sanitizePathPart(target.scenarioId),
			target.runId,
			'manifest.json',
		),
		type: 'run',
	};
};

const resolveComparisonTarget = async (
	target: StaticExportComparisonTarget,
): Promise<ResolvedComparisonTarget> => {
	const comparisonData = await loadComparison(
		target.scenarioId,
		target.comparisonId,
	);

	if (!comparisonData) {
		throw new Error(
			`Could not find comparison ${target.scenarioId}/${target.comparisonId}.`,
		);
	}

	return {
		comparisonData,
		comparisonPath: join(
			comparisonsRoot,
			sanitizePathPart(target.scenarioId),
			target.comparisonId,
			'comparison.json',
		),
		type: 'comparison',
	};
};

const resolvePathTarget = async (input: string): Promise<ResolvedTarget> => {
	const absolutePath = resolve(input);
	const stats = await stat(absolutePath);
	const file = stats.isDirectory()
		? existsSync(join(absolutePath, 'manifest.json'))
			? join(absolutePath, 'manifest.json')
			: join(absolutePath, 'comparison.json')
		: absolutePath;

	if (basename(file) === 'manifest.json') {
		const manifest = await readJson<SkillEvalManifest>(file);

		return {
			manifest,
			manifestPath: file,
			type: 'run',
		};
	}

	if (basename(file) === 'comparison.json') {
		const comparison = await readJson<SkillEvalComparison>(file);
		const comparisonData = await loadComparison(
			comparison.scenarioId,
			comparison.id,
		);

		if (!comparisonData) {
			throw new Error(`Could not load comparison from ${file}.`);
		}

		return {
			comparisonData,
			comparisonPath: file,
			type: 'comparison',
		};
	}

	throw new Error(
		`Expected a run manifest, comparison JSON, or directory: ${input}`,
	);
};

const resolveTarget = (target: StaticExportTarget) => {
	if (typeof target === 'string') {
		return resolvePathTarget(target);
	}

	return target.type === 'run'
		? resolveRunTarget(target)
		: resolveComparisonTarget(target);
};

const renderOptionsForPage = (
	outDir: string,
	pageDir: string,
): RenderOptions => ({
	fileHrefPrefix: encodedRelativePath(pageDir, join(outDir, 'files')),
	mode: 'static',
});

const resultPagePath = (outDir: string, target: ResolvedTarget) => {
	if (target.type === 'run') {
		return join(
			outDir,
			'runs',
			encodeURIComponent(target.manifest.id),
			encodeURIComponent(basename(target.manifest.runDir)),
			'index.html',
		);
	}

	return join(
		outDir,
		'comparisons',
		encodeURIComponent(target.comparisonData.comparison.scenarioId),
		encodeURIComponent(target.comparisonData.comparison.id),
		'index.html',
	);
};

export const exportStaticSite = async ({
	outDir,
	targets,
}: ExportStaticSiteOptions): Promise<ExportStaticSiteResult> => {
	if (targets.length === 0) {
		throw new Error('Pass at least one run or comparison to export.');
	}

	const resolvedTargets = await Promise.all(targets.map(resolveTarget));
	const output = resolve(outDir ?? defaultOutDir(resolvedTargets));
	const assetPaths = new Set<string>();

	await rm(output, {force: true, recursive: true});
	await mkdir(output, {recursive: true});

	if (resolvedTargets.length === 1) {
		const target = resolvedTargets[0];
		const indexHtmlPath = join(output, 'index.html');
		const renderOptions = renderOptionsForPage(output, output);

		if (target.type === 'run') {
			await writeHtml(indexHtmlPath, renderRun(target.manifest, renderOptions));
			collectManifestAssets(assetPaths, target.manifest, target.manifestPath);
		} else {
			await writeHtml(
				indexHtmlPath,
				renderComparison(target.comparisonData, renderOptions),
			);
			collectComparisonAssets(
				assetPaths,
				target.comparisonData,
				target.comparisonPath,
			);
		}
	} else {
		const shareResults: ShareResult[] = [];

		for (const target of resolvedTargets) {
			const file = resultPagePath(output, target);
			const pageDir = dirname(file);
			const renderOptions = renderOptionsForPage(output, pageDir);

			if (target.type === 'run') {
				await writeHtml(file, renderRun(target.manifest, renderOptions));
				collectManifestAssets(assetPaths, target.manifest, target.manifestPath);
				shareResults.push({
					href: runShareHref(target.manifest),
					manifest: target.manifest,
					type: 'run',
				});
			} else {
				await writeHtml(
					file,
					renderComparison(target.comparisonData, renderOptions),
				);
				collectComparisonAssets(
					assetPaths,
					target.comparisonData,
					target.comparisonPath,
				);

				shareResults.push({
					comparison: target.comparisonData.comparison,
					href: comparisonShareHref(target.comparisonData.comparison),
					type: 'comparison',
				});
			}
		}

		await writeHtml(join(output, 'index.html'), renderShareIndex(shareResults));
	}

	for (const assetPath of assetPaths) {
		await copyRunAsset(output, assetPath);
	}

	await writeJson(join(output, 'metadata.json'), {
		createdAt: new Date().toISOString(),
		targets: resolvedTargets.map((target) =>
			target.type === 'run'
				? {
						id: basename(target.manifest.runDir),
						manifestPath: target.manifestPath,
						scenarioId: target.manifest.id,
						type: 'run',
					}
				: {
						comparisonId: target.comparisonData.comparison.id,
						comparisonPath: target.comparisonPath,
						scenarioId: target.comparisonData.comparison.scenarioId,
						type: 'comparison',
					},
		),
	});

	return {
		deployCommand: `vercel deploy ${output}`,
		indexHtmlPath: join(output, 'index.html'),
		outDir: output,
		targetCount: resolvedTargets.length,
	};
};
