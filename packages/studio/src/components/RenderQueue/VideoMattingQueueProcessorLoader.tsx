import React, {Suspense, useContext} from 'react';
import {useOptionalPackageInstalled} from '../OptionalPackageModal';
import {VIDEO_MATTING_PACKAGE} from '../VideoMatting/video-matting-capability';
import {RenderQueueContext} from './context';

const LazyProcessor = React.lazy(async () => {
	const {VideoMattingQueueProcessor} =
		await import('./VideoMattingQueueProcessor');
	return {default: VideoMattingQueueProcessor};
});

export const VideoMattingQueueProcessorLoader: React.FC = () => {
	const installed = useOptionalPackageInstalled(VIDEO_MATTING_PACKAGE);
	const {videoMattingJobs} = useContext(RenderQueueContext);
	if (!installed || videoMattingJobs.length === 0) {
		return null;
	}

	return (
		<Suspense fallback={null}>
			<LazyProcessor />
		</Suspense>
	);
};
