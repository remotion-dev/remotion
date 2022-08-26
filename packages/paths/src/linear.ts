import type {Point, PointProperties} from './types';

export const makeLinearPosition = (
	x0: number,
	x1: number,
	y0: number,
	y1: number
) => {
	const getTotalLength = () => {
		return Math.sqrt((x0 - x1) ** 2 + (y0 - y1) ** 2);
	};

	const getPointAtLength = (pos: number): Point => {
		let fraction = pos / Math.sqrt((x0 - x1) ** 2 + (y0 - y1) ** 2);

		fraction = Number.isNaN(fraction) ? 1 : fraction;
		const newDeltaX = (x1 - x0) * fraction;
		const newDeltaY = (y1 - y0) * fraction;

		return {x: x0 + newDeltaX, y: y0 + newDeltaY};
	};

	const getTangentAtLength = (): Point => {
		const module = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
		return {x: (x1 - x0) / module, y: (y1 - y0) / module};
	};

	const getPropertiesAtLength = (pos: number): PointProperties => {
		const point = getPointAtLength(pos);
		const tangent = getTangentAtLength();
		return {x: point.x, y: point.y, tangentX: tangent.x, tangentY: tangent.y};
	};

	return {
		getTotalLength,
		getPointAtLength,
		getTangentAtLength,
		getPropertiesAtLength,
	};
};
