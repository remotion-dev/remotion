import {interpolate, measureSpring, spring, SpringConfig} from 'remotion';

export type TransitionTiming =
	| {
			type: 'spring';
			config: Partial<SpringConfig>;
	  }
	| {
			type: 'timing';
			duration: number;
	  };

const SPRING_THRESHOLD = 0.001;

export const getTransitionDuration = ({
	timing,
	fps,
}: {
	timing: TransitionTiming;
	fps: number;
}): number => {
	if (timing.type === 'spring') {
		return measureSpring({
			fps,
			config: timing.config,
			threshold: SPRING_THRESHOLD,
		});
	}

	if (timing.type === 'timing') {
		return timing.duration;
	}

	throw new TypeError('Unsupported transition type: ' + JSON.stringify(timing));
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

export const getProgress = ({
	frame,
	fps,
	timing,
}: {
	frame: number;
	fps: number;
	timing: TransitionTiming;
}): number => {
	if (timing.type === 'spring') {
		return springWithRoundUpIfThreshold({
			fps,
			frame,
			config: timing.config,
		});
	}

	if (timing.type === 'timing') {
		return interpolate(frame, [0, timing.duration - 1], [0, 1]);
	}

	throw new Error('timing not implemented');
};
