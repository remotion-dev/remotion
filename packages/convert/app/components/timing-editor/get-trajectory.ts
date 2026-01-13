import {Easing, interpolate, spring} from 'remotion';
import type {EasingType, TimingConfig} from './types';

const getEasingFunction = (easing: EasingType): ((t: number) => number) => {
	switch (easing) {
		case 'linear':
			return Easing.linear;
		case 'ease':
			return Easing.ease;
		case 'ease-in-quad':
			return Easing.in(Easing.quad);
		case 'ease-out-quad':
			return Easing.out(Easing.quad);
		case 'ease-in-out-quad':
			return Easing.inOut(Easing.quad);
		case 'ease-in-cubic':
			return Easing.in(Easing.cubic);
		case 'ease-out-cubic':
			return Easing.out(Easing.cubic);
		case 'ease-in-out-cubic':
			return Easing.inOut(Easing.cubic);
		case 'ease-in-sin':
			return Easing.in(Easing.sin);
		case 'ease-out-sin':
			return Easing.out(Easing.sin);
		case 'ease-in-out-sin':
			return Easing.inOut(Easing.sin);
		case 'ease-in-exp':
			return Easing.in(Easing.exp);
		case 'ease-out-exp':
			return Easing.out(Easing.exp);
		case 'ease-in-out-exp':
			return Easing.inOut(Easing.exp);
		case 'ease-in-circle':
			return Easing.in(Easing.circle);
		case 'ease-out-circle':
			return Easing.out(Easing.circle);
		case 'ease-in-out-circle':
			return Easing.inOut(Easing.circle);
		case 'ease-in-bounce':
			return Easing.in(Easing.bounce);
		case 'ease-out-bounce':
			return Easing.out(Easing.bounce);
		case 'ease-in-out-bounce':
			return Easing.inOut(Easing.bounce);
		default:
			return Easing.linear;
	}
};

export const getTrajectory = (
	durationInFrames: number,
	fps: number,
	config: TimingConfig,
): number[] => {
	if (config.type === 'spring') {
		const {springConfig, reverse, delay} = config;
		return new Array(durationInFrames).fill(true).map((_, i) => {
			return spring({
				fps,
				frame: i,
				config: springConfig,
				reverse,
				durationInFrames: config.durationInFrames ?? undefined,
				delay: delay ?? undefined,
			});
		});
	}

	// Interpolate mode
	const {easing, delay: interpolateDelay} = config;
	const easingFn = getEasingFunction(easing);
	const animationDuration = config.durationInFrames;

	return new Array(durationInFrames).fill(true).map((_, i) => {
		if (i < interpolateDelay) {
			return 0;
		}

		const frameInAnimation = i - interpolateDelay;
		if (frameInAnimation >= animationDuration) {
			return 1;
		}

		return interpolate(frameInAnimation, [0, animationDuration], [0, 1], {
			easing: easingFn,
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		});
	});
};
