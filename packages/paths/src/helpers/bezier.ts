// Copied from: https://github.com/rveciana/svg-path-properties

import type {Point, Properties} from './types';

import {
	cubicDerivative,
	cubicPoint,
	getCubicArcLength,
	getQuadraticArcLength,
	quadraticDerivative,
	quadraticPoint,
	t2length,
} from './bezier-functions';

export const makeQuadratic = ({
	startX,
	startY,
	cpx,
	cpy,
	x,
	y,
}: {
	startX: number;
	startY: number;
	cpx: number;
	cpy: number;
	x: number;
	y: number;
}): Properties & {
	getC: () => Point;
	getD: () => Point;
} => {
	const a = {x: startX, y: startY};
	const b = {x: cpx, y: cpy};
	const c = {x, y};

	const length = getQuadraticArcLength(
		[a.x, b.x, c.x, 0],
		[a.y, b.y, c.y, 0],
		1,
	);

	const getTotalLength = () => {
		return length;
	};

	const getPointAtLength = (len: number) => {
		const xs = [a.x, b.x, c.x, 0];
		const xy = [a.y, b.y, c.y, 0];
		const t = t2length({
			length: len,
			totalLength: length,
			func: (i) => getQuadraticArcLength(xs, xy, i),
		});

		return quadraticPoint(xs, xy, t);
	};

	const getTangentAtLength = (len: number) => {
		const xs = [a.x, b.x, c.x, 0];
		const xy = [a.y, b.y, c.y, 0];
		const t = t2length({
			length: len,
			totalLength: length,
			func: (i) => getQuadraticArcLength(xs, xy, i),
		});

		const derivative = quadraticDerivative(xs, xy, t);
		const mdl = Math.sqrt(
			derivative.x * derivative.x + derivative.y * derivative.y,
		);
		let tangent: Point;
		if (mdl > 0) {
			tangent = {x: derivative.x / mdl, y: derivative.y / mdl};
		} else {
			tangent = {x: 0, y: 0};
		}

		return tangent;
	};

	const getC = () => {
		return c;
	};

	return {
		getPointAtLength,
		getTangentAtLength,
		getTotalLength,
		getC,
		type: 'quadratic-bezier',
		getD: () => ({x: 0, y: 0}),
	};
};

export const makeCubic = ({
	startX,
	startY,
	cp1x,
	cp1y,
	cp2x,
	cp2y,
	x,
	y,
}: {
	startX: number;
	startY: number;
	cp1x: number;
	cp1y: number;
	cp2x: number;
	cp2y: number;
	x: number;
	y: number;
}): Properties & {
	getC: () => Point;
	getD: () => Point;
} => {
	const a = {x: startX, y: startY};
	const b = {x: cp1x, y: cp1y};
	const c = {x: cp2x, y: cp2y};

	const d: Point = {x, y};

	const length = getCubicArcLength({
		sx: [a.x, b.x, c.x, d.x],
		sy: [a.y, b.y, c.y, d.y],
		t: 1,
	});

	const getTotalLength = () => {
		return length;
	};

	const getPointAtLength = (len: number) => {
		const sx = [a.x, b.x, c.x, d.x];
		const sy = [a.y, b.y, c.y, d.y];
		const t = t2length({
			length: len,
			totalLength: length,
			func: (i) => {
				return getCubicArcLength({sx, sy, t: i});
			},
		});

		return cubicPoint(sx, sy, t);
	};

	const getTangentAtLength = (len: number) => {
		const xs = [a.x, b.x, c.x, d.x];
		const xy = [a.y, b.y, c.y, d.y];
		const t = t2length({
			length: len,
			totalLength: length,
			func: (i) => getCubicArcLength({sx: xs, sy: xy, t: i}),
		});

		const derivative = cubicDerivative(xs, xy, t);
		const mdl = Math.sqrt(
			derivative.x * derivative.x + derivative.y * derivative.y,
		);
		let tangent: Point;
		if (mdl > 0) {
			tangent = {x: derivative.x / mdl, y: derivative.y / mdl};
		} else {
			tangent = {x: 0, y: 0};
		}

		return tangent;
	};

	const getC = () => {
		return c;
	};

	const getD = () => {
		return d;
	};

	return {
		getPointAtLength,
		getTangentAtLength,
		getTotalLength,
		getC,
		getD,
		type: 'cubic-bezier',
	};
};
