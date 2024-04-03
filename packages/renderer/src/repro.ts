import {execSync} from 'node:child_process';
import fs, {rmSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {VERSION} from 'remotion/version';
import {chalk} from './chalk';
import {findRemotionRoot} from './find-closest-package-json';
import {isServeUrl} from './is-serve-url';
import type {LogLevel} from './log-level';
import {Log} from './logger';

const REPRO_DIR = '.remotionrepro';
const LOG_FILE_NAME = 'logs.txt';
const INPUT_DIR = 'bundle';
const OUTPUT_DIR = 'output';
const LINE_SPLIT = '\n';

const getZipFileName = (name: string) =>
	`remotion-repro-${name}-${Date.now()}.zip`;

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

const zipFolder = ({
	sourceFolder,
	targetZip,
	indent,
	logLevel,
}: {
	sourceFolder: string;
	targetZip: string;
	indent: boolean;
	logLevel: LogLevel;
}) => {
	const platform = os.platform();
	try {
		Log.info({indent, logLevel}, '+ Creating reproduction ZIP');
		if (platform === 'win32') {
			execSync(
				`powershell.exe Compress-Archive -Path "${sourceFolder}" -DestinationPath "${targetZip}"`,
			);
		} else {
			execSync(`zip -r "${targetZip}" "${sourceFolder}"`);
		}

		rmSync(sourceFolder, {recursive: true});

		Log.info({indent, logLevel}, `${chalk.blue(`+ Repro: ${targetZip}`)}`);
	} catch (error) {
		Log.error(
			{indent, logLevel},
			`Failed to zip repro folder, The repro folder is ${sourceFolder}. You can try manually zip it.`,
		);
		Log.error({indent, logLevel}, error);
	}
};

type ReproWriter = {
	start: (options: {
		serveUrl: string;
		serializedInputPropsWithCustomSchema: string;
		serializedResolvedPropsWithCustomSchema: string;
	}) => void;
	writeLine: (level: string, ...args: Parameters<typeof console.log>[]) => void;
	onRenderSucceed: (options: {
		output: string | null;
		logLevel: LogLevel;
		indent: boolean;
	}) => Promise<void>;
};

const reproWriter = (name: string): ReproWriter => {
	const root = findRemotionRoot();
	const reproFolder = path.join(root, REPRO_DIR);
	const logPath = path.join(reproFolder, LOG_FILE_NAME);
	const zipFile = path.join(root, getZipFileName(name));

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

	const start = ({
		serveUrl,
		serializedInputPropsWithCustomSchema,
		serializedResolvedPropsWithCustomSchema,
	}: {
		serveUrl: string;
		serializedInputPropsWithCustomSchema: string;
		serializedResolvedPropsWithCustomSchema: string;
	}) => {
		const isServe = isServeUrl(serveUrl);

		if (!isServe) {
			const inputDir = path.resolve(reproFolder, INPUT_DIR);
			readyDirSync(inputDir);

			fs.cpSync(serveUrl, inputDir, {recursive: true});
		}

		const serializedProps = path.resolve(reproFolder, 'input-props.json');
		fs.writeFileSync(serializedProps, serializedInputPropsWithCustomSchema);

		const serializedResolvedProps = path.resolve(
			reproFolder,
			'resolved-props.json',
		);
		fs.writeFileSync(
			serializedResolvedProps,
			serializedResolvedPropsWithCustomSchema,
		);

		writeLine('info', [`Args: ${JSON.stringify(process.argv)}`]);
		writeLine('info', [`Node/Bun version: ${process.version}`]);
		writeLine('info', [`OS: ${process.platform}-${process.arch}`]);
		writeLine('info', [`Serve URL: ${serveUrl}`]);
		writeLine('info', [`Remotion version: ${VERSION}`]);
	};

	const onRenderSucceed = ({
		indent,
		logLevel,
		output,
	}: {
		output: string | null;
		logLevel: LogLevel;
		indent: boolean;
	}) => {
		return new Promise<void>((resolve, reject) => {
			try {
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
						zipFolder({
							sourceFolder: reproFolder,
							targetZip: zipFile,
							indent,
							logLevel,
						});
						resolve();
					});
				});
			} catch (error) {
				Log.error({indent: false, logLevel}, `repro render success error:`);
				Log.error({indent: false, logLevel}, error);
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

export const getReproWriter = () => {
	if (!reproWriteInstance) {
		throw new Error('reproWriteInstance is not initialized');
	}

	return reproWriteInstance;
};

export const writeInRepro = (
	level: string,
	...args: Parameters<typeof console.log>
) => {
	if (isReproEnabled()) {
		getReproWriter().writeLine(level, ...args);
	}
};

let shouldRepro = false;

export const enableRepro = ({
	serveUrl,
	compositionName,
	serializedInputPropsWithCustomSchema,
	serializedResolvedPropsWithCustomSchema,
}: {
	serveUrl: string;
	compositionName: string;
	serializedInputPropsWithCustomSchema: string;
	serializedResolvedPropsWithCustomSchema: string;
}) => {
	shouldRepro = true;
	reproWriteInstance = reproWriter(compositionName);
	getReproWriter().start({
		serveUrl,
		serializedInputPropsWithCustomSchema,
		serializedResolvedPropsWithCustomSchema,
	});
};

export const disableRepro = () => {
	shouldRepro = false;
};

export const isReproEnabled = () => shouldRepro;
