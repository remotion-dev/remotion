import {interpolate} from '../interpolate.js';
import {validateFrame} from '../validate-frame.js';
import {validateFps} from '../validation/validate-fps.js';
import {validateSpringDuration} from '../validation/validation-spring-duration.js';
import {measureSpring} from './measure-spring.js';
import type {SpringConfig} from './spring-utils';
import {springCalculation} from './spring-utils.js';

/*
 * @description Calculates a position based on physical parameters, start and end value, and time.
 * @see [Documentation](https://www.remotion.dev/docs/spring)
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
