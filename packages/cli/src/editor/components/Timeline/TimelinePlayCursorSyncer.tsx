import type React from 'react';
import {useEffect} from 'react';
import {Internals, useCurrentFrame} from 'remotion';
import {ensureFrameIsInViewport} from './timeline-scroll-logic';

export const TimelinePlayCursorSyncer: React.FC = () => {
	const video = Internals.useVideo();
	const frame = useCurrentFrame();

	useEffect(() => {
		if (!video) {
			return;
		}

		ensureFrameIsInViewport('forwards-play', video.durationInFrames, frame);
	}, [frame, video]);

	return null;
};
