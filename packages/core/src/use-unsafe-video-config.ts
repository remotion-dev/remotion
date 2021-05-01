import {useContext, useMemo} from 'react';
import {SequenceContext} from './sequencing';
import {useVideo} from './use-video';
import {VideoConfig} from './video-config';

export const useUnsafeVideoConfig = (): VideoConfig | null => {
	const context = useContext(SequenceContext);
	const ctxDuration = context?.durationInFrames ?? null;
	const video = useVideo();

	return useMemo(() => {
		if (!video) {
			return null;
		}

		const {durationInFrames, fps, height, width} = video;

		return {
			width,
			height,
			fps,
			durationInFrames: ctxDuration ?? durationInFrames,
		};
	}, [ctxDuration, video]);
};
