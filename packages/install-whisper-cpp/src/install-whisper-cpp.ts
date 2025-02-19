/* eslint-disable no-console */
import {spawn, type StdioOptions} from 'child_process';
import fs, {existsSync, rmSync} from 'fs';
import os from 'os';
import path from 'path';
import {downloadFile} from './download';

const getIsSemVer = (str: string) => {
	return /^[\d]{1}\.[\d]{1,2}\.+/.test(str);
};

const execute = ({
	printOutput,
	signal,
	cwd,
	shell,
	args,
	bin,
}: {
	printOutput: boolean;
	signal: AbortSignal | null;
	cwd: string | null;
	shell: string | null;
	bin: string;
	args: string[];
}) => {
	const stdio: StdioOptions = printOutput ? 'inherit' : 'ignore';

	return new Promise<void>((resolve, reject) => {
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
						`Error while executing ${bin} ${args.join(' ')}. Exit code: ${code}, signal: ${exitSignal}`,
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

	await execute({
		shell: 'powershell',
		printOutput,
		signal,
		cwd: null,
		bin: 'Expand-Archive',
		args: ['-Force', filePath, to],
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
}): Promise<void> => {
	await execute({
		bin: 'git',
		args: ['clone', 'https://github.com/ggerganov/whisper.cpp.git', to],
		printOutput,
		signal,
		cwd: null,
		shell: null,
	});

	const ref = getIsSemVer(version) ? `v${version}` : version;

	await execute({
		bin: 'git',
		args: ['checkout', ref],
		printOutput,
		cwd: to,
		signal,
		shell: null,
	});

	await execute({
		args: [],
		bin: 'make',
		cwd: to,
		signal,
		printOutput,
		shell: null,
	});
};

export const getWhisperExecutablePath = (whisperPath: string) => {
	return os.platform() === 'win32'
		? path.join(path.resolve(process.cwd(), whisperPath), 'main.exe')
		: path.join(path.resolve(process.cwd(), whisperPath), './main');
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
				throw new Error(
					`Whisper folder ${to} exists but the executable (${getWhisperExecutablePath(to)}) is missing. Delete ${to} and try again.`,
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
		await installWhisperForUnix({
			version,
			to,
			printOutput,
			signal: signal ?? null,
		});
		return Promise.resolve({alreadyExisted: false});
	}

	if (process.platform === 'win32') {
		await installForWindows({version, to, printOutput, signal: signal ?? null});
		return Promise.resolve({alreadyExisted: false});
	}

	throw new Error(`Unsupported platform: ${process.platform}`);
};
