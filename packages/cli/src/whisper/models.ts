import {pathToFileURL} from 'node:url';
import type * as WhisperWebGpu from '@remotion/whisper-webgpu';
import {resolveFrom} from '../resolve-from';
import type {createWhisperProgress} from './progress';

export const loadWhisperWebGpu = (remotionRoot: string) => {
	let whisperPath: string;
	try {
		whisperPath = resolveFrom(remotionRoot, '@remotion/whisper-webgpu');
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code !== 'MODULE_NOT_FOUND') {
			throw err;
		}

		throw new Error(
			'Whisper commands require @remotion/whisper-webgpu. Install it in your project.\n' +
				'  bunx remotion add @remotion/whisper-webgpu @huggingface/transformers',
		);
	}

	// Keep native ESM import semantics when compiling the CLI to CommonJS.
	// eslint-disable-next-line no-new-func
	const importWhisper = new Function(
		'specifier',
		'return import(specifier)',
	) as (specifier: string) => Promise<typeof WhisperWebGpu>;
	return importWhisper(pathToFileURL(whisperPath).href);
};

export const getWhisperModel = (
	whisper: typeof WhisperWebGpu,
	requestedModel: string,
): WhisperWebGpu.WhisperWebGpuModelInfo => {
	const model = whisper
		.getAvailableModels()
		.find(({name}) => name === requestedModel);
	if (model === undefined) {
		throw new Error(
			`Unknown Whisper model "${requestedModel}". Run bunx remotion whisper ls to list the available models.`,
		);
	}

	return model;
};

export const ensureWhisperModel = async ({
	whisper,
	model,
	progress,
}: {
	whisper: typeof WhisperWebGpu;
	model: WhisperWebGpu.WhisperWebGpuModel;
	progress: ReturnType<typeof createWhisperProgress>;
}): Promise<WhisperWebGpu.DownloadWhisperModelResult> => {
	if (await whisper.isWhisperModelCached({model})) {
		return {alreadyDownloaded: true};
	}

	return progress.runWithProgress(
		'Downloading model',
		'Downloaded model',
		(onProgress) => whisper.downloadWhisperModel({model, onProgress}),
	);
};
