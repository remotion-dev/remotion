import {spawn, type StdioOptions} from 'child_process';
import fs, {existsSync, rmSync} from 'fs';
import os from 'os';
import path from 'path';
import {downloadFile} from './download';

const getIsSemVer = (str: string) => {
	return /^[\d]{1}\.[\d]{1,2}\.+/.test(str);
};

const execute = ({
	command,
	printOutput,
	signal,
	cwd,
	shell,
}: {
	command: string;
	printOutput: boolean;
	signal: AbortSignal | null;
	cwd: string | null;
	shell: string | null;
}) => {
	const stdio: StdioOptions = printOutput ? 'inherit' : 'ignore';

	return new Promise<void>((resolve, reject) => {
		const [bin, ...args] = command.split(' ');

		const child = spawn(bin, args, {
			stdio,
			signal: signal ?? undefined,
			cwd: cwd ?? undefined,
			shell: shell ?? undefined,
		});

		child.on('exit', (code, exitSignal) => {
			if (code !== 0) {
				reject(
					new Error(
						`Error while executing ${command}. Exit code: ${code}, signal: ${exitSignal}`,
					),
				);
				return;
			}

			resolve();
		});
	});
};

const installForWindows = async ({
	version,
	to,
	printOutput,
	signal,
}: {
	version: string;
	to: string;
	printOutput: boolean;
	signal: AbortSignal | null;
}) => {
	if (!getIsSemVer(version)) {
		throw new Error(`Non-semantic version provided. Only releases of Whisper.cpp are supported on Windows (e.g., 1.5.4). Provided version:
		${version}. See https://www.remotion.dev/docs/install-whisper-cpp/install-whisper-cpp#version for more information.`);
	}

	const url =
		version === '1.5.5'
			? 'https://remotion-ffmpeg-binaries.s3.eu-central-1.amazonaws.com/whisper-bin-x64-1-5-5.zip'
			: `https://github.com/ggerganov/whisper.cpp/releases/download/v${version}/whisper-bin-x64.zip`;

	const filePath = path.join(process.cwd(), 'whisper-bin-x64.zip');
	const fileStream = fs.createWriteStream(filePath);

	await downloadFile({
		fileStream,
		printOutput,
		url,
		onProgress: undefined,
		signal,
	});

	execute({
		command: `Expand-Archive -Force ${filePath} ${to}`,
		shell: 'powershell',
		printOutput,
		signal,
		cwd: null,
	});

	rmSync(filePath);
};

const installWhisperForUnix = async ({
	version,
	to,
	printOutput,
	signal,
}: {
	version: string;
	to: string;
	printOutput: boolean;
	signal: AbortSignal | null;
}) => {
	await execute({
		command: `git clone https://github.com/ggerganov/whisper.cpp.git ${to}`,
		printOutput,
		signal,
		cwd: null,
		shell: null,
	});

	const ref = getIsSemVer(version) ? `v${version}` : version;

	await execute({
		command: `git checkout ${ref}`,
		printOutput,
		cwd: to,
		signal,
		shell: null,
	});

	await execute({
		command: 'make',
		cwd: to,
		signal,
		printOutput,
		shell: null,
	});
};

export const getWhisperExecutablePath = (whisperPath: string) => {
	return os.platform() === 'win32'
		? path.join(whisperPath, 'main.exe')
		: path.join(whisperPath, './main');
};

export const installWhisperCpp = async ({
	version,
	to,
	printOutput = true,
	signal,
}: {
	version: string;
	to: string;
	signal?: AbortSignal | null;
	printOutput?: boolean;
}): Promise<{
	alreadyExisted: boolean;
}> => {
	if (existsSync(to)) {
		if (!existsSync(getWhisperExecutablePath(to))) {
			if (printOutput) {
				console.log(
					`Whisper folder exists but the executable (${to}) is missing. Delete ${to} and try again.`,
				);
			}

			return Promise.resolve({alreadyExisted: false});
		}

		if (printOutput) {
			console.log(`Whisper already exists at ${to}`);
		}

		return Promise.resolve({alreadyExisted: true});
	}

	if (process.platform === 'darwin' || process.platform === 'linux') {
		installWhisperForUnix({version, to, printOutput, signal: signal ?? null});
		return Promise.resolve({alreadyExisted: false});
	}

	if (process.platform === 'win32') {
		await installForWindows({version, to, printOutput, signal: signal ?? null});
		return Promise.resolve({alreadyExisted: false});
	}

	throw new Error(`Unsupported platform: ${process.platform}`);
};
