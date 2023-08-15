import type {SpringConfig} from 'remotion';
import {interpolate, measureSpring, spring} from 'remotion';

export type TransitionTiming = {
	getDurationInFrames: (options: {fps: number}) => number;
	getProgress: (options: {frame: number; fps: number}) => number;
};

export const makeSpringTiming = (options: {
	config: Partial<SpringConfig>;
	durationInFrames?: number;
	durationRestThreshold?: number;
}): TransitionTiming => {
	return {
		getDurationInFrames: ({fps}) => {
			if (options.durationInFrames) {
				return options.durationInFrames;
			}

			return measureSpring({
				config: options.config,
				threshold: options.durationRestThreshold,
				fps,
			});
		},
		getProgress: ({fps, frame}) => {
			return springWithRoundUpIfThreshold({
				fps,
				frame,
				config: options.config,
				durationInFrames: options.durationInFrames,
				durationRestThreshold: options.durationRestThreshold,
			});
		},
	};
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

const SPRING_THRESHOLD = 0.001;

export const springWithRoundUpIfThreshold: typeof spring = (args) => {
	if (args.to || args.from) {
		throw new Error(
			'to / from values are not supported by springWithRoundUpIfThreshold'
		);
	}

	const spr = spring(args);

	if (spr > 1 - SPRING_THRESHOLD) {
		return 1;
	}

	return spr;
};

export const getProgress = ({
	frame,
	fps,
	timing,
}: {
	frame: number;
	fps: number;
	timing: TransitionTiming;
}): number => {
	return timing.getProgress({frame, fps});
};
