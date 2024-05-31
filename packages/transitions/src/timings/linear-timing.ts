import {interpolate} from 'remotion';
import type {TransitionTiming} from '../types.js';

/**
 * Creates a linear timing object for managing animations in frame units.
 * @description Provides a mechanism to handle frame-based transitions linearly, optionally incorporating easing functions.
 * @see [Documentation](https://remotion.dev/docs/transitions/timings/lineartiming)
 * @param {Object} options Configuration options for the linear timing
 * @param {number} options.durationInFrames Specifies the total duration of the transition in frames
 * @param {((input: number) => number)=} options.easing Optional easing function to modify the interpolation of values
 * @returns {TransitionTiming} An object representing the timing of the transition, including methods to get duration and progress
 */
export const linearTiming = (options: {
	durationInFrames: number;
	easing?: ((input: number) => number) | undefined;
}): TransitionTiming => {
	return {
		getDurationInFrames: () => {
			return options.durationInFrames;
		},
		getProgress: ({frame}) => {
			return interpolate(frame, [0, options.durationInFrames], [0, 1], {
				easing: options.easing,
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			});
		},
	};
};
