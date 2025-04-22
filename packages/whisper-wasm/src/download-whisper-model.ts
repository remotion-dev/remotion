import type {WhisperModel} from './constants';
import {MODELS, SIZES} from './constants';
import {getObject} from './db/get-object-from-db';
import {putObject} from './db/put-object';
import {fetchRemote} from './download-model';
import {getModelUrl} from './get-model-url';

export interface DownloadWhisperModelParams {
	model: WhisperModel;
	onProgress: (progress: number) => void;
}

export type DownloadWhisperModelResult = {
	alreadyDownloaded: boolean;
};

export const downloadWhisperModel = async ({
	model,
	onProgress,
}: DownloadWhisperModelParams): Promise<DownloadWhisperModelResult> => {
	if (!model || !MODELS.includes(model)) {
		return Promise.reject(
			new Error(`Invalid model name. Supported models: ${MODELS.join(', ')}.`),
		);
	}

	if (!window.indexedDB) {
		return Promise.reject(
			new Error('IndexedDB is not available in this environment.'),
		);
	}

	if (!navigator.storage || !navigator.storage.estimate) {
		return Promise.reject(
			new Error(
				'navigator.storage.estimate() API is not available in this environment',
			),
		);
	}

	const url = getModelUrl(model);

	const result = await getObject({key: url});
	if (result) {
		onProgress(1);
		return {
			alreadyDownloaded: true,
		};
	}

	const estimate = await navigator.storage.estimate();

	if (estimate.quota === undefined) {
		return Promise.reject(
			new Error('navigator.storage.estimate() API returned undefined quota.'),
		);
	}

	if (estimate.usage === undefined) {
		return Promise.reject(
			new Error('navigator.storage.estimate() API returned undefined usage.'),
		);
	}

	const remaining = estimate.quota - estimate.usage;

	if (remaining < SIZES[model]) {
		return Promise.reject(
			new Error(
				`Not enough space to download the model. IndexedDB quota: ${estimate.quota} bytes, usage: ${estimate.usage} bytes, remaining: ${remaining} bytes, model size: ${SIZES[model]} bytes`,
			),
		);
	}

	const data = await fetchRemote({url, onProgress});
	await putObject({key: url, value: data});

	return {
		alreadyDownloaded: false,
	};
};
