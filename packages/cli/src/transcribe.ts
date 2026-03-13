import path from 'node:path';
import type {WhisperModel} from '@remotion/install-whisper-cpp';
import type {Language} from '@remotion/install-whisper-cpp';
import type {LogLevel} from '@remotion/renderer';
import {Log} from './log';
import {parsedCli, quietFlagProvided} from './parsed-cli';
import {printFact} from './progress-bar';
import {transcribeFlow} from './transcribe-flow';

export const transcribeCommand = async (
	remotionRoot: string,
	args: (string | number)[],
	logLevel: LogLevel,
) => {
	const inputFile = args[0];
	if (!inputFile || typeof inputFile !== 'string') {
		Log.error(
			{indent: false, logLevel},
			'No input file specified. Usage: npx remotion transcribe <input-file> [output-file]',
		);
		process.exit(1);
	}

	const resolvedInputFile = path.resolve(remotionRoot, inputFile);

	const outputArg = args[1];
	const outputFile =
		outputArg && typeof outputArg === 'string'
			? path.resolve(remotionRoot, outputArg)
			: path.resolve(
					remotionRoot,
					path.basename(inputFile, path.extname(inputFile)) + '.json',
				);

	const model = ((parsedCli.model as string | undefined) ??
		'medium') as WhisperModel;
	const whisperVersion =
		(parsedCli['whisper-version'] as string | undefined) ?? '1.5.5';
	const whisperPath =
		(parsedCli['whisper-path'] as string | undefined) ?? './whisper.cpp';
	const modelFolder = parsedCli['model-folder'] as string | undefined;
	const language = parsedCli.language as Language | undefined;
	const translateToEnglish = Boolean(parsedCli['translate-to-english']);
	const tokenLevelTimestamps = parsedCli['token-level-timestamps'] !== false;
	const flashAttention = Boolean(parsedCli['flash-attention']);
	const quiet = quietFlagProvided();

	const fact = printFact('info');

	fact({
		indent: false,
		logLevel,
		left: 'Input',
		right: resolvedInputFile,
		color: undefined,
	});
	fact({
		indent: false,
		logLevel,
		left: 'Output',
		right: outputFile,
		color: undefined,
	});
	fact({
		indent: false,
		logLevel,
		left: 'Model',
		right: model,
		color: undefined,
	});
	fact({
		indent: false,
		logLevel,
		left: 'Whisper version',
		right: whisperVersion,
		color: undefined,
	});

	Log.info({indent: false, logLevel});

	await transcribeFlow({
		inputFile: resolvedInputFile,
		outputFile,
		model,
		whisperVersion,
		whisperPath,
		modelFolder,
		language,
		translateToEnglish,
		tokenLevelTimestamps,
		flashAttention,
		logLevel,
		quiet,
	});
};
