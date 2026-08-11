// Copied from: https://github.com/rveciana/svg-path-properties
import type {Point, Properties} from './types';

export const makeLinearPosition = ({
	x0,
	x1,
	y0,
	y1,
}: {
	x0: number;
	x1: number;
	y0: number;
	y1: number;
}): Properties => {
	return {
		getTotalLength: () => {
			return Math.sqrt((x0 - x1) ** 2 + (y0 - y1) ** 2);
		},
		getPointAtLength: (pos: number): Point => {
			let fraction = pos / Math.sqrt((x0 - x1) ** 2 + (y0 - y1) ** 2);

			fraction = Number.isNaN(fraction) ? 1 : fraction;
			const newDeltaX = (x1 - x0) * fraction;
			const newDeltaY = (y1 - y0) * fraction;

			return {x: x0 + newDeltaX, y: y0 + newDeltaY};
		},
		getTangentAtLength: (): Point => {
			const module = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
			return {x: (x1 - x0) / module, y: (y1 - y0) / module};
		},
		type: 'linear',
	};
};
