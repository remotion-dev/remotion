import type {OutlinePoint} from './selected-outline-geometry';

export const svgPointToClientPoint = (
	point: OutlinePoint,
	rect: DOMRect,
): OutlinePoint => {
	return {
		x: point.x + rect.left,
		y: point.y + rect.top,
	};
};
