import {existsSync} from 'node:fs';
import {cp, mkdir, readdir, readFile, rm, writeFile} from 'node:fs/promises';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {runCommand} from './command';
import type {SkillEvalComparison} from './manifest';
import {runSkillEval, type SkillEvalOutput} from './run-skill-eval';
import type {SkillEvalScenario} from './scenarios';

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
	onLog?: (chunk: string) => void;
};

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(packageRoot, '..', '..');
const runsRoot = resolve(packageRoot, '.runs');
const skillsSource = resolve(packageRoot, '..', 'skills', 'skills');
const comparisonsRoot = join(runsRoot, 'comparisons');

const createTimestamp = () => new Date().toISOString().replace(/[:.]/g, '-');

const sanitizePathPart = (value: string) => {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9._-]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 80);
};

const copyDirectory = async (from: string, to: string) => {
	await rm(to, {force: true, recursive: true});
	await cp(from, to, {
		recursive: true,
		filter: (source) => {
			const pathParts = source.split(/[\\/]/);

			return (
				!pathParts.includes('node_modules') && !pathParts.includes('.DS_Store')
			);
		},
	});
};

const readJson = async <T>(file: string): Promise<T> => {
	return JSON.parse(await readFile(file, 'utf-8')) as T;
};

const writeJson = async (file: string, value: unknown) => {
	await writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
};

const listFilesRecursively = async (dir: string): Promise<string[]> => {
	const entries = await readdir(dir, {withFileTypes: true});
	const files = await Promise.all(
		entries.map((entry) => {
			const absolutePath = join(dir, entry.name);

			if (entry.isDirectory()) {
				return listFilesRecursively(absolutePath);
			}

			return [absolutePath];
		}),
	);

	return files.flat().sort();
};

const findLatestComparison = async (scenarioId: string) => {
	const scenarioComparisonsRoot = join(
		comparisonsRoot,
		sanitizePathPart(scenarioId),
	);

	if (!existsSync(scenarioComparisonsRoot)) {
		return null;
	}

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
}) => {
	const latestComparison = await findLatestComparison(scenarioId);

	if (latestComparison) {
		await copyDirectory(latestComparison.after.skillsPath, beforeSkillsPath);
		return {
			comparisonId: latestComparison.id,
			gitRef: undefined,
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

	await rm(comparisonDir, {force: true, recursive: true});
	await mkdir(comparisonDir, {recursive: true});

	options.onLog?.(`[compare] Preparing ${scenario.id}\n`);
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

	options.onLog?.('[compare] Diffing skill snapshots\n');
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
		(label: 'after' | 'before') => (output: SkillEvalOutput) => {
			options.onLog?.(
				`[${label} ${output.phase} ${output.stream}] ${output.chunk}`,
			);
		};

	options.onLog?.('[compare] Running before snapshot\n');
	const before = await runSkillEval({
		...scenario,
		onOutput: forwardOutput('before'),
		runLabel: 'before',
		runRoot: join(comparisonDir, 'runs'),
		skillSnapshot: {
			comparisonId: beforeSource.comparisonId,
			gitRef: beforeSource.gitRef,
			label: 'before',
		},
		skillsSourcePath: beforeSkillsPath,
	});
	options.onLog?.('[compare] Running after snapshot\n');
	const after = await runSkillEval({
		...scenario,
		onOutput: forwardOutput('after'),
		runLabel: 'after',
		runRoot: join(comparisonDir, 'runs'),
		skillSnapshot: {
			isWorkingTree: true,
			label: 'after',
		},
		skillsSourcePath: afterSkillsPath,
	});
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
	options.onLog?.('[compare] Comparison complete\n');

	return {
		comparison,
		skipped: false,
	};
};
