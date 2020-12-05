import {useContext} from 'react';
import {SequenceContext} from '.';
import {getVideoConfig} from './register-video';
import {VideoConfig} from './video-config';

export const useVideoConfig = (): VideoConfig => {
	const baseConfig = getVideoConfig();
	const context = useContext(SequenceContext);

	if (context?.durationInFrames) {
		return {
			...baseConfig,
			durationInFrames: context.durationInFrames,
		};
	}

	return baseConfig;
};
