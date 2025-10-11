import {canUseWhisperWeb} from './can-use-whisper-web';
import {MODELS, SIZES, type WhisperWebModel} from './constants';
import {getObject} from './db/get-object-from-db';
import {putObject} from './db/put-object';
import {fetchRemote} from './download-model';
import {getModelUrl} from './get-model-url';

export type DownloadWhisperModelProgress = {
	downloadedBytes: number;
	totalBytes: number;
	progress: number;
};

export type DownloadWhisperModelOnProgress = (
	progress: DownloadWhisperModelProgress,
) => void;

export interface DownloadWhisperModelParams {
	model: WhisperWebModel;
	onProgress: DownloadWhisperModelOnProgress;
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

	const usabilityCheck = await canUseWhisperWeb(model);

	if (!usabilityCheck.supported) {
		return Promise.reject(
			new Error(
				`Whisper.wasm is not supported in this environment. Reason: ${usabilityCheck.detailedReason}`,
			),
		);
	}

	const url = getModelUrl(model);
	const modelSize = SIZES[model];

	const existingModel = await getObject({key: url});
	if (existingModel) {
		onProgress({
			downloadedBytes: modelSize,
			totalBytes: modelSize,
			progress: 1,
		});

		return {
			alreadyDownloaded: true,
		};
	}

	const data = await fetchRemote({
		url,
		onProgress: (bytes) => {
			onProgress({
				downloadedBytes: bytes,
				progress: bytes / modelSize,
				totalBytes: modelSize,
			});
		},
		expectedLength: modelSize,
	});

	onProgress({
		downloadedBytes: modelSize,
		totalBytes: modelSize,
		progress: 1,
	});

	await putObject({key: url, value: data});

	return {
		alreadyDownloaded: false,
	};
};
