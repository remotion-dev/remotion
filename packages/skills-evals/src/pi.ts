import {stat} from 'node:fs/promises';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
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

const evalStreamExtensionPath = join(
	dirname(fileURLToPath(import.meta.url)),
	'pi-stream-extension.ts',
);

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
	onPhase,
	projectRoot,
	sessionFile,
	sessionDir,
	model,
	prompt,
	timeoutMs,
}: {
	onOutput?: (output: CommandOutput) => void;
	onPhase?: (status: 'completed' | 'started') => void;
	projectRoot: string;
	sessionFile?: string;
	sessionDir: string;
	model: string;
	prompt: string;
	timeoutMs?: number;
}): Promise<PiRun> => {
	const command = [
		'pi',
		'--extension',
		evalStreamExtensionPath,
		'--eval-stream',
		'all',
		'--model',
		model,
		'--session-dir',
		sessionDir,
		...(sessionFile ? ['--session', sessionFile] : []),
		'-p',
		prompt,
	];
	onPhase?.('started');
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

	onPhase?.('completed');

	return {
		command: result,
		sessionFile: await findNewestSessionFile(sessionDir),
	};
};

export const exportPiSession = async ({
	htmlExport,
	onOutput,
	onPhase,
	projectRoot,
	sessionFile,
}: {
	htmlExport: string;
	onOutput?: (output: CommandOutput) => void;
	onPhase?: (status: 'completed' | 'started') => void;
	projectRoot: string;
	sessionFile: string;
}): Promise<PiExport> => {
	onPhase?.('started');
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

	onPhase?.('completed');

	return {
		command: exportCommand,
		htmlExport,
	};
};
