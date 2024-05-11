import fs, {existsSync} from 'fs';
import path from 'path';
import {downloadFile, type OnProgress} from './download';

const models = [
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
] as const;

export type WhisperModel = (typeof models)[number];

export const getModelPath = (folder: string, model: WhisperModel) => {
	return path.join(folder, `ggml-${model}.bin`);
};

export const downloadWhisperModel = async ({
	model,
	folder,
	printOutput = true,
	onProgress,
	signal,
}: {
	model: WhisperModel;
	folder: string;
	signal?: AbortSignal;
	printOutput?: boolean;
	onProgress?: OnProgress;
}): Promise<{
	alreadyExisted: boolean;
}> => {
	if (!models.includes(model)) {
		throw new Error(
			`Invalid whisper model ${model}. Available: ${models.join(', ')}`,
		);
	}

	const filePath = getModelPath(folder, model);

	if (existsSync(filePath)) {
		if (printOutput) {
			console.log(`Model already exists at ${filePath}`);
		}

		return Promise.resolve({alreadyExisted: true});
	}

	const baseModelUrl = `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-${model}.bin`;
	if (printOutput) {
		console.log(`Downloading whisper model ${model} from ${baseModelUrl}`);
	}

	const fileStream = fs.createWriteStream(filePath);

	await downloadFile({
		fileStream,
		url: baseModelUrl,
		printOutput,
		onProgress,
		signal: signal ?? null,
	});

	return {alreadyExisted: false};
};
