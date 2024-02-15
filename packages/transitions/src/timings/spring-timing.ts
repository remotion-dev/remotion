import type {SpringConfig} from 'remotion';
import {measureSpring, spring} from 'remotion';
import type {TransitionTiming} from '../types.js';

const springWithInvalidArgumentRejection: typeof spring = (args) => {
	if (args.to || args.from) {
		throw new Error(
			'to / from values are not supported by springWithRoundUpIfThreshold',
		);
	}

	return spring(args);
};

export const springTiming = (
	options: {
		config?: Partial<SpringConfig>;
		durationInFrames?: number;
		durationRestThreshold?: number;
	} = {},
): TransitionTiming => {
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
			return springWithInvalidArgumentRejection({
				fps,
				frame,
				config: options.config,
				durationInFrames: options.durationInFrames,
				durationRestThreshold: options.durationRestThreshold,
			});
		},
	};
};
