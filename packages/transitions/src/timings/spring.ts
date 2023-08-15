import type {SpringConfig} from 'remotion';
import {measureSpring, spring} from 'remotion';
import type {TransitionTiming} from '../types';

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

const SPRING_THRESHOLD = 0.001;

const springWithRoundUpIfThreshold: typeof spring = (args) => {
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
