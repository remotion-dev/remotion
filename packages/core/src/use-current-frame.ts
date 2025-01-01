import {useContext} from 'react';
import {CanUseRemotionHooks} from './CanUseRemotionHooks.js';
import {SequenceContext} from './SequenceContext.js';
import {getRemotionEnvironment} from './get-remotion-environment.js';
import {useTimelinePosition} from './timeline-position-state.js';

/*
 * @description Retrieves the current frame of the video within a component. Frames are 0-indexed, and if the component is wrapped in a `<Sequence>`, it returns the frame relative to when the Sequence starts.
 * @see [Documentation](https://www.remotion.dev/docs/use-current-frame)
 */
export const useCurrentFrame = (): number => {
	const canUseRemotionHooks = useContext(CanUseRemotionHooks);
	if (!canUseRemotionHooks) {
		if (getRemotionEnvironment().isPlayer) {
			throw new Error(
				`useCurrentFrame can only be called inside a component that was passed to <Player>. See: https://www.remotion.dev/docs/player/examples`,
			);
		}

		throw new Error(
			`useCurrentFrame() can only be called inside a component that was registered as a composition. See https://www.remotion.dev/docs/the-fundamentals#defining-compositions`,
		);
	}

	const frame = useTimelinePosition();
	const context = useContext(SequenceContext);

	const contextOffset = context
		? context.cumulatedFrom + context.relativeFrom
		: 0;

	return frame - contextOffset;
};
