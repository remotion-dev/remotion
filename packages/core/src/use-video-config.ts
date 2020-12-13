import {useContext, useMemo} from 'react';
import {SequenceContext} from '.';
import {useVideo} from './use-video';
import {VideoConfig} from './video-config';

export const useVideoConfig = (): VideoConfig => {
	const context = useContext(SequenceContext);
	const ctxDuration = context?.durationInFrames ?? 0;
	const video = useVideo();

	return useMemo(() => {
		if (!video) {
			// TODO: Improve
			return {
				height: 0,
				width: 0,
				fps: 0,
				durationInFrames: 0,
			};
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
