import {existsSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {listFilesRecursively, readJson, sanitizePathPart} from '../files';
import type {SkillEvalComparison, SkillEvalManifest} from '../manifest';
import {comparisonsRoot} from './shared';

export type ComparisonWithManifests = {
	afterManifest: SkillEvalManifest;
	beforeManifest: SkillEvalManifest;
	comparison: SkillEvalComparison;
	runs: {
		afterManifest: SkillEvalManifest;
		beforeManifest: SkillEvalManifest;
		index: number;
	}[];
	skillDiff: string;
};

export const loadComparisons = async () => {
	const files = (await listFilesRecursively(comparisonsRoot)).filter((file) =>
		file.endsWith('/comparison.json'),
	);
	const comparisons = await Promise.all(
		files.map((file) => readJson<SkillEvalComparison>(file)),
	);

	comparisons.sort((a, b) => b.completedAt.localeCompare(a.completedAt));

	return comparisons;
};

export const getLatestComparisonByScenario = async () => {
	const latest = new Map<string, SkillEvalComparison>();

	for (const comparison of await loadComparisons()) {
		if (!latest.has(comparison.scenarioId)) {
			latest.set(comparison.scenarioId, comparison);
		}
	}

	return latest;
};

export const loadComparison = async (
	scenarioId: string,
	comparisonId: string,
): Promise<ComparisonWithManifests | null> => {
	const comparisonPath = join(
		comparisonsRoot,
		sanitizePathPart(scenarioId),
		comparisonId,
		'comparison.json',
	);

	if (!existsSync(comparisonPath)) {
		return null;
	}

	const comparison = await readJson<SkillEvalComparison>(comparisonPath);
	const comparisonRuns = comparison.runs ?? [
		{
			after: comparison.after,
			before: comparison.before,
			index: 1,
		},
	];
	const [runManifests, skillDiff] = await Promise.all([
		Promise.all(
			comparisonRuns.map(async (run) => {
				const [beforeManifest, afterManifest] = await Promise.all([
					readJson<SkillEvalManifest>(run.before.manifestPath),
					readJson<SkillEvalManifest>(run.after.manifestPath),
				]);

				return {
					afterManifest,
					beforeManifest,
					index: run.index,
				};
			}),
		),
		readFile(comparison.skillDiffPath, 'utf-8'),
	]);
	const firstRun = runManifests[0];

	if (!firstRun) {
		return null;
	}

	return {
		afterManifest: firstRun.afterManifest,
		beforeManifest: firstRun.beforeManifest,
		comparison,
		runs: runManifests,
		skillDiff,
	};
};

export const getPreferredArtifact = (manifest: SkillEvalManifest) =>
	manifest.artifacts.find((artifact) => artifact.type === 'video') ??
	manifest.artifacts[0];
