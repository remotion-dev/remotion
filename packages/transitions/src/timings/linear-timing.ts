import {interpolate} from 'remotion';
import type {TransitionTiming} from '../types.js';

type LinearTimingOptions = {
	durationInFrames: number;
	easing?: ((input: number) => number) | undefined;
};

export const linearTimingOptions = new WeakMap<
	TransitionTiming,
	LinearTimingOptions
>();

/*
 * @description A timing function for `<TransitionSeries>` based on `interpolate()`.
 * @see [Documentation](https://www.remotion.dev/docs/transitions/timings/lineartiming)
 */
export const linearTiming = (
	options: LinearTimingOptions,
): TransitionTiming => {
	const timing: TransitionTiming = {
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
	linearTimingOptions.set(timing, options);
	return timing;
};
