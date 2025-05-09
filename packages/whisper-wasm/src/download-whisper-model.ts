import {canUseWhisperWasm} from './can-use-whisper-wasm';
import {MODELS, type WhisperWasmModel} from './constants';
import {getObject} from './db/get-object-from-db';
import {putObject} from './db/put-object';
import {fetchRemote} from './download-model';
import {getModelUrl} from './get-model-url';

export interface DownloadWhisperModelParams {
	model: WhisperWasmModel;
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
			`Invalid model name: ${model}. Supported models: ${MODELS.join(', ')}.`,
		);
	}

	const usabilityCheck = await canUseWhisperWasm(model);

	if (!usabilityCheck.supported) {
		return Promise.reject(
			new Error(
				`Whisper Wasm is not supported in this environment. Reason: ${usabilityCheck.detailedReason}`,
			),
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

	const data = await fetchRemote({url, onProgress});
	await putObject({key: url, value: data});

	return {
		alreadyDownloaded: false,
	};
};
