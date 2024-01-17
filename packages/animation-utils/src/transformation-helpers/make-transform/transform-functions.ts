/* eslint-disable max-params */

import type {
	AngleUnit,
	LengthPercentageUnit,
	LengthUnit,
	TransformFunction,
} from '../../type';

/* Matrix transformation */

const checkNumber = ({
	num,
	param,
	api,
}: {
	num: unknown;
	param: string;
	api: string;
}) => {
	if (typeof num === 'undefined') {
		throw new TypeError(
			`Argument passed to "${api}" for param "${param}" is undefined`,
		);
	}

	if (typeof num !== 'number') {
		throw new TypeError(
			`Argument passed to "${api}" for param "${param}" is ${JSON.stringify(
				num,
			)}`,
		);
	}

	if (!Number.isFinite(num)) {
		throw new TypeError(
			`Argument passed to "${api}" for param "${param}" is ${JSON.stringify(
				num,
			)} (must be finite)`,
		);
	}
};

function matrix(
	a: number,
	b: number,
	c: number,
	d: number,
	tx: number,
	ty: number,
): TransformFunction {
	checkNumber({num: a, param: 'a', api: 'matrix'});
	checkNumber({num: b, param: 'b', api: 'matrix'});
	checkNumber({num: c, param: 'c', api: 'matrix'});
	checkNumber({num: d, param: 'd', api: 'matrix'});
	checkNumber({num: tx, param: 'tx', api: 'matrix'});
	checkNumber({num: ty, param: 'ty', api: 'matrix'});
	return () => `matrix(${a}, ${b}, ${c}, ${d}, ${tx}, ${ty})`;
}

function matrix3d(
	a1: number,
	b1: number,
	c1: number,
	d1: number,
	a2: number,
	b2: number,
	c2: number,
	d2: number,
	a3: number,
	b3: number,
	c3: number,
	d3: number,
	a4: number,
	b4: number,
	c4: number,
	d4: number,
): TransformFunction {
	checkNumber({num: a1, param: 'a1', api: 'matrix3d'});
	checkNumber({num: b1, param: 'b1', api: 'matrix3d'});
	checkNumber({num: c1, param: 'c1', api: 'matrix3d'});
	checkNumber({num: d1, param: 'd1', api: 'matrix3d'});
	checkNumber({num: a2, param: 'a2', api: 'matrix3d'});
	checkNumber({num: b2, param: 'b2', api: 'matrix3d'});
	checkNumber({num: c2, param: 'c2', api: 'matrix3d'});
	checkNumber({num: d2, param: 'd2', api: 'matrix3d'});
	checkNumber({num: a3, param: 'a3', api: 'matrix3d'});
	checkNumber({num: b3, param: 'b3', api: 'matrix3d'});
	checkNumber({num: c3, param: 'c3', api: 'matrix3d'});
	checkNumber({num: d3, param: 'd3', api: 'matrix3d'});
	checkNumber({num: a4, param: 'a4', api: 'matrix3d'});
	checkNumber({num: b4, param: 'b4', api: 'matrix3d'});
	checkNumber({num: c4, param: 'c4', api: 'matrix3d'});
	checkNumber({num: d4, param: 'd4', api: 'matrix3d'});

	return () =>
		`matrix3d(${a1}, ${b1}, ${c1}, ${d1}, ${a2}, ${b2}, ${c2}, ${d2}, ${a3}, ${b3}, ${c3}, ${d3}, ${a4}, ${b4}, ${c4}, ${d4})`;
}

/* Perspective */

function perspective(
	length: number,
	unit: LengthUnit = 'px',
): TransformFunction {
	checkNumber({num: length, param: 'length', api: 'perspective'});

	return () => `perspective(${length}${unit})`;
}

/* Rotation */

function rotate(angle: number, unit: AngleUnit = 'deg'): TransformFunction {
	checkNumber({num: angle, param: 'angle', api: 'rotate'});
	return () => `rotate(${angle}${unit})`;
}

function rotate3d(
	x: number,
	y: number,
	z: number,
	angle: number,
	unit: AngleUnit = 'deg',
): TransformFunction {
	checkNumber({num: x, param: 'x', api: 'rotate3d'});
	checkNumber({num: y, param: 'y', api: 'rotate3d'});
	checkNumber({num: z, param: 'z', api: 'rotate3d'});
	checkNumber({num: angle, param: 'angle', api: 'rotate3d'});

	return () => `rotate3d(${x}, ${y}, ${z}, ${angle}${unit})`;
}

function rotateX(angle: number, unit: AngleUnit = 'deg'): TransformFunction {
	checkNumber({num: angle, param: 'angle', api: 'rotateX'});

	return () => `rotateX(${angle}${unit})`;
}

function rotateY(angle: number, unit: AngleUnit = 'deg'): TransformFunction {
	checkNumber({num: angle, param: 'angle', api: 'rotateY'});

	return () => `rotateY(${angle}${unit})`;
}

function rotateZ(angle: number, unit: AngleUnit = 'deg'): TransformFunction {
	checkNumber({num: angle, param: 'angle', api: 'rotateZ'});

	return () => `rotateZ(${angle}${unit})`;
}

/* Scale */

function scale(x: number, y: number = x): TransformFunction {
	checkNumber({num: x, param: 'x', api: 'scale'});
	return () => `scale(${x}, ${y})`;
}

function scale3d(x: number, y: number, z: number): TransformFunction {
	checkNumber({num: x, param: 'x', api: 'scale3d'});
	checkNumber({num: y, param: 'y', api: 'scale3d'});
	checkNumber({num: z, param: 'z', api: 'scale3d'});

	return () => `scale3d(${x}, ${y}, ${z})`;
}

function scaleX(x: number): TransformFunction {
	checkNumber({num: x, param: 'x', api: 'scaleX'});

	return () => `scaleX(${x})`;
}

function scaleY(y: number): TransformFunction {
	checkNumber({num: y, param: 'y', api: 'scaleY'});

	return () => `scaleY(${y})`;
}

function scaleZ(z: number): TransformFunction {
	checkNumber({num: z, param: 'z', api: 'scaleZ'});

	return () => `scaleZ(${z})`;
}

/* Skew */

function skew(
	x: number,
	y: number = x,
	unit: AngleUnit = 'deg',
): TransformFunction {
	checkNumber({num: x, param: 'x', api: 'skew'});

	return () => `skew(${x}${unit}, ${y}${unit})`;
}

function skewX(angle: number, unit: AngleUnit = 'deg'): TransformFunction {
	checkNumber({num: angle, param: 'angle', api: 'skewX'});

	return () => `skewX(${angle}${unit})`;
}

function skewY(angle: number, unit: AngleUnit = 'deg'): TransformFunction {
	checkNumber({num: angle, param: 'angle', api: 'skewY'});

	return () => `skewY(${angle}${unit})`;
}

/* Translation */

function translate(
	x: number,
	y = 0,
	unitX: LengthPercentageUnit = 'px',
	unitY: LengthPercentageUnit = unitX,
): TransformFunction {
	checkNumber({num: x, param: 'x', api: 'translate'});

	return () => `translate(${x}${unitX}, ${y}${unitY})`;
}

function translate3d(
	x: number,
	y: number,
	z: number,
	unitX: LengthPercentageUnit = 'px',
	unitY: LengthPercentageUnit = unitX,
	unitZ: LengthUnit = 'px',
): TransformFunction {
	checkNumber({num: x, param: 'x', api: 'translate3d'});
	checkNumber({num: y, param: 'y', api: 'translate3d'});
	checkNumber({num: z, param: 'z', api: 'translate3d'});

	return () => `translate3d(${x}${unitX}, ${y}${unitY}, ${z}${unitZ})`;
}

function translateX(
	x: number,
	unit: LengthPercentageUnit = 'px',
): TransformFunction {
	checkNumber({num: x, param: 'x', api: 'translateX'});

	return () => `translateX(${x}${unit})`;
}

function translateY(
	y: number,
	unit: LengthPercentageUnit = 'px',
): TransformFunction {
	checkNumber({num: y, param: 'y', api: 'translateY'});
	return () => `translateY(${y}${unit})`;
}

function translateZ(z: number, unit: LengthUnit = 'px'): TransformFunction {
	checkNumber({num: z, param: 'z', api: 'translateZ'});

	return () => `translateZ(${z}${unit})`;
}

export {
	matrix,
	matrix3d,
	perspective,
	rotate,
	rotate3d,
	rotateX,
	rotateY,
	rotateZ,
	scale,
	scale3d,
	scaleX,
	scaleY,
	scaleZ,
	skew,
	skewX,
	skewY,
	translate,
	translate3d,
	translateX,
	translateY,
	translateZ,
};
