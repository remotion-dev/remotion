/* eslint-disable no-console */
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
	'large-v3-turbo',
] as const;

const modelSizes: {[key in WhisperModel]: number} = {
	'medium.en': 1533774781,
	'base.en': 147964211,
	'large-v1': 3094623691,
	'large-v2': 3094623691,
	'large-v3': 3095033483,
	'large-v3-turbo': 1624555275,
	small: 487601967,
	tiny: 77691713,
	'small.en': 487614201,
	'tiny.en': 77704715,
	base: 147951465,
	medium: 1533763059,
};

export type WhisperModel = (typeof models)[number];

export const getModelPath = (folder: string, model: WhisperModel) => {
	return path.join(path.resolve(process.cwd(), folder), `ggml-${model}.bin`);
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
		const {size} = fs.statSync(filePath);
		if (size === modelSizes[model]) {
			if (printOutput) {
				console.log(`Model already exists at ${filePath}`);
			}

			return Promise.resolve({alreadyExisted: true});
		}

		if (printOutput) {
			throw new Error(
				`Model ${model} already exists at ${filePath}, but the size is ${size} bytes (expected ${modelSizes[model]} bytes). Delete ${filePath} and try again.`,
			);
		}

		return Promise.resolve({alreadyExisted: false});
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
