import {execSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {findRemotionRoot} from './find-closest-package-json';
import {isServeUrl} from './is-serve-url';
import {Log} from './logger';

const REPRO_DIR = '.remotionrepro';
const LOG_FILE_NAME = 'repro.log';
const INPUT_DIR = 'input';
const OUTPUT_DIR = 'output';
const LINE_SPLIT = '\n';

const getZipFileName = () => `remotion-render-repro-${Date.now()}.zip`;

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

const zipFolder = (sourceFolder: string, targetZip: string) => {
	const platform = os.platform();
	try {
		if (platform === 'win32') {
			execSync(
				`powershell.exe Compress-Archive -Path "${sourceFolder}" -DestinationPath "${targetZip}"`,
				{stdio: 'inherit'},
			);
		} else {
			execSync(`zip -r "${targetZip}" "${sourceFolder}"`, {stdio: 'inherit'});
		}

		Log.info(`${LINE_SPLIT}Zipped repro folder ${targetZip}`);
	} catch (error) {
		Log.error(
			`Failed to zip repro folder, The repro folder is ${sourceFolder}. You can try manually zip it.`,
		);
		Log.error(error);
	}
};

const reproWriter = () => {
	const root = findRemotionRoot();
	const reproFolder = path.join(root, REPRO_DIR);
	const logPath = path.join(reproFolder, LOG_FILE_NAME);
	const zipFile = path.join(root, getZipFileName());

	readyDirSync(reproFolder);

	const reproLogWriteStream = fs.createWriteStream(logPath, {flags: 'a'});

	const serializeArgs = (args: Parameters<typeof console.log>[]) =>
		JSON.stringify(args);

	const writeLine = (
		level: string,
		...args: Parameters<typeof console.log>[]
	) => {
		if (!args.length) return;
		const startTime = new Date().toISOString();
		const line = `[${startTime}] ${level} ${serializeArgs(args)}`;

		reproLogWriteStream.write(line + LINE_SPLIT);
	};

	const start = (serveUrl: string) => {
		const isServe = isServeUrl(serveUrl);

		if (!isServe) {
			const inputDir = path.resolve(reproFolder, INPUT_DIR);
			readyDirSync(inputDir);

			fs.cpSync(serveUrl, inputDir, {recursive: true});
		}

		const versions = [
			`[${new Date().toISOString()}] render start`,
			`	args: ${JSON.stringify(process.argv.slice(2))}`,
			`	node version: ${process.version}`,
			`	os: ${process.platform}-${process.arch}`,
			`	serveUrl: ${serveUrl}`,
		];
		reproLogWriteStream.write(versions.join(LINE_SPLIT) + LINE_SPLIT);
	};

	const onRenderSucceed = (output: string | null) => {
		return new Promise<void>((resolve, reject) => {
			try {
				const versions = [
					`[${new Date().toISOString()}] render success`,
					` output: ${JSON.stringify(output || '')}`,
				];
				reproLogWriteStream.write(versions.join(LINE_SPLIT) + LINE_SPLIT);

				if (output) {
					const outputDir = path.resolve(reproFolder, OUTPUT_DIR);
					readyDirSync(outputDir);

					const fileName = path.basename(output);
					const targetPath = path.join(outputDir, fileName);

					fs.copyFileSync(output, targetPath);
				}

				disableRepro();

				reproLogWriteStream.end(() => {
					reproLogWriteStream.close(() => {
						zipFolder(reproFolder, zipFile);
						resolve();
					});
				});
			} catch (error) {
				Log.error(`repro render success error:`);
				Log.error(error);
				reject(error);
			}
		});
	};

	return {
		start,
		writeLine,
		onRenderSucceed,
	};
};

let reproWriteInstance: ReturnType<typeof reproWriter> | null = null;

const getReproWriter = () => {
	if (!reproWriteInstance) {
		reproWriteInstance = reproWriter();
	}

	return reproWriteInstance;
};

export const writeInRepro = (
	level: string,
	...args: Parameters<typeof console.log>
) => {
	if (isEnableRepro()) {
		getReproWriter().writeLine(level, ...args);
	}
};

export const reproRenderSucceed = (output: string | null) => {
	if (isEnableRepro()) {
		return getReproWriter().onRenderSucceed(output);
	}

	return Promise.resolve();
};

let shouldRepro = false;

export const enableRepro = (serveUrl: string) => {
	shouldRepro = true;
	getReproWriter().start(serveUrl);
};

export const disableRepro = () => {
	shouldRepro = false;
};

export const isEnableRepro = () => shouldRepro;
