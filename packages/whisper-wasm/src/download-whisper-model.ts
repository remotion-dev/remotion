import {canDownloadModel} from './can-download-model';
import {canUseWhisperWasm} from './can-use-whisper-wasm';
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
	const usabilityCheck = canUseWhisperWasm();

	if (!usabilityCheck.supported) {
		return Promise.reject(
			new Error(
				`Whisper Wasm is not supported in this environment. Reasons: ${usabilityCheck.reasons.join(
					', ',
				)}`,
			),
		);
	}

	if (!model || !MODELS.includes(model)) {
		return Promise.reject(
			new Error(`Invalid model name. Supported models: ${MODELS.join(', ')}.`),
		);
	}

	const url = getModelUrl(model);

	const existingModel = await getObject({key: url});
	if (existingModel) {
		onProgress(1);
		return {
			alreadyDownloaded: true,
		};
	}

	const downloadCheck = await canDownloadModel(model);

	if (!downloadCheck.canDownload) {
		return Promise.reject(new Error(downloadCheck.reason));
	}

	const data = await fetchRemote({url, onProgress});
	await putObject({key: url, value: data});

	return {
		alreadyDownloaded: false,
	};
};
