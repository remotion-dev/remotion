/* eslint-disable new-cap */
/* eslint-disable no-console */

import type {MainModule} from '../main';
import {checkForHeaders} from './check-for-headers';
import {type WhisperModel} from './constants';
import {getObject} from './db/get-object-from-db';
import {getModelUrl} from './get-model-url';
import {loadMod} from './load-mod/load-mod';
import {modelState, printHandler} from './print-handler';
import {simulateProgress} from './simulate-progress';

const MAX_AUDIO_SECONDS = 30 * 60;
const SAMPLE_RATE = 16000;
const MAX_THREADS_ALLOWED = 16;
const DEFAULT_THREADS = 4;

let transcribing = false;

let instance: number | undefined;
let context: AudioContext | undefined;

declare global {
	interface Window {
		remotion_wasm_moduleOverrides?: Record<string, (...args: any[]) => void>;
	}
}

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
	let audio = renderedBuffer.getChannelData(0);
	console.log(`Audio loaded, size: ${audio.length}`);

	// Truncate to first 30 seconds
	if (audio.length > MAX_AUDIO_SECONDS * SAMPLE_RATE) {
		audio = audio.slice(0, MAX_AUDIO_SECONDS * SAMPLE_RATE);
		console.log(`Truncated audio to first ${MAX_AUDIO_SECONDS} seconds`);
	}

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
	model: WhisperModel;
	onProgress?: (p: number) => void;
	onTranscribeChunk?: (start: string, end: string, text: string) => void;
	threads?: number;
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
	onProgress,
	onTranscribeChunk,
	threads,
}: TranscribeParams) => {
	// Emscripten creates moduleOverrides from global Module object

	// var Module = typeof Module != 'undefined' ? Module : {};
	// var moduleOverrides = Object.assign({}, Module);

	window.remotion_wasm_moduleOverrides = {
		print: printHandler,
		printErr: printHandler,
	};
	const Mod = await loadMod();

	const audioDurationInSeconds = file.size / SAMPLE_RATE / 2;
	const {
		// @ts-expect-error
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

	delete window.remotion_wasm_moduleOverrides;

	const url = getModelUrl(model);
	const result = await getObject({key: url});
	if (!result) {
		throw new Error(
			`Model ${model} is not loaded. Call downloadWhisperModel() first.`,
		);
	}

	const fileName = `${model}.bin`;

	storeFS(Mod, fileName, result);

	return new Promise((resolve) => {
		checkForHeaders();

		if (transcribing) {
			throw new Error('already transcribing something');
		} else {
			transcribing = true;
		}

		if (!instance) {
			instance = Mod.init(fileName);
			if (!instance) {
				transcribing = false;
				throw new Error('Failed to initialize Whisper.');
			}

			console.log('Whisper initialized, instance: ' + instance);
		}

		if ((threads ?? DEFAULT_THREADS) > MAX_THREADS_ALLOWED) {
			transcribing = false;
			throw new Error(
				`Thread limit exceeded: max ${MAX_THREADS_ALLOWED} allowed.`,
			);
		}

		audioProcessor(file)
			.then((data) => {
				if (!data) {
					transcribing = false;
					throw new Error('No audio data.');
				}

				modelState.transcriptionProgressPlayback = (p) => {
					if (p === 0) {
						startProgress();
					} else if (p === 100) {
						onProgressDone();
					} else {
						progressStepReceived();
					}
				};

				modelState.transcriptionChunkPlayback = onTranscribeChunk ?? null;
				modelState.resolver = (text) => {
					transcribing = false;
					resolve(text);
				};

				setTimeout(() => {
					try {
						Mod.full_default(
							instance as number,
							data,
							'en',
							threads ?? DEFAULT_THREADS,
							false,
						);
					} catch (e) {
						console.log("couldn't start transcription ", e);
					}
				}, 100);
			})
			.catch((e) => {
				console.log("couldn't process audio file ", e);
			});
	});
};
