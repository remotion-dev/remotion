import {springCalculation, SpringConfig} from './spring-utils';

/**
 * Delightful and smooth animation primitive. Calculates a position based on physical parameters, start and end value, and time
 * @link https://www.remotion.dev/docs/spring
 * @param {number} frame The current time value. Most of the time you want to pass in the return value of useCurrentFrame.
 * @param {number} fps For how many frames per second the spring animation should be calculated.
 * @param {?Object} config optional object that allows you to customize the physical properties of the animation.
 * @param {number} [config.mass=1] The weight of the spring. If you reduce the mass, the animation becomes faster!
 * @param {number} [config.damping=10] How hard the animation decelerates.
 * @param {number} [config.stiffness=100] How hard the animation decelerates.
 * @param {boolean} [config.overshootClamping=false] How hard the animation decelerates.
 * @param {?number} from The initial value of the animation
 * @param {?number} to The end value of the animation. Note that depending on the parameters, spring animations may overshoot the target a bit, before they bounce back to their final target.
 */
export function spring({
	frame,
	fps,
	config = {},
	from = 0,
	to = 1,
}: {
	frame: number;
	fps: number;
	config?: Partial<SpringConfig>;
	from?: number;
	to?: number;
}): number {
	const spr = springCalculation({
		fps,
		frame,
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

export {measureSpring} from './measure-spring';
export {SpringConfig} from './spring-utils';
