import {mkdir, rm, writeFile} from 'node:fs/promises';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import type {SkillEvalScenario} from '../scenarios';
import {runCommand} from './command';
import {
	copyDirectory,
	createTimestamp,
	listFilesRecursively,
	readJson,
	sanitizePathPart,
	writeJson,
} from './files';
import type {SkillEvalComparison} from './manifest';
import {runSkillEval, type SkillEvalOutput} from './run-skill-eval';

export type SkillEvalComparisonRunLabel = 'after' | 'before';

export type SkillEvalComparisonEvent =
	| {
			message: string;
			type: 'message';
	  }
	| {
			label: SkillEvalComparisonRunLabel;
			type: 'run-start';
	  }
	| {
			label: SkillEvalComparisonRunLabel;
			output: SkillEvalOutput;
			type: 'run-output';
	  }
	| {
			label: SkillEvalComparisonRunLabel;
			type: 'run-complete';
	  }
	| {
			error: string;
			label: SkillEvalComparisonRunLabel;
			type: 'run-error';
	  };

type SkillEvalComparisonResult =
	| {
			skipped: false;
			comparison: SkillEvalComparison;
	  }
	| {
			reason: string;
			skipped: true;
	  };

type SkillEvalComparisonOptions = {
	onEvent?: (event: SkillEvalComparisonEvent) => void;
	onLog?: (chunk: string) => void;
};

type BeforeSkillsSource =
	| {
			comparisonId: string;
			gitRef?: undefined;
			source: 'latest-comparison';
	  }
	| {
			comparisonId?: undefined;
			gitRef: string;
			source: 'head' | 'merge-base';
	  };

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(packageRoot, '..', '..');
const runsRoot = resolve(packageRoot, '.runs');
const skillsSource = resolve(packageRoot, '..', 'skills', 'skills');
const comparisonsRoot = join(runsRoot, 'comparisons');

const getErrorMessage = (error: unknown) =>
	error instanceof Error ? error.message : String(error);

const findLatestComparison = async (scenarioId: string) => {
	const scenarioComparisonsRoot = join(
		comparisonsRoot,
		sanitizePathPart(scenarioId),
	);

	const comparisonFiles = (
		await listFilesRecursively(scenarioComparisonsRoot)
	).filter((file) => file.endsWith('/comparison.json'));
	const comparisons = await Promise.all(
		comparisonFiles.map((comparisonPath) =>
			readJson<SkillEvalComparison>(comparisonPath),
		),
	);

	comparisons.sort((a, b) => b.completedAt.localeCompare(a.completedAt));

	return comparisons[0] ?? null;
};

const getMergeBase = async () => {
	for (const baseBranch of ['origin/main', 'main']) {
		const result = await runCommand({
			command: ['git', 'merge-base', baseBranch, 'HEAD'],
			cwd: repoRoot,
		});

		if (result.exitCode === 0) {
			return result.stdout.trim();
		}
	}

	throw new Error('Could not determine a Git merge base against main.');
};

const copyGitSkills = async ({gitRef, to}: {gitRef: string; to: string}) => {
	await mkdir(to, {recursive: true});
	const archive = await runCommand({
		command: [
			'sh',
			'-c',
			'git archive "$1":packages/skills/skills | tar -x -C "$2"',
			'sh',
			gitRef,
			to,
		],
		cwd: repoRoot,
	});

	if (archive.exitCode !== 0) {
		throw new Error(
			`Could not materialize skills at ${gitRef}: ${archive.stderr}`,
		);
	}
};

const prepareBeforeSkills = async ({
	beforeSkillsPath,
	scenarioId,
}: {
	beforeSkillsPath: string;
	scenarioId: string;
}): Promise<BeforeSkillsSource | null> => {
	const latestComparison = await findLatestComparison(scenarioId);

	if (latestComparison) {
		await copyDirectory(latestComparison.after.skillsPath, beforeSkillsPath);
		return {
			comparisonId: latestComparison.id,
			gitRef: undefined,
			source: 'latest-comparison',
		};
	}

	const status = await runCommand({
		command: ['git', 'status', '--porcelain', '--', 'packages/skills/skills'],
		cwd: repoRoot,
	});

	if (status.exitCode !== 0) {
		throw new Error(`Could not inspect skill status: ${status.stderr}`);
	}

	if (status.stdout.trim()) {
		await copyGitSkills({gitRef: 'HEAD', to: beforeSkillsPath});
		return {
			comparisonId: undefined,
			gitRef: 'HEAD',
			source: 'head',
		};
	}

	const mergeBase = await getMergeBase();
	const branchDiff = await runCommand({
		command: [
			'git',
			'diff',
			'--quiet',
			mergeBase,
			'HEAD',
			'--',
			'packages/skills/skills',
		],
		cwd: repoRoot,
	});

	if (branchDiff.exitCode === 0) {
		return null;
	}

	if (branchDiff.exitCode !== 1) {
		throw new Error(
			`Could not inspect branch skill diff: ${branchDiff.stderr}`,
		);
	}

	await copyGitSkills({gitRef: mergeBase, to: beforeSkillsPath});
	return {
		comparisonId: undefined,
		gitRef: mergeBase,
		source: 'merge-base',
	};
};

export const runSkillEvalComparison = async (
	scenario: SkillEvalScenario,
	options: SkillEvalComparisonOptions = {},
): Promise<SkillEvalComparisonResult> => {
	const comparisonId = `${createTimestamp()}--${sanitizePathPart(scenario.id)}`;
	const comparisonDir = join(
		comparisonsRoot,
		sanitizePathPart(scenario.id),
		comparisonId,
	);
	const beforeSkillsPath = join(comparisonDir, 'before-skills');
	const afterSkillsPath = join(comparisonDir, 'after-skills');
	const skillDiffPath = join(comparisonDir, 'skills.diff');
	const createdAt = new Date().toISOString();
	const emitMessage = (message: string) => {
		options.onEvent?.({message, type: 'message'});
		options.onLog?.(message);
	};

	await rm(comparisonDir, {force: true, recursive: true});
	await mkdir(comparisonDir, {recursive: true});

	emitMessage(`[compare] Preparing ${scenario.id}\n`);
	const beforeSource = await prepareBeforeSkills({
		beforeSkillsPath,
		scenarioId: scenario.id,
	});

	if (!beforeSource) {
		await rm(comparisonDir, {force: true, recursive: true});
		return {
			reason: 'No skill changes found for this scenario.',
			skipped: true,
		};
	}

	await copyDirectory(skillsSource, afterSkillsPath);

	emitMessage('[compare] Diffing skill snapshots\n');
	const diff = await runCommand({
		command: [
			'git',
			'diff',
			'--no-index',
			'--',
			beforeSkillsPath,
			afterSkillsPath,
		],
		cwd: repoRoot,
	});

	if (diff.exitCode === 0) {
		await rm(comparisonDir, {force: true, recursive: true});
		return {
			reason: 'No skill changes since the previous comparison.',
			skipped: true,
		};
	}

	if (diff.exitCode !== 1) {
		throw new Error(`Could not diff skill snapshots: ${diff.stderr}`);
	}

	await writeFile(skillDiffPath, `${diff.stdout}${diff.stderr}`);

	const forwardOutput =
		(label: SkillEvalComparisonRunLabel) => (output: SkillEvalOutput) => {
			options.onEvent?.({label, output, type: 'run-output'});
			options.onLog?.(
				`[${label} ${output.phase} ${output.stream}] ${output.chunk}`,
			);
		};

	const runSnapshot = async (label: SkillEvalComparisonRunLabel) => {
		emitMessage(`[compare] Running ${label} snapshot\n`);
		options.onEvent?.({label, type: 'run-start'});

		try {
			const result = await runSkillEval({
				...scenario,
				onOutput: forwardOutput(label),
				runLabel: label,
				runRoot: join(comparisonDir, 'runs'),
				skillSnapshot:
					label === 'before'
						? {
								comparisonId: beforeSource.comparisonId,
								gitRef: beforeSource.gitRef,
								label,
							}
						: {
								isWorkingTree: true,
								label,
							},
				skillsSourcePath:
					label === 'before' ? beforeSkillsPath : afterSkillsPath,
			});

			options.onEvent?.({label, type: 'run-complete'});
			return result;
		} catch (error) {
			options.onEvent?.({
				error: getErrorMessage(error),
				label,
				type: 'run-error',
			});
			throw error;
		}
	};

	const [beforeResult, afterResult] = await Promise.allSettled([
		runSnapshot('before'),
		runSnapshot('after'),
	]);

	if (beforeResult.status === 'rejected') {
		throw beforeResult.reason;
	}

	if (afterResult.status === 'rejected') {
		throw afterResult.reason;
	}

	const before = beforeResult.value;
	const after = afterResult.value;
	const completedAt = new Date().toISOString();
	const comparison: SkillEvalComparison = {
		after: {
			hash: after.manifest.skillSnapshot.hash,
			isWorkingTree: true,
			label: 'after',
			manifestPath: after.manifestPath,
			skillsPath: afterSkillsPath,
		},
		before: {
			comparisonId: beforeSource.comparisonId,
			gitRef: beforeSource.gitRef,
			hash: before.manifest.skillSnapshot.hash,
			label: 'before',
			manifestPath: before.manifestPath,
			source: beforeSource.source,
			skillsPath: beforeSkillsPath,
		},
		completedAt,
		comparisonDir,
		createdAt,
		id: comparisonId,
		scenarioId: scenario.id,
		skillDiffPath,
	};

	await writeJson(join(comparisonDir, 'comparison.json'), comparison);
	emitMessage('[compare] Comparison complete\n');

	return {
		comparison,
		skipped: false,
	};
};
