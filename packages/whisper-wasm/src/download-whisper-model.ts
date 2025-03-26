/* eslint-disable no-console */

import type {WhisperModel} from './constants';
import {MODELS} from './constants';
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
		throw new Error(
			`Invalid model name. Supported models: ${MODELS.join(', ')}.`,
		);
	}

	if (!window.indexedDB) {
		throw new Error('IndexedDB is not available in this environment.');
	}

	if (!navigator.storage || !navigator.storage.estimate) {
		throw new Error(
			'navigator.storage.estimate() API is not available in this environment',
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
	console.log('Estimate quota:', estimate.quota);
	console.log('Estimate usage:', estimate.usage);

	const data = await fetchRemote({url, onProgress});
	await putObject({key: url, value: data});

	return {
		alreadyDownloaded: false,
	};
};
