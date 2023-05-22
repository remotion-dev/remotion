import {useContext, useMemo} from 'react';
import {SequenceContext} from './SequenceContext.js';
import {useVideo} from './use-video.js';
import type {VideoConfig} from './video-config.js';

export const useUnsafeVideoConfig = (): VideoConfig | null => {
	const context = useContext(SequenceContext);
	const ctxDuration = context?.durationInFrames ?? null;
	const video = useVideo();

	return useMemo(() => {
		if (!video) {
			return null;
		}

		const {id, durationInFrames, fps, height, width, defaultProps} = video;

		return {
			id,
			width,
			height,
			fps,
			durationInFrames: ctxDuration ?? durationInFrames,
			defaultProps,
		};
	}, [ctxDuration, video]);
};
