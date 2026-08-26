import {
	getModelInfo,
	WHISPER_WEBGPU_DTYPE,
	type WhisperWebGpuModel,
} from './models';

export type IsWhisperModelCachedOptions = {
	model: WhisperWebGpuModel;
};

export const isWhisperModelCached = async ({
	model,
}: IsWhisperModelCachedOptions): Promise<boolean> => {
	const {ModelRegistry} = await import('@huggingface/transformers');
	const {modelId} = getModelInfo(model);

	return ModelRegistry.is_pipeline_cached(
		'automatic-speech-recognition',
		modelId,
		{
			device: 'webgpu',
			dtype: WHISPER_WEBGPU_DTYPE,
		},
	);
};
