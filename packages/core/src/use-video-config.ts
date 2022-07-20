import {useContext} from 'react';
import {CanUseRemotionHooks} from './CanUseRemotionHooks';
import {useUnsafeVideoConfig} from './use-unsafe-video-config';
import type {VideoConfig} from './video-config';

/**
 * Get some info about the context of the video that you are making.
 * Returns an object containing `fps`, `width`, `height` and `durationInFrames`, all of type `number`.
 * @link https://www.remotion.dev/docs/use-video-config
 */
export const useVideoConfig = (): VideoConfig => {
	const videoConfig = useUnsafeVideoConfig();
	const context = useContext(CanUseRemotionHooks);

	if (!videoConfig) {
		if (typeof window !== 'undefined' && window.remotion_isPlayer) {
			throw new Error(
				'No video config found. You are probably calling useVideoConfig() from outside the component passed to <Player />. See https://www.remotion.dev/docs/player/examples for how to set up the Player correctly.'
			);
		}

		throw new Error(
			'No video config found. You are probably calling useVideoConfig() from a component which has not been registered as a <Composition />. See https://www.remotion.dev/docs/the-fundamentals#defining-compositions for more information.'
		);
	}

	if (!context) {
		throw new Error('Called useVideoConfig() outside a Remotion composition.');
	}

	return videoConfig;
};
