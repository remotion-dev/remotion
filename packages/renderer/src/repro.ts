import fs from 'node:fs';
import path from 'node:path';
import {findRemotionRoot} from './find-closest-package-json';
import type {LogInstance, LogOptions} from './logger';

/**
 * TODO:
 * 1. Log methods replace console methods
 * 2. Write the process.argv、node version、os version、remotion version、os platform
 * 3. Save the bundle(serveURL is url or directory path)
 * 		- repro folder name: repro-<bundleName>-<startTime>
 * 		- directory path: CWD or project root
 * 4. if successful copy render output to repro folder
 * 5. zip the repro folder
 */

const readyDirSync = (dir: string) => {
	let items;
	try {
		items = fs.readdirSync(dir);
	} catch {
		return fs.mkdirSync(dir, {recursive: true});
	}

	items.forEach((item) => {
		item = path.join(dir, item);
		fs.rmSync(item, {recursive: true, force: true});
	});
};

const reproWriter = () => {
	const root = findRemotionRoot();
	const reproFolder = path.join(root, '.repro');
	const logPath = path.join(reproFolder, 'repro.log');

	readyDirSync(reproFolder);

	const reproLogWriteStream = fs.createWriteStream(logPath, {flags: 'a'});

	const serializeArgs = (args: Parameters<typeof console.log>[]) =>
		JSON.stringify(args);

	return {
		open() {},
		write(level: string, ...args: Parameters<typeof console.log>[]) {
			if (!args.length) return;
			const startTime = new Date().toISOString();
			const line = `[${startTime}] ${level} ${serializeArgs(args)}`;

			reproLogWriteStream.write(line + '\n');
		},
		// TODO: close the stream on exit
		close() {
			reproLogWriteStream.end();
			reproLogWriteStream.close();
		},
	};
};

export function withRepro(log: LogInstance): LogInstance {
	const reproWrite = reproWriter();
	return {
		...log,
		verbose: (...args: Parameters<typeof console.log>) => {
			reproWrite.write('verbose', ...args);
			return log.verbose(...args);
		},
		info: (...args: Parameters<typeof console.log>) => {
			reproWrite.write('info', ...args);
			return log.info(...args);
		},
		warn: (options: LogOptions, ...args: Parameters<typeof console.log>) => {
			reproWrite.write('warn', ...args);
			return log.warn(options, ...args);
		},
		error: (...args: Parameters<typeof console.log>) => {
			reproWrite.write('error', ...args);
			return log.error(...args);
		},
	};
}

let shouldOutputRepro = false;

export const setRepro = (should: boolean) => {
	shouldOutputRepro = should;
};

export const getRepro = () => shouldOutputRepro;
