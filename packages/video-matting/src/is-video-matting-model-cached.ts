import {
	getHostedVideoMattingModelId,
	getVideoMattingModelInfo,
	type VideoMattingModel,
} from './models';
import {withRemotionModelHost} from './with-remotion-model-host';

export type IsVideoMattingModelCachedOptions = {
	model: VideoMattingModel;
};

export const isVideoMattingModelCached = ({
	model,
}: IsVideoMattingModelCachedOptions): Promise<boolean> => {
	const modelInfo = getVideoMattingModelInfo(model);

	return withRemotionModelHost(({ModelRegistry}) => {
		return ModelRegistry.is_pipeline_cached(
			'background-removal',
			getHostedVideoMattingModelId(model),
			{
				device: 'webgpu',
				dtype: modelInfo.dtype,
			},
		);
	});
};
