import {
	getAvailableModels,
	isVideoMattingModelCached,
	loadVideoMattingModel,
	removeVideoMattingModel,
	type VideoMattingModel,
} from '@remotion/video-matting';
import React, {useCallback} from 'react';
import {ModelManager} from '../ModelManager';

const AVAILABLE_MODELS = getAvailableModels();

export const Models: React.FC<{
	readonly description: string | null;
	readonly indent: boolean;
	readonly visible: boolean;
}> = ({description, indent, visible}) => {
	const isModelCached = useCallback(
		(model: VideoMattingModel) => isVideoMattingModelCached({model}),
		[],
	);
	const loadModel = useCallback(
		(model: VideoMattingModel, onProgress: (progress: number | null) => void) =>
			loadVideoMattingModel({
				model,
				onProgress: (progress) => onProgress(progress.progress),
			}),
		[],
	);
	const removeModel = useCallback(
		(model: VideoMattingModel) => removeVideoMattingModel({model}),
		[],
	);

	return (
		<ModelManager
			ariaLabel="Video matting models"
			availableModels={AVAILABLE_MODELS}
			description={description}
			indent={indent}
			isModelCached={isModelCached}
			loadModel={loadModel}
			prepare={null}
			removeModel={removeModel}
			visible={visible}
		/>
	);
};
