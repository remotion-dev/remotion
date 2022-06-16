import {measureSpring, spring, SpringConfig} from 'remotion';

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

export const getProgress = (
	frame: number,
	fps: number,
	timing: TransitionTiming
) => {
	if (timing.type === 'spring') {
		return springWithRoundUpIfThreshold({
			fps,
			frame,
			config: timing.config,
		});
	}
};
