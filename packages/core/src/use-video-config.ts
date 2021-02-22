import {useUnsafeVideoConfig} from './use-unsafe-video-config';
import {VideoConfig} from './video-config';

export const useVideoConfig = (): VideoConfig => {
	const videoConfig = useUnsafeVideoConfig();

	if (!videoConfig) {
		throw new Error('No video config found');
	}

	return videoConfig;
};
