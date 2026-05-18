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
import {type ComparisonWithManifests} from './app/comparison-data';
import {
	loadSkillEvalData,
	renderEval,
	type SkillEvalWithData,
} from './app/eval';
import {renderShareIndex, type ShareResult} from './app/share';
import {packageRoot, type RenderOptions, runsRoot} from './app/shared';
import {getSkillEvalPath, loadSkillEval} from './eval';
import {createTimestamp, readJson, sanitizePathPart, writeJson} from './files';
import type {SkillEval, SkillEvalManifest} from './manifest';

export type StaticExportEvalTarget = {
	evalId: string;
	scenarioId: string;
	type: 'eval';
};

export type StaticExportTarget = StaticExportEvalTarget | string;

export type ExportStaticSiteOptions = {
	outDir?: string;
	targets: StaticExportTarget[];
};

type ResolvedTarget = {
	data: SkillEvalWithData;
	evalPath: string;
	type: 'eval';
};

export type ExportStaticSiteResult = {
	deployCommand: string;
	indexHtmlPath: string;
	outDir: string;
	targetCount: number;
};

const siteRoot = join(packageRoot, '.site');

const toPosixPath = (path: string) => path.split(/[\\/]/).join('/');

const posixRelativePath = (from: string, to: string) => {
	const path = toPosixPath(relative(from, to));

	return path === '' ? '.' : path;
};

const shellQuote = (value: string) => JSON.stringify(value);

const writeHtml = async (file: string, html: string) => {
	await mkdir(dirname(file), {recursive: true});
	await writeFile(file, html);
};

const assertInsideRunsRoot = (file: string) => {
	const relativePath = relative(runsRoot, file);

	if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
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

const collectEvalAssets = (assetPaths: Set<string>, target: ResolvedTarget) => {
	addIfExists(assetPaths, target.evalPath);

	if (target.data.type === 'run') {
		for (const [index, manifest] of target.data.manifests.entries()) {
			collectManifestAssets(
				assetPaths,
				manifest,
				target.data.evaluation.runs[index]?.manifestPath,
			);
		}

		return;
	}

	collectComparisonAssets(
		assetPaths,
		target.data.comparisonData,
		target.data.evaluation.comparisonPath,
	);
};

const defaultOutDir = (targets: ResolvedTarget[]) => {
	if (targets.length === 1) {
		const target = targets[0];

		return join(
			siteRoot,
			'evals',
			sanitizePathPart(target.data.evaluation.scenarioId),
			sanitizePathPart(target.data.evaluation.id),
		);
	}

	const scenarioIds = [
		...new Set(targets.map((target) => target.data.evaluation.scenarioId)),
	];

	return join(
		siteRoot,
		'shares',
		sanitizePathPart(scenarioIds.length === 1 ? scenarioIds[0] : 'selection'),
		createTimestamp(),
	);
};

const resolveEvalTarget = async (
	target: StaticExportEvalTarget,
): Promise<ResolvedTarget> => {
	const evaluation = await loadSkillEval(target.scenarioId, target.evalId);

	if (!evaluation) {
		throw new Error(
			`Could not find eval ${target.scenarioId}/${target.evalId}.`,
		);
	}

	const data = await loadSkillEvalData(evaluation);

	if (!data) {
		throw new Error(
			`Could not load eval ${target.scenarioId}/${target.evalId}.`,
		);
	}

	return {
		data,
		evalPath: getSkillEvalPath(target.scenarioId, target.evalId),
		type: 'eval',
	};
};

const resolvePathTarget = async (input: string): Promise<ResolvedTarget> => {
	const absolutePath = resolve(input);
	const stats = await stat(absolutePath);
	const file = stats.isDirectory()
		? join(absolutePath, 'eval.json')
		: absolutePath;

	if (basename(file) === 'eval.json') {
		const evaluation = await readJson<SkillEval>(file);
		const data = await loadSkillEvalData(evaluation);

		if (!data) {
			throw new Error(`Could not load eval from ${file}.`);
		}

		return {
			data,
			evalPath: file,
			type: 'eval',
		};
	}

	throw new Error(`Expected an eval JSON file or directory: ${input}`);
};

const resolveTarget = (target: StaticExportTarget) => {
	if (typeof target === 'string') {
		return resolvePathTarget(target);
	}

	return resolveEvalTarget(target);
};

const renderOptionsForPage = (
	outDir: string,
	pageDir: string,
): RenderOptions => ({
	fileHrefPrefix: posixRelativePath(pageDir, join(outDir, 'files')),
	mode: 'static',
});

const evalPagePath = (outDir: string, target: ResolvedTarget) =>
	join(
		outDir,
		'evals',
		encodeURIComponent(target.data.evaluation.scenarioId),
		encodeURIComponent(target.data.evaluation.id),
		'index.html',
	);

const renderEvalPage = async (
	outDir: string,
	indexHtmlPath: string,
	target: ResolvedTarget,
) => {
	const evalPageDir = dirname(indexHtmlPath);
	await writeHtml(
		indexHtmlPath,
		renderEval(target.data, renderOptionsForPage(outDir, evalPageDir)),
	);
};

export const exportStaticSite = async ({
	outDir,
	targets,
}: ExportStaticSiteOptions): Promise<ExportStaticSiteResult> => {
	if (targets.length === 0) {
		throw new Error('Pass at least one eval to export.');
	}

	const resolvedTargets = await Promise.all(targets.map(resolveTarget));
	const output = resolve(outDir ?? defaultOutDir(resolvedTargets));
	const assetPaths = new Set<string>();

	await rm(output, {force: true, recursive: true});
	await mkdir(output, {recursive: true});

	if (resolvedTargets.length === 1) {
		const target = resolvedTargets[0];
		const indexHtmlPath = join(output, 'index.html');

		await renderEvalPage(output, indexHtmlPath, target);
		collectEvalAssets(assetPaths, target);
	} else {
		const shareResults: ShareResult[] = [];

		for (const target of resolvedTargets) {
			const file = evalPagePath(output, target);

			await renderEvalPage(output, file, target);
			collectEvalAssets(assetPaths, target);
			shareResults.push({
				evaluation: target.data.evaluation,
				href: `evals/${encodeURIComponent(
					target.data.evaluation.scenarioId,
				)}/${encodeURIComponent(target.data.evaluation.id)}/`,
			});
		}

		await writeHtml(join(output, 'index.html'), renderShareIndex(shareResults));
	}

	for (const assetPath of assetPaths) {
		await copyRunAsset(output, assetPath);
	}

	await writeJson(join(output, 'metadata.json'), {
		createdAt: new Date().toISOString(),
		targets: resolvedTargets.map((target) => ({
			evalId: target.data.evaluation.id,
			evalPath: target.evalPath,
			scenarioId: target.data.evaluation.scenarioId,
			type: 'eval',
		})),
	});

	return {
		deployCommand: `vercel deploy ${shellQuote(output)}`,
		indexHtmlPath: join(output, 'index.html'),
		outDir: output,
		targetCount: resolvedTargets.length,
	};
};
