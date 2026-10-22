import {disposeVideoMattingModel} from './load-video-matting-model';
import {
	getHostedVideoMattingModelId,
	getVideoMattingModelInfo,
	type VideoMattingModel,
} from './models';
import {withRemotionModelHost} from './with-remotion-model-host';

export type RemoveVideoMattingModelOptions = {
	model: VideoMattingModel;
};

export const removeVideoMattingModel = async ({
	model,
}: RemoveVideoMattingModelOptions): Promise<void> => {
	const modelInfo = getVideoMattingModelInfo(model);
	await disposeVideoMattingModel({model});
	await withRemotionModelHost(({ModelRegistry}) => {
		return ModelRegistry.clear_pipeline_cache(
			'background-removal',
			getHostedVideoMattingModelId(model),
			{
				device: 'webgpu',
				dtype: modelInfo.dtype,
			},
		);
	});
};
