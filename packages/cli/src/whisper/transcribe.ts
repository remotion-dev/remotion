import {randomUUID} from 'node:crypto';
import {mkdir, rename, rm, stat, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {RenderInternals, type LogLevel} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import minimist from 'minimist';
import {chalk} from '../chalk';
import {dynamicLibEnv} from '../ffmpeg';
import {makeHyperlink} from '../hyperlinks/make-link';
import {Log} from '../log';
import {LABEL_WIDTH, printFact} from '../progress-bar';
import {ensureWhisperModel, getWhisperModel, loadWhisperWebGpu} from './models';
import {createWhisperProgress} from './progress';

const decodeAudio = async ({
	inputPath,
	sampleRate,
	binariesDirectory,
	logLevel,
}: {
	inputPath: string;
	sampleRate: number;
	binariesDirectory: string | null;
	logLevel: LogLevel;
}) => {
	const env = dynamicLibEnv(false, logLevel, binariesDirectory);
	const {stdout: formatName} = await RenderInternals.callFf({
		bin: 'ffprobe',
		args: [
			'-v',
			'error',
			'-show_entries',
			'format=format_name',
			'-of',
			'default=noprint_wrappers=1:nokey=1',
			inputPath,
		],
		indent: false,
		logLevel,
		binariesDirectory,
		cancelSignal: undefined,
		options: {env},
	});
	const binary = RenderInternals.getExecutablePath({
		type: 'ffmpeg',
		indent: false,
		logLevel,
		binariesDirectory,
	});
	RenderInternals.makeFileExecutableIfItIsNot(binary);
	const {stdout} = await RenderInternals.execa(
		binary,
		[
			'-hide_banner',
			'-nostdin',
			'-loglevel',
			'error',
			// MP3 start timestamps include encoder delay already handled by the decoder.
			...(formatName.trim() === 'mp3' ? [] : ['-copyts']),
			'-i',
			inputPath,
			'-map',
			'0:a:0',
			'-af',
			'aresample=async=1:first_pts=0',
			'-ac',
			'1',
			'-ar',
			String(sampleRate),
			'-c:a',
			'pcm_s16le',
			'-f',
			'wav',
			'pipe:1',
		],
		{
			encoding: null,
			stripFinalNewline: false,
			maxBuffer: Infinity,
			env,
		},
	);

	const {AudioSampleSink, BufferSource, Input, WAVE} =
		await import('mediabunny');
	const input = new Input({formats: [WAVE], source: new BufferSource(stdout)});
	try {
		const track = await input.getPrimaryAudioTrack();
		if (track === null) {
			throw new Error('The input file contains no audio samples.');
		}

		const duration =
			(await track.getDurationFromMetadata()) ??
			(await track.computeDuration());
		if (duration === 0) {
			throw new Error('The input file contains no audio samples.');
		}

		const waveform = new Float32Array(Math.round(duration * sampleRate));
		for await (const sample of new AudioSampleSink(track).samples()) {
			try {
				const start = Math.round(sample.timestamp * sampleRate);
				sample.copyTo(waveform.subarray(start, start + sample.numberOfFrames), {
					format: 'f32',
					planeIndex: 0,
				});
			} finally {
				sample.close();
			}
		}

		return waveform;
	} finally {
		input.dispose();
	}
};

export const parseWhisperTranscribeArgs = (argv: string[]) => {
	const args: string[] = [];
	for (const [index, arg] of argv.entries()) {
		if (arg === '--') {
			args.push(...argv.slice(index));
			break;
		}

		// Minimist treats a standalone dash as a positional argument.
		if (arg === '--output' && argv[index + 1] === '-') {
			args.push('--output=-');
		} else if (arg !== '-' || argv[index - 1] !== '--output') {
			args.push(arg);
		}
	}

	return minimist(args, {
		string: ['_', 'output', 'model', 'language', 'binaries-directory', 'log'],
		boolean: ['overwrite', 'quiet', 'raw'],
		default: {overwrite: null},
		alias: {q: 'quiet'},
	});
};

export const transcribeCommand = async ({
	remotionRoot,
	argv,
	logLevel,
}: {
	remotionRoot: string;
	argv: string[];
	logLevel: LogLevel;
}): Promise<string | null> => {
	const commandLine = parseWhisperTranscribeArgs(argv);
	const [mediaFile, ...extraArgs] = commandLine._;
	if (!mediaFile || extraArgs.length > 0) {
		throw new Error(
			'Usage: bunx remotion whisper transcribe <media-file> [--output <path>] [--model <name>] [--language <language>] [--raw]',
		);
	}

	const {output, model: modelFlag, language: languageFlag, raw} = commandLine;
	for (const [flag, value] of Object.entries({
		output,
		model: modelFlag,
		language: languageFlag,
	})) {
		if (
			value !== undefined &&
			(typeof value !== 'string' || value.trim() === '')
		) {
			throw new Error(`Pass a single value to --${flag}.`);
		}
	}

	const inputPath = path.resolve(mediaFile);
	const inputFile = await stat(inputPath);
	if (!inputFile.isFile()) {
		throw new Error(`The input must be a media file: ${inputPath}`);
	}

	const outputPath =
		output === '-'
			? null
			: output === undefined
				? path.join(
						path.dirname(inputPath),
						`${path.parse(inputPath).name}-${raw ? 'transcript' : 'captions'}.json`,
					)
				: path.resolve(output);
	const {value: overwrite} = BrowserSafeApis.options.overwriteOption.getValue(
		{commandLine},
		true,
	);
	const outputFile =
		outputPath === null
			? null
			: await stat(outputPath).catch((error: NodeJS.ErrnoException) => {
					if (error.code === 'ENOENT') {
						return null;
					}

					throw error;
				});
	if (outputFile !== null) {
		if (
			inputPath === outputPath ||
			(inputFile.ino !== 0 &&
				inputFile.ino === outputFile.ino &&
				inputFile.dev === outputFile.dev)
		) {
			throw new Error(
				`The output must be different from the input media file: ${outputPath}.`,
			);
		}

		if (!overwrite) {
			throw new Error(
				`File at ${outputPath} already exists. Use --overwrite to overwrite.`,
			);
		}

		if (!outputFile.isFile()) {
			throw new Error(`The output path must be a file: ${outputPath}`);
		}
	}

	const whisper = await loadWhisperWebGpu(remotionRoot);

	const language =
		typeof languageFlag === 'string'
			? languageFlag.trim().toLowerCase()
			: undefined;
	const requestedModel =
		modelFlag ?? (language === undefined ? 'small.en' : 'small');
	const model = getWhisperModel(whisper, requestedModel);

	if (model.multilingual && (language === undefined || language === 'auto')) {
		throw new Error(
			`Pass --language with the spoken language for the "${model.name}" model.`,
		);
	}

	const support = await whisper.canUseWhisperWebGpu();
	if (!support.supported) {
		throw new Error(support.detailedReason);
	}

	const {value: binariesDirectory} =
		BrowserSafeApis.options.binariesDirectoryOption.getValue({commandLine});
	const {quiet} = commandLine;
	if (!quiet) {
		printFact('info')({
			indent: false,
			logLevel,
			left: 'Model',
			right: model.name,
			color: 'gray',
		});
	}

	const progress = createWhisperProgress({
		quiet,
		logLevel,
		outputToStdout: outputPath === null,
	});
	const {runWithProgress} = progress;

	let outputSummary: string;
	try {
		const channelWaveform = await runWithProgress(
			'Decoding audio',
			'Decoded audio',
			() =>
				decodeAudio({
					inputPath,
					sampleRate: whisper.WHISPER_WEBGPU_SAMPLE_RATE,
					binariesDirectory,
					logLevel,
				}),
		);
		await ensureWhisperModel({whisper, model: model.name, progress});

		await using _modelHandle = await runWithProgress(
			'Loading model',
			'Loaded model',
			() => whisper.loadWhisperModel({model: model.name}),
		);
		const transcription = await runWithProgress(
			'Transcribing audio',
			'Transcribed audio',
			() => whisper.transcribe({channelWaveform, model: model.name, language}),
		);
		const outputData = raw
			? transcription
			: whisper.toCaptions({whisperWebGpuOutput: transcription}).captions;
		const json = `${JSON.stringify(outputData, null, 2)}\n`;
		if (outputPath === null) {
			return json;
		}

		const outputDirectory = path.dirname(outputPath);
		await mkdir(outputDirectory, {recursive: true});
		if (overwrite) {
			const temporaryFile = path.join(
				outputDirectory,
				`.remotion-transcribe-${randomUUID()}.tmp`,
			);
			try {
				await writeFile(temporaryFile, json, {
					flag: 'wx',
					mode: outputFile?.mode,
				});
				await rename(temporaryFile, outputPath);
			} finally {
				await rm(temporaryFile, {force: true});
			}
		} else {
			await writeFile(outputPath, json, {flag: 'wx'});
		}

		const count = Array.isArray(outputData)
			? outputData.length
			: outputData.words.length;
		const unit = raw ? 'word' : 'caption';
		outputSummary = `${count} ${unit}${count === 1 ? '' : 's'}`;
	} finally {
		progress.finish();
	}

	const relativeOutputPath = path.relative(process.cwd(), outputPath);
	const outputLink = makeHyperlink({
		url: pathToFileURL(outputPath).href,
		text: relativeOutputPath,
		fallback: relativeOutputPath,
	});
	Log.info(
		{indent: false, logLevel},
		chalk.blue(
			`${(outputFile === null ? '+' : '○').padEnd(LABEL_WIDTH)} ${outputLink}`,
		),
		chalk.gray(outputSummary),
	);
	return null;
};
