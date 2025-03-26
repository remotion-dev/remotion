/* eslint-disable no-console */
/* eslint-disable new-cap */
import {checkForHeaders} from './check-for-headers';
import {
	DB_NAME,
	DB_OBJECT_STORE_NAME,
	DB_VERSION,
	FILE_DESTINATION,
} from './constants';
import {getObjectFromDb} from './db/get-object-from-db';
import {openDb} from './db/open-db';
import {fetchRemote} from './download-model';
import {Module} from './mod';

const MODELS = [
	'tiny',
	'tiny.en',
	'base',
	'base.en',
	'small',
	'small.en',
] as const;

export type WhisperModel = (typeof MODELS)[number];

export interface DownloadWhisperModelParams {
	model: WhisperModel;
	onProgress: (progress: number) => void;
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

const postModelLoaded = (data: Uint8Array, url: string) => {
	return new Promise((resolve, reject) => {
		if (!data) {
			reject(new Error('Something went wrong while fetching the model'));
			return;
		}

		const rq = indexedDB.open(DB_NAME, DB_VERSION);
		rq.onsuccess = function () {
			const objectStore = rq.result
				.transaction([DB_OBJECT_STORE_NAME], 'readwrite')
				.objectStore(DB_OBJECT_STORE_NAME);
			try {
				const putRq = objectStore.put(data, url);

				putRq.onsuccess = () => {
					storeFS(FILE_DESTINATION, data);
					resolve('stored successfully');
				};

				putRq.onerror = () => {
					reject(new Error(`Failed to store "${url}" in IndexedDB`));
				};
			} catch (e) {
				reject(new Error(`Failed to store "${url}" in IndexedDB: ${e}`));
			}
		};

		rq.onerror = () => reject(new Error('Failed to open IndexedDB'));
	});
};

const loadModel = async ({
	url,
	onProgress,
}: {
	url: string;
	onProgress: (progress: number) => void;
}) => {
	checkForHeaders();

	if (!navigator.storage || !navigator.storage.estimate) {
		throw new Error(
			'navigator.storage.estimate() API is not available in this environment',
		);
	}

	const estimate = await navigator.storage.estimate();
	console.log('Estimate quota:', estimate.quota);
	console.log('Estimate usage:', estimate.usage);

	const objectStore = await openDb();

	const result = await getObjectFromDb(objectStore, url);
	if (result) {
		console.log('Model already in IndexedDB', result);
		storeFS(FILE_DESTINATION, result);
	} else {
		const data = await fetchRemote({url, onProgress});
		await postModelLoaded(data, url);
	}
};

export const downloadWhisperModel = async ({
	model,
	onProgress,
}: DownloadWhisperModelParams) => {
	if (!model || !MODELS.includes(model)) {
		throw new Error(
			`Invalid model name. Supported models: ${MODELS.join(', ')}.`,
		);
	}

	if (!window.indexedDB) {
		throw new Error('IndexedDB is not available in this environment.');
	}

	await loadModel({
		url: `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-${model}.bin`,
		onProgress,
	});
};
