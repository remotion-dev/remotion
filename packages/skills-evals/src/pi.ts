import {stat} from 'node:fs/promises';
import {
	commandToString,
	runCommand,
	type CommandOutput,
	type CommandResult,
} from './command';
import {listFilesRecursively} from './files';

export type PiRun = {
	command: CommandResult;
	sessionFile: string;
};

export type PiExport = {
	command: CommandResult;
	htmlExport: string;
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
	sessionFile,
	sessionDir,
	model,
	prompt,
	timeoutMs,
}: {
	onOutput?: (output: CommandOutput) => void;
	projectRoot: string;
	sessionFile?: string;
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
		...(sessionFile ? ['--session', sessionFile] : []),
		'-p',
		prompt,
	];
	const result = await runCommand({
		command,
		cwd: projectRoot,
		onOutput,
		timeoutMs,
	});

	if (result.exitCode !== 0) {
		throw new Error(
			`Pi failed (${result.exitCode}): ${commandToString(result.command)}\n${result.stderr}`,
		);
	}

	return {
		command: result,
		sessionFile: await findNewestSessionFile(sessionDir),
	};
};

export const exportPiSession = async ({
	htmlExport,
	onOutput,
	projectRoot,
	sessionFile,
}: {
	htmlExport: string;
	onOutput?: (output: CommandOutput) => void;
	projectRoot: string;
	sessionFile: string;
}): Promise<PiExport> => {
	const exportCommand = await runCommand({
		command: ['pi', '--export', sessionFile, htmlExport],
		cwd: projectRoot,
		onOutput,
	});

	if (exportCommand.exitCode !== 0) {
		throw new Error(
			`Pi export failed (${exportCommand.exitCode}): ${exportCommand.stderr}`,
		);
	}

	return {
		command: exportCommand,
		htmlExport,
	};
};
