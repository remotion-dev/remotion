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
import {
	runSkillEval,
	type SkillEvalOutput,
	type SkillEvalPhaseEvent,
} from './run-skill-eval';

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
			event: SkillEvalPhaseEvent;
			label: SkillEvalComparisonRunLabel;
			type: 'run-phase';
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
	beforeGitRef?: string;
	onEvent?: (event: SkillEvalComparisonEvent) => void;
	onLog?: (chunk: string) => void;
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

	const forwardOutput =
		(label: SkillEvalComparisonRunLabel) => (output: SkillEvalOutput) => {
			options.onEvent?.({label, output, type: 'run-output'});
			options.onLog?.(
				`[${label} ${output.phase} ${output.stream}] ${output.chunk}`,
			);
		};

	const forwardPhase =
		(label: SkillEvalComparisonRunLabel) => (event: SkillEvalPhaseEvent) => {
			options.onEvent?.({event, label, type: 'run-phase'});
			options.onLog?.(`[${label} ${event.phase}] ${event.status}\n`);
		};

	const abortControllers: Record<SkillEvalComparisonRunLabel, AbortController> =
		{
			after: new AbortController(),
			before: new AbortController(),
		};
	let firstSnapshotError: unknown = null;
	const runSnapshot = async (label: SkillEvalComparisonRunLabel) => {
		emitMessage(`[compare] Running ${label} snapshot\n`);
		options.onEvent?.({label, type: 'run-start'});

		try {
			const result = await runSkillEval({
				...scenario,
				onOutput: forwardOutput(label),
				onPhase: forwardPhase(label),
				runLabel: label,
				runRoot: join(comparisonDir, 'runs'),
				signal: abortControllers[label].signal,
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

	const runSnapshotWithSiblingCancellation = async (
		label: SkillEvalComparisonRunLabel,
		sibling: SkillEvalComparisonRunLabel,
	) => {
		try {
			return await runSnapshot(label);
		} catch (error) {
			if (!firstSnapshotError) {
				firstSnapshotError = error;
				abortControllers[sibling].abort();
			}

			throw error;
		}
	};

	const [beforeResult, afterResult] = await Promise.allSettled([
		runSnapshotWithSiblingCancellation('before', 'after'),
		runSnapshotWithSiblingCancellation('after', 'before'),
	]);

	if (firstSnapshotError) {
		throw firstSnapshotError;
	}

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
