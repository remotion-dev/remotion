import {interpolate} from 'remotion';

export type TransitionTiming = {
	getDurationInFrames: (options: {fps: number}) => number;
	getProgress: (options: {frame: number; fps: number}) => number;
};

export const makeEasingTiming = (options: {
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
