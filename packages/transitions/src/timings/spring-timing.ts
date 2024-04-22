import type {SpringConfig} from 'remotion';
import {measureSpring, spring} from 'remotion';
import type {TransitionTiming} from '../types.js';

export const springTiming = (
	options: {
		config?: Partial<SpringConfig>;
		durationInFrames?: number;
		durationRestThreshold?: number;
		reverse?: boolean;
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
			const to = options.reverse ? 0 : 1;
			const from = options.reverse ? 1 : 0;
			return spring({
				fps,
				frame,
				to,
				from,
				config: options.config,
				durationInFrames: options.durationInFrames,
				durationRestThreshold: options.durationRestThreshold,
				reverse: options.reverse,
			});
		},
	};
};
