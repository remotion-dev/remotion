import {mkdir, rm, writeFile} from 'node:fs/promises';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import type {SkillEvalScenario} from '../scenarios';
import {runCommand} from './command';
import {
	copyDirectory,
	createTimestamp,
	sanitizePathPart,
	writeJson,
} from './files';
import type {SkillEvalComparison} from './manifest';
import {maxParallelSkillEvalRuns, validateSkillEvalRunCount} from './run-count';
import {
	runSkillEval,
	type SkillEvalOutput,
	type SkillEvalPhaseEvent,
} from './run-skill-eval';
import {runWithConcurrency} from './run-with-concurrency';

export type SkillEvalComparisonRunLabel = 'after' | 'before';

export type SkillEvalComparisonEvent =
	| {
			message: string;
			type: 'message';
	  }
	| {
			label: SkillEvalComparisonRunLabel;
			runIndex: number;
			type: 'run-start';
	  }
	| {
			event: SkillEvalPhaseEvent;
			label: SkillEvalComparisonRunLabel;
			runIndex: number;
			type: 'run-phase';
	  }
	| {
			label: SkillEvalComparisonRunLabel;
			output: SkillEvalOutput;
			runIndex: number;
			type: 'run-output';
	  }
	| {
			label: SkillEvalComparisonRunLabel;
			runIndex: number;
			type: 'run-complete';
	  }
	| {
			error: string;
			label: SkillEvalComparisonRunLabel;
			runIndex: number;
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
	beforeGitRef?: string;
	onEvent?: (event: SkillEvalComparisonEvent) => void;
	onLog?: (chunk: string) => void;
	runCount?: number;
};

type BeforeSkillsSource = {
	gitRef: string;
	source: 'git-ref';
};

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(packageRoot, '..', '..');
const runsRoot = resolve(packageRoot, '.runs');
const skillsSource = resolve(packageRoot, '..', 'skills', 'skills');
const comparisonsRoot = join(runsRoot, 'comparisons');

export const getDefaultComparisonBaseRef = () =>
	process.env.REMOTION_SKILLS_EVALS_BASE_REF ?? 'origin/main';

const getErrorMessage = (error: unknown) =>
	error instanceof Error ? error.message : String(error);

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
	gitRef,
}: {
	beforeSkillsPath: string;
	gitRef: string;
}): Promise<BeforeSkillsSource> => {
	await copyGitSkills({gitRef, to: beforeSkillsPath});
	return {
		gitRef,
		source: 'git-ref',
	};
};

export const runSkillEvalComparison = async (
	scenario: SkillEvalScenario,
	options: SkillEvalComparisonOptions = {},
): Promise<SkillEvalComparisonResult> => {
	const runCount = validateSkillEvalRunCount(options.runCount);
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
	const beforeGitRef = options.beforeGitRef ?? getDefaultComparisonBaseRef();
	const emitMessage = (message: string) => {
		options.onEvent?.({message, type: 'message'});
		options.onLog?.(message);
	};

	await rm(comparisonDir, {force: true, recursive: true});
	await mkdir(comparisonDir, {recursive: true});

	emitMessage(`[compare] Preparing ${scenario.id} against ${beforeGitRef}\n`);
	const beforeSource = await prepareBeforeSkills({
		beforeSkillsPath,
		gitRef: beforeGitRef,
	});

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
			reason: `No skill changes since ${beforeGitRef}.`,
			skipped: true,
		};
	}

	if (diff.exitCode !== 1) {
		throw new Error(`Could not diff skill snapshots: ${diff.stderr}`);
	}

	await writeFile(skillDiffPath, `${diff.stdout}${diff.stderr}`);

	const formatRun = (label: SkillEvalComparisonRunLabel, runIndex: number) =>
		runCount === 1 ? label : `${label}#${runIndex}`;

	const forwardOutput =
		(label: SkillEvalComparisonRunLabel, runIndex: number) =>
		(output: SkillEvalOutput) => {
			options.onEvent?.({label, output, runIndex, type: 'run-output'});
			options.onLog?.(
				`[${formatRun(label, runIndex)} ${output.phase} ${
					output.stream
				}] ${output.chunk}`,
			);
		};

	const forwardPhase =
		(label: SkillEvalComparisonRunLabel, runIndex: number) =>
		(event: SkillEvalPhaseEvent) => {
			options.onEvent?.({event, label, runIndex, type: 'run-phase'});
			options.onLog?.(
				`[${formatRun(label, runIndex)} ${event.phase}] ${event.status}\n`,
			);
		};

	type SnapshotTask = {
		label: SkillEvalComparisonRunLabel;
		runIndex: number;
	};
	const abortControllers = new Set<AbortController>();
	const abortAll = () => {
		for (const controller of abortControllers) {
			controller.abort();
		}
	};

	const runSnapshot = async ({label, runIndex}: SnapshotTask) => {
		const controller = new AbortController();
		abortControllers.add(controller);
		emitMessage(`[compare] Running ${formatRun(label, runIndex)} snapshot\n`);
		options.onEvent?.({label, runIndex, type: 'run-start'});

		try {
			const result = await runSkillEval({
				...scenario,
				onOutput: forwardOutput(label, runIndex),
				onPhase: forwardPhase(label, runIndex),
				runLabel:
					runCount === 1
						? label
						: `${label}-${String(runIndex).padStart(2, '0')}`,
				runRoot: join(comparisonDir, 'runs'),
				signal: controller.signal,
				skillSnapshot:
					label === 'before'
						? {
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

			options.onEvent?.({label, runIndex, type: 'run-complete'});
			return {label, result, runIndex};
		} catch (error) {
			options.onEvent?.({
				error: getErrorMessage(error),
				label,
				runIndex,
				type: 'run-error',
			});
			abortAll();
			throw error;
		} finally {
			abortControllers.delete(controller);
		}
	};

	const snapshotTasks = Array.from({length: runCount}, (_, index) => index + 1)
		.map((runIndex) => [
			{label: 'before' as const, runIndex},
			{label: 'after' as const, runIndex},
		])
		.flat();
	const snapshotResults = await runWithConcurrency({
		inputs: snapshotTasks,
		limit: maxParallelSkillEvalRuns,
		worker: runSnapshot,
	});
	const resultsByKey = new Map(
		snapshotResults.map((snapshot) => [
			`${snapshot.label}:${snapshot.runIndex}`,
			snapshot.result,
		]),
	);
	const runPairs = Array.from({length: runCount}, (_, index) => {
		const runIndex = index + 1;
		const before = resultsByKey.get(`before:${runIndex}`);
		const after = resultsByKey.get(`after:${runIndex}`);

		if (!before || !after) {
			throw new Error(`Missing results for comparison run ${runIndex}.`);
		}

		return {
			after: {
				hash: after.manifest.skillSnapshot.hash,
				isWorkingTree: true,
				label: 'after' as const,
				manifestPath: after.manifestPath,
				skillsPath: afterSkillsPath,
			},
			before: {
				gitRef: beforeSource.gitRef,
				hash: before.manifest.skillSnapshot.hash,
				label: 'before' as const,
				manifestPath: before.manifestPath,
				source: beforeSource.source,
				skillsPath: beforeSkillsPath,
			},
			index: runIndex,
		};
	});
	const completedAt = new Date().toISOString();
	const comparison: SkillEvalComparison = {
		after: runPairs[0].after,
		before: runPairs[0].before,
		completedAt,
		comparisonDir,
		createdAt,
		id: comparisonId,
		runCount,
		runs: runPairs,
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
