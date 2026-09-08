import {
	clearStaleModels,
	getAvailableModels,
	isWhisperModelCached,
	loadWhisperModel,
	removeWhisperModel,
	type WhisperWebGpuModel,
} from '@remotion/whisper-webgpu';
import React, {useCallback} from 'react';
import {ModelManager} from '../ModelManager';

const AVAILABLE_MODELS = getAvailableModels();

export const Models: React.FC<{
	readonly indent: boolean;
	readonly visible: boolean;
}> = ({indent, visible}) => {
	const isModelCached = useCallback(
		(model: WhisperWebGpuModel) => isWhisperModelCached({model}),
		[],
	);
	const loadModel = useCallback(
		(
			model: WhisperWebGpuModel,
			onProgress: (progress: number | null) => void,
		) =>
			loadWhisperModel({
				model,
				onProgress: (progress) => onProgress(progress.progress),
			}),
		[],
	);
	const removeModel = useCallback(
		(model: WhisperWebGpuModel) => removeWhisperModel({model}),
		[],
	);

	return (
		<ModelManager
			ariaLabel="Whisper models"
			availableModels={AVAILABLE_MODELS}
			description="Models are downloaded automatically when a transcription starts. You can also manage the browser cache here."
			indent={indent}
			isModelCached={isModelCached}
			loadModel={loadModel}
			prepare={clearStaleModels}
			removeModel={removeModel}
			visible={visible}
		/>
	);
};
