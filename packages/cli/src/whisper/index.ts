import type {LogLevel} from '@remotion/renderer';
import {formatBytes} from '@remotion/studio-shared';
import minimist from 'minimist';
import {chalk} from '../chalk';
import {Log} from '../log';
import {printHelp} from '../print-help';
import {LABEL_WIDTH} from '../progress-bar';
import {ensureWhisperModel, getWhisperModel, loadWhisperWebGpu} from './models';
import {createWhisperProgress} from './progress';
import {transcribeCommand} from './transcribe';

export const whisperCommand = async ({
	remotionRoot,
	argv,
	logLevel,
}: {
	remotionRoot: string;
	argv: string[];
	logLevel: LogLevel;
}) => {
	const [command, ...args] = argv;
	if (command === undefined || command === 'help') {
		printHelp(logLevel, ['whisper', ...args]);
		return;
	}

	if (command === 'transcribe') {
		await transcribeCommand({remotionRoot, argv: args, logLevel});
		return;
	}

	if (command !== 'ls' && command !== 'install' && command !== 'rm') {
		throw new Error(
			`Unknown Whisper command "${command}". Run bunx remotion whisper --help to list the commands.`,
		);
	}

	const commandLine = minimist(args, {
		string: ['_', 'log'],
		boolean: ['quiet'],
		alias: {q: 'quiet'},
	});
	const logOptions = {indent: false, logLevel};
	if (command === 'ls') {
		if (commandLine._.length !== 0) {
			throw new Error('Usage: bunx remotion whisper ls');
		}

		const {getAvailableModels, isWhisperModelCached} =
			await loadWhisperWebGpu(remotionRoot);
		const models = await Promise.all(
			getAvailableModels().map(async ({name, webGpuDownloadSize}) => ({
				name,
				size: formatBytes(webGpuDownloadSize),
				cached: await isWhisperModelCached({model: name}),
			})),
		);
		Log.info(
			logOptions,
			chalk.gray(
				`${'Model'.padEnd(LABEL_WIDTH)} ${'Download size'.padEnd(16)} Cache`,
			),
		);
		for (const {name, size, cached} of models) {
			Log.info(
				logOptions,
				`${name.padEnd(LABEL_WIDTH)} ${size.padEnd(16)} ${cached ? 'Installed' : 'Not installed'}`,
			);
		}

		return;
	}

	const [requestedModel, ...extras] = commandLine._;
	if (!requestedModel || extras.length > 0) {
		throw new Error(`Usage: bunx remotion whisper ${command} <model>`);
	}

	const whisper = await loadWhisperWebGpu(remotionRoot);
	const {name: model} = getWhisperModel(whisper, requestedModel);
	if (command === 'rm') {
		await whisper.removeWhisperModel({model});
		Log.info(logOptions, `Cleared cached files for ${model}.`);
		return;
	}

	const progress = createWhisperProgress({quiet: commandLine.quiet, logLevel});
	let alreadyDownloaded: boolean;
	try {
		({alreadyDownloaded} = await ensureWhisperModel({
			whisper,
			model,
			progress,
		}));
	} finally {
		progress.finish();
	}

	Log.info(
		logOptions,
		chalk.blue(
			`${(alreadyDownloaded ? '○' : '+').padEnd(LABEL_WIDTH)} ${model}`,
		),
		chalk.gray(alreadyDownloaded ? 'Already installed' : 'Installed'),
	);
};
