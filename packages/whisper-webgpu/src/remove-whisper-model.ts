import {disposeWhisperModel} from './load-whisper-model';
import {
	getHostedModelId,
	WHISPER_WEBGPU_DTYPE,
	type WhisperWebGpuModel,
} from './models';
import {withRemotionModelHost} from './with-remotion-model-host';

export type RemoveWhisperModelOptions = {
	model: WhisperWebGpuModel;
};

export const removeWhisperModel = async ({
	model,
}: RemoveWhisperModelOptions): Promise<void> => {
	await disposeWhisperModel({model});
	await withRemotionModelHost(({ModelRegistry}) => {
		return ModelRegistry.clear_pipeline_cache(
			'automatic-speech-recognition',
			getHostedModelId(model),
			{
				device: 'webgpu',
				dtype: WHISPER_WEBGPU_DTYPE,
			},
		);
	});
};
