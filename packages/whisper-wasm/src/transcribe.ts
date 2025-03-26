/* eslint-disable no-console */

import {checkForHeaders} from './check-for-headers';
import {modelState, Module} from './mod';

const MAX_AUDIO_SECONDS = 30 * 60;
const SAMPLE_RATE = 16000;
const MAX_THREADS_ALLOWED = 16;
const DEFAULT_THREADS = 4;

let transcribing = false;

let instance: number | undefined;
let context: AudioContext | undefined;

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
	onProgress?: (p: number) => void;
	onTranscribeChunk?: (start: string, end: string, text: string) => void;
	threads?: number;
};

export const transcribe = ({
	file,
	onProgress,
	onTranscribeChunk,
	threads,
}: TranscribeParams) => {
	return new Promise((resolve) => {
		checkForHeaders();

		if (transcribing) {
			throw new Error('already transcribing something');
		} else {
			transcribing = true;
		}

		if (modelState.loading) {
			transcribing = false;
			throw new Error("can't transcribe while a model is being loaded");
		}

		if (!instance) {
			instance = Module.init('whisper.bin');
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

				modelState.transcriptionProgressPlayback = onProgress ?? null;
				modelState.transcriptionChunkPlayback = onTranscribeChunk ?? null;
				modelState.resolver = (text) => {
					transcribing = false;
					resolve(text);
				};

				setTimeout(() => {
					try {
						Module.full_default(
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
