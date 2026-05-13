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

type PiAvailability = {
	message?: string;
	ok: boolean;
};

const piSetupMessage =
	'Pi is not available. Install it from https://pi.dev, then run `pi config` to configure a provider before running skills evals.';
const evalStreamExtensionPath = join(
	dirname(fileURLToPath(import.meta.url)),
	'pi-stream-extension.ts',
);
let piAvailabilityPromise: Promise<PiAvailability> | null = null;

export const checkPiAvailable = ({cwd}: {cwd: string}) => {
	piAvailabilityPromise ??= runCommand({
		command: ['pi', '--version'],
		cwd,
	})
		.then((result) => {
			if (result.exitCode === 0) {
				return {ok: true};
			}

			return {
				message: `${piSetupMessage}\n\n\`pi --version\` failed with exit code ${result.exitCode}:\n${result.stderr}`,
				ok: false,
			};
		})
		.catch((error: unknown) => ({
			message: `${piSetupMessage}\n\n${error instanceof Error ? error.message : String(error)}`,
			ok: false,
		}));

	return piAvailabilityPromise;
};

const assertPiAvailable = async ({cwd}: {cwd: string}) => {
	const availability = await checkPiAvailable({cwd});

	if (!availability.ok) {
		throw new Error(availability.message ?? piSetupMessage);
	}
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
	await assertPiAvailable({cwd: projectRoot});

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
