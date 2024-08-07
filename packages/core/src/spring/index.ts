import {interpolate} from '../interpolate.js';
import {validateFrame} from '../validate-frame.js';
import {validateFps} from '../validation/validate-fps.js';
import {validateSpringDuration} from '../validation/validation-spring-duration.js';
import {measureSpring} from './measure-spring.js';
import type {SpringConfig} from './spring-utils';
import {springCalculation} from './spring-utils.js';

/**
 * @description Calculates a position based on physical parameters, start and end value, and time.
 * @see [Documentation](https://www.remotion.dev/docs/spring)
 * @param {number} frame The current time value. Most of the time you want to pass in the return value of useCurrentFrame.
 * @param {number} fps The framerate at which the animation runs. Pass in the value obtained by `useVideoConfig()`.
 * @param {?boolean} reverse Whether the animation plays in reverse or not. Default `false`.
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
	frame: passedFrame,
	fps,
	config = {},
	from = 0,
	to = 1,
	durationInFrames: passedDurationInFrames,
	durationRestThreshold,
	delay = 0,
	reverse = false,
}: {
	frame: number;
	fps: number;
	config?: Partial<SpringConfig>;
	from?: number;
	to?: number;
	durationInFrames?: number;
	durationRestThreshold?: number;
	delay?: number;
	reverse?: boolean;
}): number {
	validateSpringDuration(passedDurationInFrames);
	validateFrame({
		frame: passedFrame,
		durationInFrames: Infinity,
		allowFloats: true,
	});
	validateFps(fps, 'to spring()', false);

	const needsToCalculateNaturalDuration =
		reverse || typeof passedDurationInFrames !== 'undefined';

	const naturalDuration = needsToCalculateNaturalDuration
		? measureSpring({
				fps,
				config,
				threshold: durationRestThreshold,
			})
		: undefined;

	const naturalDurationGetter = needsToCalculateNaturalDuration
		? {
				get: () => naturalDuration as number,
			}
		: {
				get: () => {
					throw new Error(
						'did not calculate natural duration, this is an error with Remotion. Please report',
					);
				},
			};

	const reverseProcessed = reverse
		? (passedDurationInFrames ?? naturalDurationGetter.get()) - passedFrame
		: passedFrame;

	const delayProcessed = reverseProcessed + (reverse ? delay : -delay);

	const durationProcessed =
		passedDurationInFrames === undefined
			? delayProcessed
			: delayProcessed / (passedDurationInFrames / naturalDurationGetter.get());

	if (passedDurationInFrames && delayProcessed > passedDurationInFrames) {
		return to;
	}

	const spr = springCalculation({
		fps,
		frame: durationProcessed,
		config,
	});

	const inner = config.overshootClamping
		? to >= from
			? Math.min(spr.current, to)
			: Math.max(spr.current, to)
		: spr.current;

	const interpolated =
		from === 0 && to === 1 ? inner : interpolate(inner, [0, 1], [from, to]);

	return interpolated;
}

export {measureSpring} from './measure-spring.js';
export type {SpringConfig} from './spring-utils';
