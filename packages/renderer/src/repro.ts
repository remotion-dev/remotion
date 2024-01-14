import fs from 'node:fs';
import path from 'node:path';
import {findRemotionRoot} from './find-closest-package-json';

/**
 * TODO:
 * 1. x - Log methods replace console methods
 * 2. x - Write the process.argv、node version、os version、remotion version、os platform
 * 3. Save the bundle(serveURL is url or directory path)
 * 		- repro folder name: repro-<bundleName>-<startTime>
 * 		- directory path: CWD or project root
 * 4. if successful copy render output to repro folder
 * 5. zip the repro folder
 * 6. renderMedia method add repro parameter
 * 7. change repro state in cli
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

	process.on('exit',(code) => {
		// TODO: zip the repro folder
		reproLogWriteStream.write(`process exit code: ${code}`);
		reproLogWriteStream.end();
		reproLogWriteStream.close();
	})

	return {
		start() {
			const versions = [
				`[${new Date().toISOString()}] render start`,
				`	args: ${JSON.stringify(process.argv)}`,
				`	node version: ${process.version}`,
				`	os: ${process.platform} ${process.arch}`,
			]
			reproLogWriteStream.write(versions.join('\n') + '\n');
		},
		write(level: string, ...args: Parameters<typeof console.log>[]) {
			if (!args.length) return;
			const startTime = new Date().toISOString();
			const line = `[${startTime}] ${level} ${serializeArgs(args)}`;

			reproLogWriteStream.write(line + '\n');
		},

		renderSucceed(output: string | null) {
			if (output) {
				const outdir = path.resolve(reproFolder, 'out');
				readyDirSync(outdir);

				const fileName = path.basename(output);
				const targetPath = path.join(outdir, fileName);

				fs.copyFileSync(output, targetPath);
			}

			const versions = [
				`[${new Date().toISOString()}] render end`,
				`	output: ${JSON.stringify(output || '')}`,
			]
			reproLogWriteStream.write(versions.join('\n') + '\n');
		}
	};
};

const memoizeReproWriter = () => {
	let instance: ReturnType<typeof reproWriter>;
	return () => {
		if (!instance) {
			instance = reproWriter();
		}
		return instance;
	}
}

export const getReproWrite = memoizeReproWriter();

let shouldOutputRepro = false;

export const setRepro = (should: boolean) => {
	shouldOutputRepro = should;

	should && getReproWrite().start();
};

export const getRepro = () => shouldOutputRepro;

export const reproRenderSucceed = (output: string | null) => {
	getRepro() && getReproWrite().renderSucceed(output);
}
