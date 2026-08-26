import type {ResolvedWhisperWebGpuBackend} from './backend';
import {
	getModelInfo,
	getWhisperModelDtype,
	type WhisperWebGpuModel,
} from './models';

export type IsWhisperModelCachedOptions = {
	model: WhisperWebGpuModel;
	backend: ResolvedWhisperWebGpuBackend;
};

export const isWhisperModelCached = async ({
	model,
	backend,
}: IsWhisperModelCachedOptions): Promise<boolean> => {
	const {ModelRegistry} = await import('@huggingface/transformers');
	const {modelId} = getModelInfo(model);

	return ModelRegistry.is_pipeline_cached(
		'automatic-speech-recognition',
		modelId,
		{
			device: backend,
			dtype: getWhisperModelDtype(backend),
		},
	);
};
