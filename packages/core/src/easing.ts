// Taken from https://github.com/facebook/react-native/blob/0b9ea60b4fee8cacc36e7160e31b91fc114dbc0d/Libraries/Animated/src/Easing.js

import {bezier} from './bezier.js';
import type {EasingFunction} from './interpolate.js';
import {measureSpring, spring} from './spring/index.js';
import type {SpringConfig} from './spring/spring-utils.js';

export type EasingSpringConfig = Partial<
	Pick<SpringConfig, 'damping' | 'mass' | 'stiffness' | 'overshootClamping'>
> & {
	readonly allowTail?: boolean;
	readonly durationRestThreshold?: number;
};

// Some easing curves are only defined on [0, 1] (e.g. quarter circle, bounce segments).
// `interpolate(..., { extrapolate: 'extend' })` can pass values outside that interval; clamp
// there so we return endpoints instead of NaN or unintended extrapolation.
const clampUnit = (t: number): number => Math.min(1, Math.max(0, t));
const springEasingDurationInFrames = 30;

/**
 * @description The Easing module implements common easing functions. You can use it with the interpolate() API.
 * @see [Documentation](https://www.remotion.dev/docs/easing)
 */
export class Easing {
	static step0(n: number): number {
		return n > 0 ? 1 : 0;
	}

	static step1(n: number): number {
		return n >= 1 ? 1 : 0;
	}

	static linear(t: number): number {
		return t;
	}

	static ease(t: number): number {
		return Easing.bezier(0.42, 0, 1, 1)(t);
	}

	static quad(t: number): number {
		return t * t;
	}

	static cubic(t: number): number {
		return t * t * t;
	}

	static poly(n: number): (t: number) => number {
		return (t: number): number => t ** n;
	}

	static sin(t: number): number {
		return 1 - Math.cos((t * Math.PI) / 2);
	}

	static circle(t: number): number {
		const u = clampUnit(t);
		return 1 - Math.sqrt(1 - u * u);
	}

	static exp(t: number): number {
		return 2 ** (10 * (t - 1));
	}

	static elastic(bounciness = 1): (t: number) => number {
		const p = bounciness * Math.PI;
		return (t): number =>
			1 - Math.cos((t * Math.PI) / 2) ** 3 * Math.cos(t * p);
	}

	static back(s = 1.70158): (t: number) => number {
		return (t): number => t * t * ((s + 1) * t - s);
	}

	static spring({
		allowTail = false,
		durationRestThreshold,
		...config
	}: EasingSpringConfig = {}): (t: number) => number {
		const easing: EasingFunction = (t): number => {
			if (t <= 0) {
				return 0;
			}

			if (!allowTail && t >= 1) {
				return 1;
			}

			if (allowTail) {
				return spring({
					fps: springEasingDurationInFrames,
					frame:
						t *
						measureSpring({
							fps: springEasingDurationInFrames,
							config,
							threshold: durationRestThreshold,
						}),
					config,
				});
			}

			return spring({
				fps: springEasingDurationInFrames,
				frame: t * springEasingDurationInFrames,
				config,
				durationInFrames: springEasingDurationInFrames,
				durationRestThreshold,
			});
		};

		return Object.assign(easing, {
			remotionShouldExtendRight: allowTail,
		});
	}

	static bounce(t: number): number {
		const u = clampUnit(t);

		if (u < 1 / 2.75) {
			return 7.5625 * u * u;
		}

		if (u < 2 / 2.75) {
			const t2_ = u - 1.5 / 2.75;
			return 7.5625 * t2_ * t2_ + 0.75;
		}

		if (u < 2.5 / 2.75) {
			const t2_ = u - 2.25 / 2.75;
			return 7.5625 * t2_ * t2_ + 0.9375;
		}

		const t2 = u - 2.625 / 2.75;
		return 7.5625 * t2 * t2 + 0.984375;
	}

	static bezier(
		x1: number,
		y1: number,
		x2: number,
		y2: number,
	): (t: number) => number {
		return bezier(x1, y1, x2, y2);
	}

	static in(easing: (t: number) => number): (t: number) => number {
		return easing;
	}

	static out(easing: (t: number) => number): (t: number) => number {
		return (t): number => 1 - easing(1 - t);
	}

	static inOut(easing: (t: number) => number): (t: number) => number {
		return (t): number => {
			if (t < 0.5) {
				return easing(t * 2) / 2;
			}

			return 1 - easing((1 - t) * 2) / 2;
		};
	}
}
