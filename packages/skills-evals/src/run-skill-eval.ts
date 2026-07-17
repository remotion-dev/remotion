import {createHash} from 'node:crypto';
import {mkdir, readFile, rm, stat, writeFile} from 'node:fs/promises';
import {dirname, extname, join, relative, resolve} from 'node:path';
import type {SkillEvalScenario} from '../scenarios';
import type {CommandResult} from './command';
import {runCommand, type CommandOutput} from './command';
import {
	copyDirectory,
	createTimestamp,
	listFilesRecursively,
	sanitizePathPart,
	writeJson,
} from './files';
import type {
	LoggedCommand,
	SkillEvalManifest,
	SkillEvalResult,
	SkillSnapshot,
	VisualArtifact,
} from './manifest';
import {exportPiSession, runPi} from './pi';
import {
	copyBlankTemplate,
	getSkillNames,
	packageRoot,
	repoRoot,
	skillsSource,
} from './skill-project';

export type SkillEvalPhase = 'install' | 'pi' | 'pi-render' | 'pi-export';

export type SkillEvalOutput = CommandOutput & {
	phase: SkillEvalPhase;
};

export type SkillEvalPhaseEvent = {
	phase: SkillEvalPhase;
	status: 'completed' | 'started';
};

type SkillEvalScenarioInput = SkillEvalScenario & {
	evalId?: string;
	evalRunIndex?: number;
	onOutput?: (output: SkillEvalOutput) => void;
	onPhase?: (event: SkillEvalPhaseEvent) => void;
	runRoot?: string;
	runLabel?: string;
	signal?: AbortSignal;
	skillsSourcePath?: string;
	skillSnapshot?: Partial<
		Pick<SkillSnapshot, 'comparisonId' | 'gitRef' | 'isWorkingTree' | 'label'>
	>;
};

const runsRoot = resolve(packageRoot, '.runs');
const visualArtifactExtensions = new Set([
	'.gif',
	'.jpeg',
	'.jpg',
	'.mov',
	'.mp4',
	'.png',
	'.webm',
]);
const visualArtifactTypePriority: Record<VisualArtifact['type'], number> = {
	video: 0,
	image: 1,
};
const createRenderPrompt = (expectedArtifactPath: string) =>
	`Generate and render the final video artifact that can be reviewed.

Render the final MP4 to this exact path:
${expectedArtifactPath}

Do not leave the final artifact only in /tmp or another temporary directory. Temporary files are fine, but the reviewed MP4 must exist at the path above. Do not stop after producing only a still image or screenshot.`;

const hashDirectory = async (dir: string) => {
	const hash = createHash('sha256');
	const files = await listFilesRecursively(dir);

	for (const file of files) {
		const stats = await stat(file);

		if (!stats.isFile()) {
			continue;
		}

		hash.update(relative(dir, file));
		hash.update('\0');
		hash.update((await readFile(file)).toString('base64'));
		hash.update('\0');
	}

	return hash.digest('hex').slice(0, 12);
};

const copySkillsForPiDiscovery = async ({
	projectRoot,
	skillSnapshot,
	skillsSourcePath,
}: {
	projectRoot: string;
	skillSnapshot?: SkillEvalScenarioInput['skillSnapshot'];
	skillsSourcePath?: string;
}): Promise<SkillSnapshot> => {
	const projectSkillsRoot = join(projectRoot, '.pi', 'skills');
	const sourcePath = skillsSourcePath ?? skillsSource;
	const skillNames = await getSkillNames(sourcePath);

	await rm(projectSkillsRoot, {force: true, recursive: true});
	await mkdir(projectSkillsRoot, {recursive: true});
	for (const skillName of skillNames) {
		await copyDirectory(
			join(sourcePath, skillName),
			join(projectSkillsRoot, skillName),
		);
	}

	return {
		...skillSnapshot,
		sourcePath,
		sandboxPath: projectSkillsRoot,
		hash: await hashDirectory(projectSkillsRoot),
	};
};

const discoverVisualArtifacts = async (
	projectRoot: string,
): Promise<VisualArtifact[]> => {
	const files = await listFilesRecursively(projectRoot);
	const artifacts = await Promise.all(
		files
			.filter((file) =>
				visualArtifactExtensions.has(extname(file).toLowerCase()),
			)
			.map(async (file) => {
				const stats = await stat(file);
				const extension = extname(file).toLowerCase();

				return {
					path: file,
					relativePath: relative(projectRoot, file),
					sizeInBytes: stats.size,
					type:
						extension === '.png' ||
						extension === '.jpg' ||
						extension === '.jpeg'
							? 'image'
							: 'video',
				} satisfies VisualArtifact;
			}),
	);

	return artifacts.sort(
		(a, b) =>
			visualArtifactTypePriority[a.type] - visualArtifactTypePriority[b.type] ||
			a.relativePath.localeCompare(b.relativePath),
	);
};

const logCommand = async ({
	command,
	logDir,
	name,
}: {
	command: CommandResult;
	logDir: string;
	name: string;
}): Promise<LoggedCommand> => {
	const stdoutPath = join(logDir, `${name}.stdout.log`);
	const stderrPath = join(logDir, `${name}.stderr.log`);

	await writeFile(stdoutPath, command.stdout);
	await writeFile(stderrPath, command.stderr);

	return {
		command: command.command,
		cwd: command.cwd,
		durationMs: command.durationMs,
		exitCode: command.exitCode,
		stdoutPath,
		stderrPath,
	};
};

const describeCommandFailure = (name: string, command: CommandResult) => {
	if (command.timedOut) {
		return `${name} timed out after ${command.durationMs}ms.`;
	}

	if (command.aborted) {
		return `${name} was cancelled.`;
	}

	return `${name} failed (${command.exitCode}): ${command.stderr}`;
};

const runPhase = async ({
	command,
	cwd,
	input,
	phase,
	timeoutMs,
}: {
	command: string[];
	cwd: string;
	input: SkillEvalScenarioInput;
	phase: SkillEvalPhase;
	timeoutMs?: number;
}) => {
	input.onPhase?.({phase, status: 'started'});

	const result = await runCommand({
		command,
		cwd,
		onOutput: (output) => input.onOutput?.({...output, phase}),
		signal: input.signal,
		timeoutMs,
	});

	input.onPhase?.({phase, status: 'completed'});

	return result;
};

export const runSkillEval = async (
	input: SkillEvalScenarioInput,
): Promise<SkillEvalResult> => {
	const runRoot = input.runRoot ?? runsRoot;
	const runLabel = input.runLabel ? `${input.runLabel}--` : '';
	const runDir = join(
		runRoot,
		sanitizePathPart(input.id),
		`${createTimestamp()}--${runLabel}${sanitizePathPart(input.model)}`,
	);
	const projectRoot = join(runDir, 'project');
	const expectedArtifactPath = join(projectRoot, 'out', 'skills-eval.mp4');
	const sessionDir = join(runDir, 'pi-session');
	const logDir = join(runDir, 'logs');
	const createdAt = new Date().toISOString();

	await rm(runDir, {force: true, recursive: true});
	await mkdir(runDir, {recursive: true});
	await mkdir(logDir, {recursive: true});
	await mkdir(dirname(expectedArtifactPath), {recursive: true});
	await copyBlankTemplate({
		projectName: `skills-eval-${sanitizePathPart(input.id)}`,
		projectRoot,
	});
	const skillSnapshot = await copySkillsForPiDiscovery({
		projectRoot,
		skillSnapshot: input.skillSnapshot,
		skillsSourcePath: input.skillsSourcePath,
	});
	const install = await runPhase({
		command: ['bun', 'install'],
		cwd: projectRoot,
		input,
		phase: 'install',
	});

	if (install.exitCode !== 0) {
		throw new Error(describeCommandFailure('bun install', install));
	}

	const pi = await runPi({
		model: input.model,
		onOutput: (output) => input.onOutput?.({...output, phase: 'pi'}),
		onPhase: (status) => input.onPhase?.({phase: 'pi', status}),
		projectRoot,
		prompt: input.prompt,
		signal: input.signal,
		sessionDir,
		timeoutMs: input.timeoutMs,
	});
	const piRender = await runPi({
		model: input.model,
		onOutput: (output) => input.onOutput?.({...output, phase: 'pi-render'}),
		onPhase: (status) => input.onPhase?.({phase: 'pi-render', status}),
		projectRoot,
		prompt: createRenderPrompt(expectedArtifactPath),
		signal: input.signal,
		sessionDir,
		sessionFile: pi.sessionFile,
		timeoutMs: input.timeoutMs,
	});
	const piExport = await exportPiSession({
		htmlExport: join(sessionDir, 'session.html'),
		onOutput: (output) => input.onOutput?.({...output, phase: 'pi-export'}),
		onPhase: (status) => input.onPhase?.({phase: 'pi-export', status}),
		projectRoot,
		signal: input.signal,
		sessionFile: piRender.sessionFile,
		timeoutMs: input.timeoutMs,
	});
	const artifacts = await discoverVisualArtifacts(projectRoot);

	if (artifacts.length === 0) {
		throw new Error(
			`No visual artifacts were found in ${relative(repoRoot, projectRoot)}.`,
		);
	}

	const completedAt = new Date().toISOString();
	const manifest = {
		id: input.id,
		evalId: input.evalId,
		evalRunIndex: input.evalRunIndex,
		model: input.model,
		prompt: input.prompt,
		createdAt,
		completedAt,
		runDir,
		projectRoot,
		skillSnapshot,
		pi: {
			sessionFile: piRender.sessionFile,
			htmlExport: piExport.htmlExport,
		},
		artifacts,
		commands: {
			install: await logCommand({command: install, logDir, name: 'install'}),
			pi: await logCommand({command: pi.command, logDir, name: 'pi'}),
			piRender: await logCommand({
				command: piRender.command,
				logDir,
				name: 'pi-render',
			}),
			piExport: await logCommand({
				command: piExport.command,
				logDir,
				name: 'pi-export',
			}),
		},
	} satisfies SkillEvalManifest;
	const manifestPath = join(runDir, 'manifest.json');

	await writeJson(manifestPath, manifest);

	return {
		manifest,
		manifestPath,
		scenario: input,
	};
};
