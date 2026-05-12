import {readdir, stat} from 'node:fs/promises';
import {join} from 'node:path';
import {
	commandToString,
	runCommand,
	type CommandOutput,
	type CommandResult,
} from './command';

export type PiRun = {
	command: CommandResult;
	sessionFile: string;
	htmlExport: string;
	exportCommand: CommandResult;
};

export type PiOutput = CommandOutput & {
	phase: 'pi' | 'pi-export';
};

const harnessMessages = [
	`Harness instruction:
Generate and render a video artifact that can be reviewed. Prefer an MP4 file, and do not stop after producing only a still image or screenshot.`,
];

const composePiPrompt = (scenarioPrompt: string) =>
	[scenarioPrompt, ...harnessMessages].join('\n\n');

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

const findNewestSessionFile = async (sessionDir: string) => {
	const sessionFiles = (await listFilesRecursively(sessionDir)).filter((file) =>
		file.endsWith('.jsonl'),
	);

	if (sessionFiles.length === 0) {
		throw new Error(`Pi did not write a session jsonl file to ${sessionDir}.`);
	}

	const filesWithModifiedTime = await Promise.all(
		sessionFiles.map(async (file) => ({
			file,
			mtimeMs: (await stat(file)).mtimeMs,
		})),
	);

	filesWithModifiedTime.sort((a, b) => b.mtimeMs - a.mtimeMs);

	return filesWithModifiedTime[0].file;
};

export const runPi = async ({
	onOutput,
	projectRoot,
	sessionDir,
	model,
	prompt,
	timeoutMs,
}: {
	onOutput?: (output: PiOutput) => void;
	projectRoot: string;
	sessionDir: string;
	model: string;
	prompt: string;
	timeoutMs?: number;
}): Promise<PiRun> => {
	const command = [
		'pi',
		'--model',
		model,
		'--session-dir',
		sessionDir,
		'-p',
		composePiPrompt(prompt),
	];
	const result = await runCommand({
		command,
		cwd: projectRoot,
		onOutput: (output) => onOutput?.({...output, phase: 'pi'}),
		timeoutMs,
	});

	if (result.exitCode !== 0) {
		throw new Error(
			`Pi failed (${result.exitCode}): ${commandToString(result.command)}\n${result.stderr}`,
		);
	}

	const sessionFile = await findNewestSessionFile(sessionDir);
	const htmlExport = join(sessionDir, 'session.html');
	const exportCommand = await runCommand({
		command: ['pi', '--export', sessionFile, htmlExport],
		cwd: projectRoot,
		onOutput: (output) => onOutput?.({...output, phase: 'pi-export'}),
	});

	if (exportCommand.exitCode !== 0) {
		throw new Error(
			`Pi export failed (${exportCommand.exitCode}): ${exportCommand.stderr}`,
		);
	}

	return {
		command: result,
		sessionFile,
		htmlExport,
		exportCommand,
	};
};
