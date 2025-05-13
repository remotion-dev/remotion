import type {WhisperWebLanguage, WhisperWebModel} from './constants';
import type {LogLevel} from './log';
import {Log} from './log';
import type {TranscriptionItemWithTimestamp, TranscriptionJson} from './result';
const MAX_THREADS_ALLOWED = 16;
const DEFAULT_THREADS = 4;

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

export const transcribe = async ({
	channelWaveform,
	model,
	language = 'auto',
	threads,
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

	const {promise} = withResolvers<TranscriptionJson>();

	// Emscripten creates moduleOverrides from global Module object

	// var Module = typeof Module != 'undefined' ? Module : {};
	// var moduleOverrides = Object.assign({}, Module);

	return promise;
};
