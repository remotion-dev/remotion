import {useContext} from 'react';
import {CanUseRemotionHooks} from './CanUseRemotionHooks';
import {SequenceContext} from './Sequence';
import {useTimelinePosition} from './timeline-position-state';

/**
 * Get the current frame of the video.
 * Frames are 0-indexed, meaning the first frame is 0, the last frame is the duration of the composition in frames minus one.
 * @link https://www.remotion.dev/docs/use-current-frame
 */
export const useCurrentFrame = (): number => {
	const canUseRemotionHooks = useContext(CanUseRemotionHooks);
	if (!canUseRemotionHooks) {
		if (typeof window !== 'undefined' && window.remotion_isPlayer) {
			throw new Error(
				`useCurrentFrame can only be called inside a component that was passed to <Player>. See: https://www.remotion.dev/docs/player/examples`
			);
		}

		throw new Error(
			`useCurrentFrame() can only be called inside a component that was registered as a composition. See https://www.remotion.dev/docs/the-fundamentals#defining-compositions`
		);
	}

	const frame = useTimelinePosition();
	const context = useContext(SequenceContext);

	const contextOffset = context
		? context.cumulatedFrom + context.relativeFrom
		: 0;

	return frame - contextOffset;
};
