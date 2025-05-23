/* eslint-disable new-cap */
import type {MainModule} from '../main';
import type {WhisperWebLanguage, WhisperWebModel} from './constants';
import {getObject} from './db/get-object-from-db';
import {getModelUrl} from './get-model-url';
import {loadMod} from './load-mod/load-mod';
import type {LogLevel} from './log';
import {Log} from './log';
import {printHandler} from './print-handler';
import {EXPECTED_SAMPLE_RATE} from './resample-to-16khz';
import type {TranscriptionItemWithTimestamp, TranscriptionJson} from './result';
import {simulateProgress} from './simulate-progress';
const MAX_THREADS_ALLOWED = 16;
const DEFAULT_THREADS = 4;

declare global {
	interface Window {
		remotion_wasm_moduleOverrides?: Record<string, (...args: any[]) => void>;
	}
}

interface WithResolvers<T> {
	promise: Promise<T>;
	resolve: (value: T | PromiseLike<T>) => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	reject: (reason?: any) => void;
}

const withResolvers = function <T>() {
	let resolve: WithResolvers<T>['resolve'];
	let reject: WithResolvers<T>['reject'];
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return {promise, resolve: resolve!, reject: reject!};
};

export type TranscribeParams = {
	channelWaveform: Float32Array;
	model: WhisperWebModel;
	language?: WhisperWebLanguage;
	onProgress?: (p: number) => void;
	onTranscriptionChunk?: (
		transcription: TranscriptionItemWithTimestamp[],
	) => void;
	threads?: number;
	logLevel?: LogLevel;
};

const storeFS = (mod: MainModule, fname: string, buf: any) => {
	try {
		mod.FS_unlink(fname);
	} catch {
		// ignore
	}

	mod.FS_createDataFile('/', fname, buf, true, true, undefined);
};

export const transcribe = async ({
	channelWaveform,
	model,
	language = 'auto',
	onProgress,
	threads,
	onTranscriptionChunk,
	logLevel = 'info',
}: TranscribeParams): Promise<TranscriptionJson> => {
	if (!channelWaveform || channelWaveform.length === 0) {
		Log.error(logLevel, 'No audio data provided or audio data is empty.');
		throw new Error('No audio data provided or audio data is empty.');
	}

	Log.info(
		logLevel,
		`Starting transcription with model: ${model}, language: ${language}, threads: ${
			threads ?? DEFAULT_THREADS
		}`,
	);

	if ((threads ?? DEFAULT_THREADS) > MAX_THREADS_ALLOWED) {
		Log.warn(
			logLevel,
			`Thread limit exceeded: Used ${
				threads ?? DEFAULT_THREADS
			}, max ${MAX_THREADS_ALLOWED} allowed.`,
		);
		return Promise.reject(
			new Error(`Thread limit exceeded: max ${MAX_THREADS_ALLOWED} allowed.`),
		);
	}

	const audioDurationInSeconds = channelWaveform.length / EXPECTED_SAMPLE_RATE;

	const {
		abort: abortProgress,
		onDone: onProgressDone,
		progressStepReceived,
		start: startProgress,
	} = simulateProgress({
		audioDurationInSeconds,
		onProgress: (p) => {
			onProgress?.(p);
		},
	});

	const {
		promise,
		resolve: _resolve,
		reject: _reject,
	} = withResolvers<TranscriptionJson>();

	const resolve = (value: TranscriptionJson) => {
		_resolve(value);
		abortProgress();
		Log.info(logLevel, 'Transcription completed successfully.');
	};

	const reject = (reason: Error) => {
		_reject(reason);
		abortProgress();
		Log.error('Transcription failed:', reason);
	};

	const handler = printHandler({
		logLevel,
		onProgress: (p: number) => {
			if (p === 0) {
				startProgress();
			} else if (p === 100) {
				onProgressDone();
			} else {
				progressStepReceived();
			}
		},
		onDone: resolve,
		onBusy: () => {
			reject(new Error('Another transcription is already in progress'));
		},
		onUpdate: (json: TranscriptionJson) => {
			onTranscriptionChunk?.(json.transcription);
		},
	});

	const Mod = await loadMod({handler});

	const url = getModelUrl(model);
	const result = await getObject({key: url});
	if (!result) {
		throw new Error(
			`Model ${model} is not loaded. Call downloadWhisperModel() first.`,
		);
	}

	Log.info(logLevel, `Model ${model} loaded successfully.`);

	const fileName = `${model}.bin`;

	storeFS(Mod, fileName, result);

	Log.info(logLevel, 'Starting main transcription process...');
	Mod.full_default(
		fileName,
		channelWaveform,
		model,
		language,
		threads ?? DEFAULT_THREADS,
		false,
	);

	return promise;
};
