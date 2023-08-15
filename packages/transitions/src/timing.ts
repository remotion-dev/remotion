import type {ExtrapolateType, SpringConfig} from 'remotion';
import {interpolate, measureSpring, spring} from 'remotion';

export type NewTransitionTiming = {
	getDurationInFrames: (options: {fps: number}) => number;
	getProgress: (options: {frame: number; fps: number}) => number;
};

export const makeSpringTiming = (options: {
	config: Partial<SpringConfig>;
	durationInFrames?: number;
	durationRestThreshold?: number;
}): NewTransitionTiming => {
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
		getProgress: ({fps, frame}) =>
			spring({
				config: options.config,
				durationRestThreshold: options.durationInFrames,
				fps,
				frame,
			}),
	};
};

export const makeEasingTiming = (options: {
	durationInFrames: number;
	easing?: ((input: number) => number) | undefined;
	extrapolateLeft?: ExtrapolateType | undefined;
	extrapolateRight?: ExtrapolateType | undefined;
}): NewTransitionTiming => {
	return {
		getDurationInFrames: () => {
			return 1;
		},
		getProgress: ({frame}) => {
			return interpolate(frame, [0, options.durationInFrames], [0, 1], {
				easing: options.easing,
				extrapolateLeft: options.extrapolateLeft,
				extrapolateRight: options.extrapolateRight,
			});
		},
	};
};

const SPRING_THRESHOLD = 0.001;

export type TransitionTiming =
	| {
			type: 'spring';
			config: Partial<SpringConfig>;
	  }
	| {
			type: 'timing';
			duration: number;
			easing?: ((input: number) => number) | undefined;
	  };

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
		return interpolate(frame, [0, timing.duration - 1], [0, 1], {
			// TODO: Easing.bounce kind of weird?
			easing: timing.easing ?? undefined,
		});
	}

	throw new Error('timing not implemented');
};
