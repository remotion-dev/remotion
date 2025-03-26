/* eslint-disable no-console */
/* eslint-disable new-cap */
import {checkForHeaders} from './check-for-headers';
import {modelState, Module} from './mod';

const dbName = 'whisper-wasm';
const dst = 'whisper.bin';
const dbVersion = 1;

export type WhisperModel =
	| 'tiny'
	| 'tiny.en'
	| 'base'
	| 'base.en'
	| 'small'
	| 'small.en';

export interface DownloadWhisperModelParams {
	model: WhisperModel;
	onProgress?: (progress: number) => void;
}

const storeFS = (fname: string, buf: any) => {
	// write to WASM file using FS_createDataFile
	// if the file exists, delete it
	try {
		Module.FS_unlink(fname);
	} catch {
		// ignore
	}

	Module.FS_createDataFile('/', fname, buf, true, true, undefined);
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

	const chunks: Uint8Array[] = [];
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

const postModelLoaded = (data: Uint8Array, url: string) => {
	return new Promise((resolve, reject) => {
		if (!data) {
			reject(new Error('Something went wrong while fetching the model'));
			return;
		}

		const rq = indexedDB.open(dbName, dbVersion);
		rq.onsuccess = function (event) {
			//	@ts-expect-error
			const db = event.target.result;
			const objectStore = db
				.transaction(['models'], 'readwrite')
				.objectStore('models');
			let putRq;
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

const loadModel = (url: string, cbProgress?: (arg0: number) => void) => {
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
			const db = (event.target as IDBOpenDBRequest).result;
			if (event.oldVersion < 1) {
				db.createObjectStore('models', {autoIncrement: false});
				console.log('DB created');
			} else {
				//	@ts-expect-error
				const os = event.currentTarget.transaction.objectStore('models');
				os.clear();
				console.log('DB cleared');
			}
		};

		rq.onsuccess = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;
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

export const downloadWhisperModel = async ({
	model,
	onProgress,
}: DownloadWhisperModelParams) => {
	modelState.loading = true;
	const allowedModels = [
		'tiny',
		'tiny.en',
		'base',
		'base.en',
		'small',
		'small.en',
	] as const;

	if (!model || !allowedModels.includes(model)) {
		modelState.loading = false;
		throw new Error('invalid model name');
	}

	if (!indexedDB) {
		modelState.loading = false;
		throw new Error('IndexedDB is not available in this environment.');
	}

	//  all good, proceed
	const url = `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-${model}.bin`;
	await loadModel(url, onProgress);
	modelState.loading = false;
};
