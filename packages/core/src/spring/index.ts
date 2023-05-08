import {validateFrame} from '../validate-frame.js';
import {validateFps} from '../validation/validate-fps.js';
import {validateSpringDuration} from '../validation/validation-spring-duration.js';
import {measureSpring} from './measure-spring.js';
import type {SpringConfig} from './spring-utils.js';
import {springCalculation} from './spring-utils.js';

/**
 * @description Calculates a position based on physical parameters, start and end value, and time.
 * @see [Documentation](https://www.remotion.dev/docs/spring)
 * @param {number} frame The current time value. Most of the time you want to pass in the return value of useCurrentFrame.
 * @param {number} fps The framerate at which the animation runs. Pass in the value obtained by `useVideoConfig()`.
 * @param {?Object} config optional object that allows you to customize the physical properties of the animation.
 * @param {number} [config.mass=1] The weight of the spring. If you reduce the mass, the animation becomes faster!
 * @param {number} [config.damping=10] How hard the animation decelerates.
 * @param {number} [config.stiffness=100] Affects bounciness of the animation.
 * @param {boolean} [config.overshootClamping=false] Whether to prevent the animation going beyond the target value.
 * @param {?number} [config.from] The initial value of the animation. Default `0`
 * @param {?number} [config.to] The end value of the animation. Default `1`
 * @param {?number} [config.durationInFrames] Stretch the duration of an animation to  a set value.. Default `undefined`
 * @param {?number} [config.durationThreshold] How close to the end the animation is considered to be done. Default `0.005`
 * @param {?number} [config.delay] Delay the animation for this amount of frames. Default `0`
 */
export function spring({
	frame,
	fps,
	config = {},
	from = 0,
	to = 1,
	durationInFrames,
	durationRestThreshold,
	delay = 0,
}: {
	frame: number;
	fps: number;
	config?: Partial<SpringConfig>;
	from?: number;
	to?: number;
	durationInFrames?: number;
	durationRestThreshold?: number;
	delay?: number;
}): number {
	validateSpringDuration(durationInFrames);
	validateFrame({frame, durationInFrames: Infinity, allowFloats: true});
	validateFps(fps, 'to spring()', false);

	const durationRatio =
		durationInFrames === undefined
			? 1
			: durationInFrames /
			  measureSpring({
					fps,
					config,
					from,
					to,
					threshold: durationRestThreshold,
			  });

		// Delay the spring by telling the calculation we're at an earlier frame.
		// All frames up to the delay will be clamped to zero.
		frame = Math.max(0, frame - delay);

	const spr = springCalculation({
		fps,
		frame: frame / durationRatio,
		config,
		from,
		to,
	});

	if (!config.overshootClamping) {
		return spr.current;
	}

	if (to >= from) {
		return Math.min(spr.current, to);
	}

	return Math.max(spr.current, to);
}

export {measureSpring} from './measure-spring.js';
export {SpringConfig} from './spring-utils.js';
