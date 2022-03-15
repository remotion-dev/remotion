import {useUnsafeVideoConfig} from './use-unsafe-video-config';
import {VideoConfig} from './video-config';

/**
 * @typedef {Object} VideoConfig - configuration of current generated video
 * @property {number} width - width of the composition in pixels
 * @property {number} height - height of the composition in pixels
 * @property {number} fps - frame rate of the composition, in frames per seconds
 * @property {number} durationInFrame - duration of the composition in frames
 */

/**
 * Get some info about the context of the video that you are making.
 * @link https://www.remotion.dev/docs/use-video-config
 * @return {VideoConfig}
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
