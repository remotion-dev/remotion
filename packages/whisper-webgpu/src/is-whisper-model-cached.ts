import {
	getHostedModelId,
	WHISPER_WEBGPU_DTYPE,
	type WhisperWebGpuModel,
} from './models';
import {withRemotionModelHost} from './with-remotion-model-host';

export type IsWhisperModelCachedOptions = {
	model: WhisperWebGpuModel;
};

export const isWhisperModelCached = ({
	model,
}: IsWhisperModelCachedOptions): Promise<boolean> => {
	return withRemotionModelHost(({ModelRegistry}) => {
		return ModelRegistry.is_pipeline_cached(
			'automatic-speech-recognition',
			getHostedModelId(model),
			{
				device: 'webgpu',
				dtype: WHISPER_WEBGPU_DTYPE,
			},
		);
	});
};
