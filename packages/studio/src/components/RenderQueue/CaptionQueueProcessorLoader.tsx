import React, {Suspense, useContext} from 'react';
import {isWhisperWebGpuInstalled} from '../Transcription/whisper-webgpu-capability';
import {RenderQueueContext} from './context';

const LazyCaptionQueueProcessor = React.lazy(async () => {
	const {CaptionQueueProcessor} = await import('./CaptionQueueProcessor');
	return {default: CaptionQueueProcessor};
});

export const CaptionQueueProcessorLoader: React.FC = () => {
	const {captionJobs} = useContext(RenderQueueContext);
	if (!isWhisperWebGpuInstalled() || captionJobs.length === 0) {
		return null;
	}

	return (
		<Suspense fallback={null}>
			<LazyCaptionQueueProcessor />
		</Suspense>
	);
};
