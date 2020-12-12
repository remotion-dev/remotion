import {useContext, useMemo} from 'react';
import {SequenceContext} from '.';
import {CompositionManager} from './CompositionManager';
import {VideoConfig} from './video-config';

export const useVideoConfig = (): VideoConfig | null => {
	const videoContext = useContext(CompositionManager);
	const context = useContext(SequenceContext);

	return useMemo(() => {
		if (videoContext.compositions.length === 0) {
			return null;
		}
		const {durationInFrames, fps, height, width} = videoContext.compositions[0];

		return {
			width,
			height,
			fps,
			durationInFrames: context?.durationInFrames ?? durationInFrames,
		};
	}, [context?.durationInFrames, videoContext.compositions]);
};
