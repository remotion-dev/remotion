import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
	downloadWhisperModel,
	installWhisperCpp,
	toCaptions,
	transcribe,
} from '@remotion/install-whisper-cpp';
import type {WhisperModel} from '@remotion/install-whisper-cpp';
import type {Language} from '@remotion/install-whisper-cpp';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {formatBytes} from '@remotion/studio-shared';
import {chalk} from './chalk';
import {Log} from './log';
import {createOverwriteableCliOutput} from './progress-bar';
import {shouldUseNonOverlayingLogger} from './should-use-non-overlaying-logger';
import {
	initialTranscribeProgress,
	makeTranscribeProgress,
	type TranscribeProgress,
} from './transcribe-progress';

export const transcribeFlow = async ({
	inputFile,
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
}: {
	inputFile: string;
	outputFile: string;
	model: WhisperModel;
	whisperVersion: string;
	whisperPath: string;
	modelFolder: string | undefined;
	language: Language | undefined;
	translateToEnglish: boolean;
	tokenLevelTimestamps: boolean;
	flashAttention: boolean;
	logLevel: LogLevel;
	quiet: boolean;
}) => {
	const updatesDontOverwrite = shouldUseNonOverlayingLogger({logLevel});
	const isVerbose = RenderInternals.isEqualOrBelowLogLevel(logLevel, 'verbose');

	const cliOutput = createOverwriteableCliOutput({
		quiet,
		cancelSignal: null,
		updatesDontOverwrite,
		indent: false,
	});

	const progress: TranscribeProgress = {
		...initialTranscribeProgress,
	};

	const updateProgress = () => {
		cliOutput.update(makeTranscribeProgress(progress), false);
	};

	const resolvedModelFolder = modelFolder ?? path.join(whisperPath, 'models');

	// Phase 1: Install whisper.cpp
	progress.install = {type: 'in-progress', progress: null, latestLine: null};
	updateProgress();

	const installStart = Date.now();
	const {alreadyExisted: whisperAlreadyExisted} = await installWhisperCpp({
		version: whisperVersion,
		to: whisperPath,
		printOutput: isVerbose,
		onOutput: isVerbose
			? undefined
			: (line) => {
					progress.install = {
						type: 'in-progress',
						progress: null,
						latestLine: line,
					};
					updateProgress();
				},
	});

	progress.install = {
		type: 'done',
		doneIn: whisperAlreadyExisted ? 0 : Date.now() - installStart,
		alreadyExisted: whisperAlreadyExisted,
	};
	updateProgress();

	// Phase 2: Download model
	progress.download = {type: 'in-progress', progress: 0, latestLine: null};
	updateProgress();

	const downloadStart = Date.now();
	const {alreadyExisted: modelAlreadyExisted} = await downloadWhisperModel({
		model,
		folder: resolvedModelFolder,
		printOutput: isVerbose,
		onProgress: (downloadedBytes, totalBytes) => {
			progress.download = {
				type: 'in-progress',
				progress: downloadedBytes / totalBytes,
				latestLine: null,
			};
			updateProgress();
		},
	});

	progress.download = {
		type: 'done',
		doneIn: modelAlreadyExisted ? 0 : Date.now() - downloadStart,
		alreadyExisted: modelAlreadyExisted,
	};
	updateProgress();

	// Phase 3: Convert to 16kHz WAV
	progress.convert = {type: 'in-progress', progress: null, latestLine: null};
	updateProgress();

	const convertStart = Date.now();
	const tempWavPath = path.join(
		os.tmpdir(),
		`remotion-transcribe-${Date.now()}.wav`,
	);

	try {
		const ffmpegTask = RenderInternals.callFf({
			bin: 'ffmpeg',
			args: ['-i', inputFile, '-ar', '16000', tempWavPath, '-y'],
			indent: false,
			logLevel,
			binariesDirectory: null,
			cancelSignal: undefined,
		});

		await ffmpegTask;

		progress.convert = {
			type: 'done',
			doneIn: Date.now() - convertStart,
			alreadyExisted: false,
		};
		updateProgress();

		// Phase 4: Transcribe
		progress.transcribe = {
			type: 'in-progress',
			progress: 0,
			latestLine: null,
		};
		updateProgress();

		const transcribeStart = Date.now();
		const result = await transcribe({
			inputPath: tempWavPath,
			whisperPath,
			whisperCppVersion: whisperVersion,
			model,
			modelFolder: resolvedModelFolder,
			tokenLevelTimestamps: tokenLevelTimestamps as true,
			printOutput: isVerbose,
			language: language ?? undefined,
			translateToEnglish,
			flashAttention,
			onProgress: (p) => {
				progress.transcribe = {
					type: 'in-progress',
					progress: p,
					latestLine: null,
				};
				updateProgress();
			},
		});

		progress.transcribe = {
			type: 'done',
			doneIn: Date.now() - transcribeStart,
			alreadyExisted: false,
		};
		updateProgress();

		const {captions} = toCaptions({whisperCppOutput: result});
		const jsonOutput = JSON.stringify(captions, null, 2);
		fs.writeFileSync(outputFile, jsonOutput);

		Log.info({indent: false, logLevel});
		Log.info(
			{indent: false, logLevel},
			[
				chalk.blue('+'),
				chalk.blue(outputFile),
				chalk.gray(`(${formatBytes(Buffer.byteLength(jsonOutput))})`),
			].join(' '),
		);
	} finally {
		if (fs.existsSync(tempWavPath)) {
			fs.unlinkSync(tempWavPath);
		}
	}
};
