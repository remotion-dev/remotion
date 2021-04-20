import {useUnsafeVideoConfig} from './use-unsafe-video-config';
import {VideoConfig} from './video-config';

export const useVideoConfig = (): VideoConfig => {
	const videoConfig = useUnsafeVideoConfig();

	if (!videoConfig) {
		throw new Error(
			'No video config found. You are probably calling useVideoConfig() from a component which has not been registered as a <Composition />. See https://www.remotion.dev/docs/the-fundamentals#defining-compositions for more information.'
		);
	}

	return videoConfig;
};
