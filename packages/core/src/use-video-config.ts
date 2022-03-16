import {useUnsafeVideoConfig} from './use-unsafe-video-config';
import {VideoConfig} from './video-config';

/**
 * Get some info about the context of the video that you are making.
 * Returns an object containing `fps`, `width`, `height` and `durationInFrames`, all of type `number`.
 * @link https://www.remotion.dev/docs/use-video-config
 */
export const useVideoConfig = (): VideoConfig => {
	const videoConfig = useUnsafeVideoConfig();

	if (!videoConfig) {
		throw new Error(
			'No video config found. You are probably calling useVideoConfig() from a component which has not been registered as a <Composition />. See https://www.remotion.dev/docs/the-fundamentals#defining-compositions for more information.'
		);
	}

	return videoConfig;
};
