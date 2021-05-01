import {springCalculation, SpringConfig} from './spring-utils';

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
