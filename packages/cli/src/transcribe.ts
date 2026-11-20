import {existsSync} from 'node:fs';
import {mkdir, stat, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {RenderInternals, type LogLevel} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type * as WhisperWebGpu from '@remotion/whisper-webgpu';
import minimist from 'minimist';
import {dynamicLibEnv} from './ffmpeg';
import {Log} from './log';
import {resolveFrom} from './resolve-from';

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
			env: dynamicLibEnv(false, logLevel, binariesDirectory),
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

export const transcribeCommand = async ({
	remotionRoot,
	argv,
	logLevel,
}: {
	remotionRoot: string;
	argv: string[];
	logLevel: LogLevel;
}) => {
	const commandLine = minimist(argv, {
		string: ['_', 'output', 'model', 'language', 'binaries-directory', 'log'],
	});
	const [mediaFile, ...extraArgs] = commandLine._;
	if (!mediaFile || extraArgs.length > 0) {
		throw new Error(
			'Usage: bunx remotion transcribe <media-file> [--output <path>] [--model <name>] [--language <language>]',
		);
	}

	const {output, model: modelFlag, language: languageFlag} = commandLine;
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
	if (!(await stat(inputPath)).isFile()) {
		throw new Error(`The input must be a media file: ${inputPath}`);
	}

	const outputPath =
		output === undefined
			? path.join(
					path.dirname(inputPath),
					`${path.parse(inputPath).name}-captions.json`,
				)
			: path.resolve(output);
	if (existsSync(outputPath)) {
		throw new Error(
			`The output already exists: ${outputPath}. Specify a different path with --output.`,
		);
	}

	let whisperPath: string;
	try {
		whisperPath = resolveFrom(remotionRoot, '@remotion/whisper-webgpu');
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code !== 'MODULE_NOT_FOUND') {
			throw err;
		}

		throw new Error(
			'Transcription requires @remotion/whisper-webgpu. Install it in your project with: bunx remotion add @remotion/whisper-webgpu @huggingface/transformers',
		);
	}

	// Keep native ESM import semantics when compiling the CLI to CommonJS.
	// eslint-disable-next-line no-new-func
	const importWhisper = new Function(
		'specifier',
		'return import(specifier)',
	) as (specifier: string) => Promise<typeof WhisperWebGpu>;
	const whisper = await importWhisper(pathToFileURL(whisperPath).href);
	const language =
		typeof languageFlag === 'string'
			? languageFlag.trim().toLowerCase()
			: undefined;
	const requestedModel =
		modelFlag ?? (language === undefined ? 'small.en' : 'small');
	const availableModels = whisper.getAvailableModels();
	const model = availableModels.find(({name}) => name === requestedModel);
	if (model === undefined) {
		throw new Error(
			`Unknown Whisper model "${requestedModel}". Available models: ${availableModels.map(({name}) => name).join(', ')}.`,
		);
	}

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
	Log.info({indent: false, logLevel}, 'Decoding audio…');
	const channelWaveform = await decodeAudio({
		inputPath,
		sampleRate: whisper.WHISPER_WEBGPU_SAMPLE_RATE,
		binariesDirectory,
		logLevel,
	});

	Log.info(
		{indent: false, logLevel},
		`Preparing Whisper model "${model.name}"…`,
	);
	await whisper.downloadWhisperModel({model: model.name});
	Log.info({indent: false, logLevel}, 'Transcribing audio…');
	const transcription = await whisper
		.transcribe({
			channelWaveform,
			model: model.name,
			language,
		})
		.finally(() => whisper.disposeWhisperModel({model: model.name}));
	const {captions} = whisper.toCaptions({whisperWebGpuOutput: transcription});
	await mkdir(path.dirname(outputPath), {recursive: true});
	await writeFile(outputPath, `${JSON.stringify(captions, null, 2)}\n`, {
		flag: 'wx',
	});
	Log.info(
		{indent: false, logLevel},
		`Wrote ${captions.length} captions to ${outputPath}`,
	);
};
