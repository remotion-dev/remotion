import fs, {existsSync} from 'fs';
import {Readable} from 'node:stream';
import type {ReadableStream} from 'node:stream/web';
import path from 'path';

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
export type OnProgress = (downloadedBytes: number, totalBytes: number) => void;

export const getModelPath = (folder: string, model: WhisperModel) => {
	return path.join(folder, `ggml-${model}.bin`);
};

export const downloadWhisperModel = async ({
	model,
	folder,
	printOutput = true,
	onProgress,
}: {
	model: WhisperModel;
	folder: string;
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

	const {body, headers} = await fetch(baseModelUrl);
	const contentLength = headers.get('content-length');

	if (body === null) {
		throw new Error('Failed to download whisper model');
	}

	if (contentLength === null) {
		throw new Error('Content-Length header not found');
	}

	const totalFileSize = parseInt(contentLength, 10);

	let downloaded = 0;
	let lastPrinted = 0;

	const readable = Readable.fromWeb(body as unknown as ReadableStream<unknown>);

	await new Promise<void>((resolve, reject) => {
		readable.on('error', (err) => {
			reject(err);
		});

		readable.on('data', (chunk) => {
			downloaded += chunk.length;
			if (printOutput) {
				if (
					downloaded - lastPrinted > 1024 * 1024 * 10 ||
					downloaded === totalFileSize
				) {
					console.log(
						`Downloaded ${downloaded} of ${contentLength} bytes (${(
							(downloaded / Number(contentLength)) *
							100
						).toFixed(2)}%)`,
					);
					lastPrinted = downloaded;
				}
			}

			fileStream.write(chunk, () => {
				onProgress?.(downloaded, totalFileSize);
				if (downloaded === totalFileSize) {
					fileStream.end();
					resolve();
				}
			});
		});
	});

	return {alreadyExisted: false};
};
