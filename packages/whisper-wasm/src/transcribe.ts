/* eslint-disable new-cap */

import type {MainModule} from '../main';
import {checkForHeaders} from './check-for-headers';
import type {WhisperWasmLanguage, WhisperWasmModel} from './constants';
import {getObject} from './db/get-object-from-db';
import {getModelUrl} from './get-model-url';
import {loadMod} from './load-mod/load-mod';
import type {LogLevel} from './log';
import {Log} from './log';
import {printHandler} from './print-handler';
import type {TranscriptionItemWithTimestamp, TranscriptionJson} from './result';
import {simulateProgress} from './simulate-progress';

const SAMPLE_RATE = 16000;
const MAX_THREADS_ALLOWED = 16;
const DEFAULT_THREADS = 4;

let context: AudioContext | undefined;

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

const getAudioContext = () => {
	if (!context) {
		context = new AudioContext({
			sampleRate: SAMPLE_RATE,
		});
	}

	return context;
};

const audioDecoder = async (audioBuffer: AudioBuffer) => {
	const offlineContext = new OfflineAudioContext(
		audioBuffer.numberOfChannels,
		audioBuffer.length,
		audioBuffer.sampleRate,
	);

	const source = offlineContext.createBufferSource();
	source.buffer = audioBuffer;
	source.connect(offlineContext.destination);
	source.start(0);

	const renderedBuffer = await offlineContext.startRendering();
	const audio = renderedBuffer.getChannelData(0);

	return audio;
};

const audioProcessor = (file: Blob) => {
	return new Promise((resolve, reject) => {
		if (!window) {
			reject();
			return;
		}

		if (!file) {
			reject(new Error('File is empty'));
			return;
		}

		const innerContext = getAudioContext();
		const reader = new FileReader();

		reader.onload = async () => {
			try {
				const buffer = new Uint8Array(reader.result as ArrayBuffer);
				const audioBuffer = await innerContext.decodeAudioData(
					buffer.buffer as ArrayBuffer,
				);
				const processedAudio = await audioDecoder(audioBuffer);
				resolve(processedAudio);
			} catch (error) {
				reject(error);
			}
		};

		reader.onerror = () => reject(new Error('File reading failed'));
		reader.readAsArrayBuffer(file);
	});
};

export type TranscribeParams = {
	file: Blob;
	model: WhisperWasmModel;
	language?: WhisperWasmLanguage;
	onProgress?: (p: number) => void;
	onTranscribedChunks?: (
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
	file,
	model,
	language = 'auto',
	onProgress,
	threads,
	onTranscribedChunks,
	logLevel = 'info',
}: TranscribeParams): Promise<TranscriptionJson> => {
	Log.info(
		logLevel,
		`Starting transcription with model: ${model}, language: ${language}, threads: ${
			threads ?? DEFAULT_THREADS
		}`,
	);
	checkForHeaders();

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

	const audioDurationInSeconds = file.size / SAMPLE_RATE / 2;

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
			onTranscribedChunks?.(json.transcription);
		},
	});

	// Emscripten creates moduleOverrides from global Module object

	// var Module = typeof Module != 'undefined' ? Module : {};
	// var moduleOverrides = Object.assign({}, Module);
	window.remotion_wasm_moduleOverrides = {
		print: handler,
		printErr: handler,
	};

	const Mod = await loadMod();

	delete window.remotion_wasm_moduleOverrides;

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

	const data = await audioProcessor(file);
	if (!data) {
		Log.error('No audio data after processing.');
		throw new Error('No audio data.');
	}

	Log.info(logLevel, 'Audio processing completed.');

	Log.info(logLevel, 'Starting main transcription process...');
	Mod.full_default(
		fileName,
		data,
		model,
		language,
		threads ?? DEFAULT_THREADS,
		false,
	);

	return promise;
};
