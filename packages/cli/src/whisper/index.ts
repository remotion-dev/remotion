import type {LogLevel} from '@remotion/renderer';
import {formatBytes} from '@remotion/studio-shared';
import minimist from 'minimist';
import {chalk} from '../chalk';
import {Log} from '../log';
import {printHelp} from '../print-help';
import {LABEL_WIDTH} from '../progress-bar';
import {yesOrNo} from '../yes-or-no';
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
}): Promise<string | null> => {
	const [command, ...args] = argv;
	if (command === undefined || command === 'help') {
		printHelp(logLevel, ['whisper', ...args]);
		return null;
	}

	if (command === 'transcribe') {
		return transcribeCommand({remotionRoot, argv: args, logLevel});
	}

	if (
		command !== 'ls' &&
		command !== 'install' &&
		command !== 'rm' &&
		command !== 'rmall'
	) {
		throw new Error(
			`Unknown Whisper command "${command}". Run bunx remotion whisper --help to list the commands.`,
		);
	}

	const commandLine = minimist(args, {
		string: ['_', 'log'],
		boolean: ['quiet', 'installed', 'yes'],
		alias: {q: 'quiet', y: 'yes'},
	});
	const logOptions = {indent: false, logLevel};
	if (command === 'rmall') {
		if (commandLine._.length !== 0) {
			throw new Error('Usage: bunx remotion whisper rmall [--yes]');
		}

		const {getAvailableModels, removeWhisperModel} =
			await loadWhisperWebGpu(remotionRoot);
		if (!commandLine.yes) {
			if (!process.stdin.isTTY || !process.stdout.isTTY || process.env.CI) {
				throw new Error(
					'Pass --yes to remove all cached Whisper models in a non-interactive terminal.',
				);
			}

			const confirmed = await yesOrNo({
				question: 'Remove all Whisper models from the local CLI cache? (y/N)',
				defaultValue: false,
			});
			if (!confirmed) {
				Log.info(logOptions, 'Cancelled.');
				return null;
			}
		}

		for (const {name} of getAvailableModels()) {
			await removeWhisperModel({model: name});
		}

		Log.info(
			logOptions,
			'Cleared all Whisper models from the local CLI cache.',
		);
		return null;
	}

	if (command === 'ls') {
		if (commandLine._.length !== 0) {
			throw new Error('Usage: bunx remotion whisper ls [--installed]');
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
		const visibleModels = commandLine.installed
			? models.filter(({cached}) => cached)
			: models;
		if (visibleModels.length === 0) {
			Log.info(logOptions, 'No Whisper models installed.');
			return null;
		}

		Log.info(
			logOptions,
			chalk.gray(
				`${'Model'.padEnd(LABEL_WIDTH)} ${'Download size'.padEnd(16)} Cache`,
			),
		);
		for (const {name, size, cached} of visibleModels) {
			Log.info(
				logOptions,
				`${name.padEnd(LABEL_WIDTH)} ${size.padEnd(16)} ${cached ? 'Installed' : 'Not installed'}`,
			);
		}

		return null;
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
		return null;
	}

	const progress = createWhisperProgress({
		quiet: commandLine.quiet,
		logLevel,
		outputToStdout: false,
	});
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
	);
	return null;
};
