import {measureSpring, SpringConfig} from 'remotion';

export type TransitionTiming = {
	type: 'spring';
	config: Partial<SpringConfig>;
};

export const SPRING_THRESHOLD = 0.001;

export const getTransitionDuration = (
	timing: TransitionTiming,
	fps: number
) => {
	if (timing.type === 'spring') {
		return measureSpring({
			fps,
			config: timing.config,
			threshold: SPRING_THRESHOLD,
		});
	}

	throw new TypeError('Unsupported transition type: ' + timing.type);
};
