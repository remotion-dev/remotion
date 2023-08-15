import {interpolate} from 'remotion';
import type {TransitionTiming} from '../types.js';

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
