import type {StdioOptions} from 'child_process';
import fs, {existsSync, rmSync} from 'fs';
import {execSync} from 'node:child_process';
import {Readable} from 'node:stream';
import {finished} from 'node:stream/promises';
import type {ReadableStream} from 'node:stream/web';
import path from 'path';

const installForWindows = async ({
	version,
	to,
	printOutput,
}: {
	version: string;
	to: string;
	printOutput: boolean;
}) => {
	const url = `https://github.com/ggerganov/whisper.cpp/releases/download/v${version}/whisper-bin-x64.zip`;

	const filePath = path.join(process.cwd(), 'whisper-bin-x64.zip');
	const fileStream = fs.createWriteStream(filePath);

	const {body} = await fetch(url);
	if (body === null) {
		throw new Error('Failed to download whisper binary');
	}

	await finished(Readable.fromWeb(body as ReadableStream).pipe(fileStream));

	execSync(`Expand-Archive -Force ${filePath} ${to}`, {
		shell: 'powershell',
		stdio: printOutput ? 'inherit' : 'ignore',
	});

	rmSync(filePath);
};

const installWhisperForUnix = ({
	version,
	to,
	printOutput,
}: {
	version: string;
	to: string;
	printOutput: boolean;
}) => {
	const stdio: StdioOptions = printOutput ? 'inherit' : 'ignore';
	execSync(`git clone https://github.com/ggerganov/whisper.cpp.git ${to}`, {
		stdio,
	});

	execSync(`git checkout v${version}`, {
		stdio,
		cwd: to,
	});

	execSync(`make`, {
		cwd: to,
		stdio,
	});
};

export const installWhisperCpp = async ({
	version,
	to,
	printOutput = true,
}: {
	version: string;
	to: string;
	printOutput?: boolean;
}): Promise<{
	alreadyExisted: boolean;
}> => {
	if (existsSync(to)) {
		if (printOutput) {
			console.log(`Whisper already exists at ${to}`);
		}

		return Promise.resolve({alreadyExisted: true});
	}

	if (process.platform === 'darwin' || process.platform === 'linux') {
		installWhisperForUnix({version, to, printOutput});
		return Promise.resolve({alreadyExisted: false});
	}

	if (process.platform === 'win32') {
		await installForWindows({version, to, printOutput});
		return Promise.resolve({alreadyExisted: false});
	}

	throw new Error(`Unsupported platform: ${process.platform}`);
};
