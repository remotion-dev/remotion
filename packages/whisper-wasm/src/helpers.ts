/* eslint-disable no-console, new-cap */
// @ts-nocheck
import type {MainModule} from './emscripten-types';

const dbName = 'whisper-wasm';
const dst = 'whisper.bin';
const dbVersion = 1;
const kMaxAudio_s = 30 * 60;
const kSampleRate = 16000;
const maxThreadsAllowed = 16;

let transcriptionText = [];
let transcriptionProgressPlayback = null;
let transcriptionChunkPlayback = null;
let resolver = null;

let modelLoading = false;
let transcribing = false;

let instance = null;
let context = null;
let headerWarningPrinted = false;

const indexedDB = typeof window !== 'undefined' ? window.indexedDB : null;

const printHandler = (text) => {
	const progressMatch = text.match(/Progress:\s*(\d+)%/i);
	const chunkMatch = text.match(
		/^\[(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})\]\s*(.+)$/,
	);

	if (progressMatch && transcriptionProgressPlayback) {
		const progress = parseInt(progressMatch[1], 10);
		transcriptionProgressPlayback(progress);
	}

	if (chunkMatch) {
		const timestampStart = chunkMatch[1];
		const timestampEnd = chunkMatch[2];
		const textOnly = chunkMatch[3].trim();
		transcriptionChunkPlayback?.(
			timestampStart,
			timestampEnd,
			textOnly,
		);
		transcriptionText.push(textOnly);
	}

	if (text === 'completed') {
		resolver(transcriptionText.join(' '));
		transcriptionChunkPlayback = null;
		transcriptionProgressPlayback = null;
		transcriptionText = [];
	}

	console.log(text);
};

var Module = {} as MainModule;
Module.print = (text: string) => printHandler(text);
Module.printErr = (text: string) => printHandler(text);

const checkForHeaders = () => {
	if (!headerWarningPrinted && !crossOriginIsolated) {
		console.warn('please add the required headers, this may cause problems.');
		headerWarningPrinted = true;
	}
};

const storeFS = (fname: string, buf: any) => {
	// write to WASM file using FS_createDataFile
	// if the file exists, delete it
	try {
		Module.FS_unlink(fname);
	} catch {
		// ignore
	}

	Module.FS_createDataFile('/', fname, buf, true, true);
};

const fetchRemote = async (
	url: string,
	progressCallback?: (arg0: number) => void,
) => {
	//  start the fetch
	const response = await fetch(url, {method: 'get'});
	if (!response.ok || !response.body) {
		throw new Error(`failed to fetch: ${url}`);
	}

	const contentLength = response.headers.get('content-length') as string;
	//  hugging face servers do include this header
	const total = parseInt(contentLength, 10);
	const reader = response.body.getReader();

	const chunks = [];
	let receivedLength = 0;
	let progressLast = -1;

	while (true) {
		const {done, value} = await reader.read();

		if (done) {
			break;
		}

		chunks.push(value);
		receivedLength += value.length;

		if (contentLength) {
			const progressPercentage = Math.round((receivedLength / total) * 100);
			progressCallback?.(progressPercentage);

			const progressCur = Math.round((receivedLength / total) * 10);
			if (progressCur !== progressLast) {
				progressLast = progressCur;
			}
		}
	}

	let position = 0;
	const chunksAll = new Uint8Array(receivedLength);

	for (const chunk of chunks) {
		chunksAll.set(chunk, position);
		position += chunk.length;
	}

	return chunksAll;
};

const postModelLoaded = (data: Uint8Array<ArrayBuffer>, url: string) => {
	return new Promise((resolve, reject) => {
		if (!data) {
			reject(new Error('Something went wrong while fetching the model'));
			return;
		}

		const rq = indexedDB.open(dbName, dbVersion);
		rq.onsuccess = function (event) {
			const db = event.target.result;
			const objectStore = db
				.transaction(['models'], 'readwrite')
				.objectStore('models');
			let putRq = null;
			try {
				putRq = objectStore.put(data, url);
			} catch (e) {
				reject(new Error(`Failed to store "${url}" in IndexedDB: ${e}`));
				return;
			}

			putRq.onsuccess = () => {
				console.log(`"${url}" stored in IndexedDB`);
				storeFS(dst, data);
				resolve('stored successfully');
			};

			putRq.onerror = () => {
				reject(new Error(`Failed to store "${url}" in IndexedDB`));
			};
		};

		rq.onerror = () => reject(new Error('Failed to open IndexedDB'));
	});
};

const loadModel = (url: string, cbProgress: (arg0: number) => void) => {
	return new Promise((resolve, reject) => {
		checkForHeaders();
		if (!navigator.storage || !navigator.storage.estimate) {
			console.log('Could not estimate the storage');
		} else {
			navigator.storage.estimate().then((estimate) => {
				console.log('Estimate quota:', estimate.quota);
				console.log('Estimate usage:', estimate.usage);
			});
		}

		const rq = indexedDB.open(dbName, dbVersion);

		rq.onupgradeneeded = (event) => {
			const db = event.target.result;
			if (event.oldVersion < 1) {
				db.createObjectStore('models', {autoIncrement: false});
				console.log('DB created');
			} else {
				const os = event.currentTarget.transaction.objectStore('models');
				os.clear();
				console.log('DB cleared');
			}
		};

		rq.onsuccess = (event) => {
			const db = event.target.result;
			const transaction = db.transaction(['models'], 'readonly');
			const objectStore = transaction.objectStore('models');
			const innerRq = objectStore.get(url);

			innerRq.onsuccess = () => {
				if (innerRq.result) {
					console.log('Model already in IndexedDB');
					storeFS(dst, innerRq.result);
					resolve('Model loaded successfully');
				} else {
					// Now postModelLoaded() returns a Promise
					fetchRemote(url, cbProgress)
						.then((data) => postModelLoaded(data, url))
						.then(() => resolve('Loaded model after downloading successfully'))
						.catch((error) =>
							reject(new Error(`Failed to fetch or store model: ${error}`)),
						);
				}
			};

			innerRq.onerror = () =>
				reject(new Error('Failed to get data from IndexedDB'));
			transaction.onabort = () =>
				reject(new Error('Failed to open IndexedDB: abort'));
		};

		rq.onerror = () => reject(new Error('Failed to open IndexedDB'));
		rq.onblocked = () => reject(new Error('Failed to open IndexedDB: cancel'));
	});
};

export const downloadWhisperModel = async ({model, onProgress}) => {
	modelLoading = true;
	const allowedModels = [
		'tiny',
		'tiny.en',
		'base',
		'base.en',
		'small',
		'small.en',
		'medium',
		'medium.en',
		'large-v1',
		'large-v2',
		'large-v3',
		'large-v3-turbo',
	] as const;

	if (!model || !allowedModels.includes(model)) {
		modelLoading = false;
		throw new Error('invalid model name');
	}

	if (!indexedDB) {
		modelLoading = false;
		throw new Error('IndexedDB is not available in this environment.');
	}

	//  all good, proceed
	const url = `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-${model}.bin`;
	await loadModel(url, onProgress);
	modelLoading = false;
};

const getAudioContext = () => {
	if (!context) {
		context = new AudioContext({
			sampleRate: kSampleRate,
			channelCount: 1,
			echoCancellation: false,
			autoGainControl: true,
			noiseSuppression: true,
		});
	}

	return context;
};

const audioDecoder = async (audioBuffer) => {
	const offlineContext = new OfflineAudioContext(
		audioBuffer.numberOfChannels,
		audioBuffer.length,
		audioBuffer.sampleRate,
	);

	const source = offlineContext.createBufferSource();
	source.buffer = audioBuffer;
	source.connect(offlineContext.destination);
	source.start(0);

	try {
		const renderedBuffer = await offlineContext.startRendering();
		let audio = renderedBuffer.getChannelData(0);
		console.log(`Audio loaded, size: ${audio.length}`);

		// Truncate to first 30 seconds
		if (audio.length > kMaxAudio_s * kSampleRate) {
			audio = audio.slice(0, kMaxAudio_s * kSampleRate);
			console.log(`Truncated audio to first ${kMaxAudio_s} seconds`);
		}

		return audio;
	} catch (error) {
		throw new Error(`Error while decoding audio: ${error.message}`);
	}
};

const audioProcessor = (file) => {
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
				const buffer = new Uint8Array(reader.result);
				const audioBuffer = await innerContext.decodeAudioData(buffer.buffer);
				const processedAudio = await audioDecoder(audioBuffer);
				resolve(processedAudio);
			} catch (error) {
				reject(new Error(`Error processing audio: ${error.message}`));
			}
		};

		reader.onerror = () => reject(new Error('File reading failed'));
		reader.readAsArrayBuffer(file);
	});
};

export const transcribe = ({file, onProgress, onTranscribeChunk, threads}) => {
	return new Promise((resolve) => {
		checkForHeaders();

		if (transcribing) {
			throw new Error('already transcribing something');
		} else {
			transcribing = true;
		}

		if (modelLoading) {
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

		if ((threads ?? 8) > maxThreadsAllowed) {
			transcribing = false;
			throw new Error(
				`Thread limit exceeded: max ${maxThreadsAllowed} allowed.`,
			);
		}

		audioProcessor(file)
			.then((data) => {
				if (!data) {
					transcribing = false;
					throw new Error('No audio data.');
				}

				transcriptionProgressPlayback = onProgress;
				transcriptionChunkPlayback = onTranscribeChunk;
				resolver = (text) => {
					transcribing = false;
					resolve(text);
				};

				setTimeout(() => {
					try {
						Module.full_default(instance, data, 'en', threads ?? 8, false);
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
