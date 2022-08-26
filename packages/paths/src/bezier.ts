import type {Point} from './types';

import {
	cubicDerivative,
	cubicPoint,
	getCubicArcLength,
	getQuadraticArcLength,
	quadraticDerivative,
	quadraticPoint,
	t2length,
} from './bezier-functions';

export const makeBezier = ({
	ax,
	ay,
	bx,
	by,
	cx,
	cy,
	dx,
	dy,
}: {
	ax: number;
	ay: number;
	bx: number;
	by: number;
	cx: number;
	cy: number;
	dx: number | null;
	dy: number | null;
}) => {
	let d: Point;
	let getArcLength: (xs: number[], ys: number[], t: number) => number;
	let getPoint: (xs: number[], ys: number[], t: number) => Point;
	let getDerivative: (xs: number[], ys: number[], t: number) => Point;

	const a = {x: ax, y: ay};
	const b = {x: bx, y: by};
	const c = {x: cx, y: cy};

	if (dx !== null && dy !== null) {
		getArcLength = getCubicArcLength;
		getPoint = cubicPoint;
		getDerivative = cubicDerivative;
		d = {x: dx, y: dy};
	} else {
		getArcLength = getQuadraticArcLength;
		getPoint = quadraticPoint;
		getDerivative = quadraticDerivative;
		d = {x: 0, y: 0};
	}

	const length = getArcLength([a.x, b.x, c.x, d.x], [a.y, b.y, c.y, d.y], 1);

	const getTotalLength = () => {
		return length;
	};

	const getPointAtLength = (len: number) => {
		const xs = [a.x, b.x, c.x, d.x];
		const xy = [a.y, b.y, c.y, d.y];
		const t = t2length(len, len, (i) => getArcLength(xs, xy, i));

		return getPoint(xs, xy, t);
	};

	const getTangentAtLength = (len: number) => {
		const xs = [a.x, b.x, c.x, d.x];
		const xy = [a.y, b.y, c.y, d.y];
		const t = t2length(len, len, (i) => getArcLength(xs, xy, i));

		const derivative = getDerivative(xs, xy, t);
		const mdl = Math.sqrt(
			derivative.x * derivative.x + derivative.y * derivative.y
		);
		let tangent: Point;
		if (mdl > 0) {
			tangent = {x: derivative.x / mdl, y: derivative.y / mdl};
		} else {
			tangent = {x: 0, y: 0};
		}

		return tangent;
	};

	const getPropertiesAtLength = (len: number) => {
		const xs = [a.x, b.x, c.x, d.x];
		const xy = [a.y, b.y, c.y, d.y];
		const t = t2length(len, len, (i) => getArcLength(xs, xy, i));

		const derivative = getDerivative(xs, xy, t);
		const mdl = Math.sqrt(
			derivative.x * derivative.x + derivative.y * derivative.y
		);
		let tangent: Point;
		if (mdl > 0) {
			tangent = {x: derivative.x / mdl, y: derivative.y / mdl};
		} else {
			tangent = {x: 0, y: 0};
		}

		const point = getPoint(xs, xy, t);
		return {x: point.x, y: point.y, tangentX: tangent.x, tangentY: tangent.y};
	};

	const getC = () => {
		return c;
	};

	const getD = () => {
		return d;
	};

	return {
		getPointAtLength,
		getPropertiesAtLength,
		getTangentAtLength,
		getTotalLength,
		getC,
		getD,
	};
};
