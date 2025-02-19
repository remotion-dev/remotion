/* eslint-disable no-redeclare */
/* eslint-disable max-params */

import type {
	AngleUnit,
	AngleUnitString,
	LengthPercentageUnit,
	LengthPercentageUnitString,
	LengthUnit,
	LengthUnitString,
} from '../../type';
import {angleUnits, lengthPercentageUnits, lengthUnits} from '../../type';
import {isUnitWithString} from './is-unit-with-string';

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
): string {
	checkNumber({num: a, param: 'a', api: 'matrix'});
	checkNumber({num: b, param: 'b', api: 'matrix'});
	checkNumber({num: c, param: 'c', api: 'matrix'});
	checkNumber({num: d, param: 'd', api: 'matrix'});
	checkNumber({num: tx, param: 'tx', api: 'matrix'});
	checkNumber({num: ty, param: 'ty', api: 'matrix'});
	return `matrix(${a}, ${b}, ${c}, ${d}, ${tx}, ${ty})`;
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
): string {
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

	return `matrix3d(${a1}, ${b1}, ${c1}, ${d1}, ${a2}, ${b2}, ${c2}, ${d2}, ${a3}, ${b3}, ${c3}, ${d3}, ${a4}, ${b4}, ${c4}, ${d4})`;
}

/* Perspective */

function perspective(length: LengthPercentageUnitString): string;
function perspective(length: number, unit?: LengthUnit): string;
function perspective(length: unknown, unit: LengthUnit = 'px'): string {
	if (isUnitWithString(length, lengthUnits)) {
		return `perspective(${length})`;
	}

	checkNumber({num: length, param: 'length', api: 'perspective'});

	return `perspective(${length}${unit})`;
}

/* Rotation */
function rotate(angle: AngleUnitString): string;
function rotate(angle: number, unit?: AngleUnit): string;
function rotate(angle: unknown, unit: AngleUnit = 'deg'): string {
	if (isUnitWithString(angle, angleUnits)) {
		return `rotate(${angle})`;
	}

	checkNumber({num: angle, param: 'angle', api: 'rotate'});
	return `rotate(${angle}${unit})`;
}

function rotate3d(x: number, y: number, z: number, angle: number): string;
function rotate3d(
	x: number,
	y: number,
	z: number,
	angle: AngleUnitString,
): string;
function rotate3d(
	x: number,
	y: number,
	z: number,
	angle: number,
	unit?: AngleUnit,
): string;
function rotate3d(
	x: number,
	y: number,
	z: number,
	angle: unknown,
	unit: AngleUnit = 'deg',
): string {
	checkNumber({num: x, param: 'x', api: 'rotate3d'});
	checkNumber({num: y, param: 'y', api: 'rotate3d'});
	checkNumber({num: z, param: 'z', api: 'rotate3d'});

	if (isUnitWithString(angle, angleUnits)) {
		return `rotate3d(${x}, ${y}, ${z}, ${angle})`;
	}

	checkNumber({num: angle, param: 'angle', api: 'rotate3d'});

	return `rotate3d(${x}, ${y}, ${z}, ${angle}${unit})`;
}

function rotateX(angle: AngleUnitString): string;
function rotateX(angle: number, unit?: AngleUnit): string;
function rotateX(angle: unknown, unit: AngleUnit = 'deg'): string {
	if (isUnitWithString(angle, angleUnits)) {
		return `rotateX(${angle})`;
	}

	checkNumber({num: angle, param: 'angle', api: 'rotateX'});

	return `rotateX(${angle}${unit})`;
}

function rotateY(angle: AngleUnitString): string;
function rotateY(angle: number, unit?: AngleUnit): string;
function rotateY(angle: unknown, unit: AngleUnit = 'deg'): string {
	if (isUnitWithString(angle, angleUnits)) {
		return `rotateY(${angle})`;
	}

	checkNumber({num: angle, param: 'angle', api: 'rotateY'});

	return `rotateY(${angle}${unit})`;
}

function rotateZ(angle: AngleUnitString): string;
function rotateZ(angle: number, unit?: AngleUnit): string;
function rotateZ(angle: unknown, unit: AngleUnit = 'deg'): string {
	if (isUnitWithString(angle, angleUnits)) {
		return `rotateZ(${angle})`;
	}

	checkNumber({num: angle, param: 'angle', api: 'rotateZ'});

	return `rotateZ(${angle}${unit})`;
}

/* Scale */

function scale(x: number, y: number = x): string {
	checkNumber({num: x, param: 'x', api: 'scale'});
	return `scale(${x}, ${y})`;
}

function scale3d(x: number, y: number, z: number): string {
	checkNumber({num: x, param: 'x', api: 'scale3d'});
	checkNumber({num: y, param: 'y', api: 'scale3d'});
	checkNumber({num: z, param: 'z', api: 'scale3d'});

	return `scale3d(${x}, ${y}, ${z})`;
}

function scaleX(x: number): string {
	checkNumber({num: x, param: 'x', api: 'scaleX'});

	return `scaleX(${x})`;
}

function scaleY(y: number): string {
	checkNumber({num: y, param: 'y', api: 'scaleY'});

	return `scaleY(${y})`;
}

function scaleZ(z: number): string {
	checkNumber({num: z, param: 'z', api: 'scaleZ'});

	return `scaleZ(${z})`;
}

/* Skew */

// Case Z
function skew(angle: number): string;
// Case A
function skew(angle: AngleUnitString): string;
// Case B
function skew(angle: AngleUnitString, angle2: AngleUnitString): string;
// Case C
function skew(angle: number, unit: AngleUnit): string;
// Case D
function skew(angleX: number, angleY: number): string;
// Case E
function skew(
	angleX: number,
	unitX: AngleUnit,
	angleY: number,
	unitY: AngleUnit,
): string;
function skew(...args: unknown[]): string {
	const [arg1, arg2, arg3, arg4] = args;
	if (arguments.length === 1) {
		// Case A
		if (isUnitWithString(arg1, angleUnits)) {
			return `skew(${arg1}, ${arg1})`;
		}

		// Case Z
		checkNumber({num: arg1, param: 'angle', api: 'skew'});

		return `skew(${arg1}deg, ${arg1}deg)`;
	}

	if (arguments.length === 2) {
		// Case B
		if (
			isUnitWithString(arg1, angleUnits) &&
			isUnitWithString(arg2, angleUnits)
		) {
			return `skew(${arg1}, ${arg2})`;
		}

		// Case C
		if (typeof arg1 === 'number' && typeof arg2 !== 'number') {
			checkNumber({num: arg1, param: 'angle', api: 'skew'});
			return `skew(${arg1}${arg2}, ${arg1}${arg2})`;
		}

		// Case D
		if (typeof arg1 === 'number' && typeof arg2 === 'number') {
			checkNumber({num: arg1, param: 'angle', api: 'skew'});
			checkNumber({num: arg2, param: 'angle', api: 'skew'});
			return `skew(${arg1}deg, ${arg2}deg)`;
		}
	}

	if (arguments.length === 4) {
		// Case E
		if (
			typeof arg1 === 'number' &&
			isUnitWithString(arg2, angleUnits) &&
			typeof arg3 === 'number' &&
			isUnitWithString(arg4, angleUnits)
		) {
			checkNumber({num: arg1, param: 'angle', api: 'skew'});
			checkNumber({num: arg3, param: 'angle', api: 'skew'});
			return `skew(${arg1}${arg2}, ${arg3}${arg4})`;
		}
	}

	throw new TypeError(
		[
			'skew() supports only the following signatures:',
			'skew(angle: AngleUnitString): string;',
			'skew(angle: AngleUnitString, angle2: AngleUnitString): string;',
			'skew(angle: number, unit: AngleUnit): string;',
			'skew(angleX: number, angleY: number): string;',
			'skew(angleX: number, unitX: AngleUnit, angleY: number, unitY: AngleUnit): string;',
		].join('\n'),
	);
}

function skewX(angle: AngleUnitString): string;
function skewX(angle: number, unit?: AngleUnit): string;
function skewX(angle: unknown, unit: AngleUnit = 'deg'): string {
	if (isUnitWithString(angle, angleUnits)) {
		return `skewX(${angle})`;
	}

	checkNumber({num: angle, param: 'angle', api: 'skewX'});

	return `skewX(${angle}${unit})`;
}

function skewY(angle: AngleUnitString): string;
function skewY(angle: number, unit?: AngleUnit): string;
function skewY(angle: unknown, unit: AngleUnit = 'deg'): string {
	if (isUnitWithString(angle, angleUnits)) {
		return `skewY(${angle})`;
	}

	checkNumber({num: angle, param: 'angle', api: 'skewY'});

	return `skewY(${angle}${unit})`;
}

/* Translation */
// Case A
function translate(x: LengthPercentageUnitString): string;
// Case B
function translate(x: number): string;
// Case C
function translate(x: number, y: number): string;
// Case C.1
function translate(
	x: LengthPercentageUnitString,
	y: LengthPercentageUnitString,
): string;
// Case D
function translate(translation: number, unit: LengthPercentageUnit): string;
// Case E
function translate(
	x: number,
	unitX: LengthPercentageUnit,
	y: number,
	unitY: LengthPercentageUnit,
): string;
function translate(...args: unknown[]): string {
	const [arg1, arg2, arg3, arg4] = args;
	if (arguments.length === 1) {
		// Case A
		if (isUnitWithString(arg1, lengthPercentageUnits)) {
			return `translate(${arg1})`;
		}

		// Case B
		checkNumber({num: arg1, param: 'x', api: 'translate'});

		return `translate(${arg1}px)`;
	}

	if (arguments.length === 2) {
		// Case C
		if (typeof arg1 === 'number' && typeof arg2 === 'number') {
			checkNumber({num: arg1, param: 'x', api: 'translate'});
			checkNumber({num: arg2, param: 'y', api: 'translate'});
			return `translate(${arg1}px, ${arg2}px)`;
		}

		// Case C.1
		if (
			isUnitWithString(arg1, lengthPercentageUnits) &&
			isUnitWithString(arg2, lengthPercentageUnits)
		) {
			return `translate(${arg1}, ${arg2})`;
		}

		// Case D
		if (typeof arg1 === 'number' && typeof arg2 !== 'number') {
			checkNumber({num: arg1, param: 'x', api: 'translate'});
			return `translate(${arg1}${arg2})`;
		}
	}

	if (arguments.length === 4) {
		// Case E
		if (typeof arg1 === 'number' && typeof arg3 === 'number') {
			checkNumber({num: arg1, param: 'x', api: 'translate'});
			checkNumber({num: arg3, param: 'y', api: 'translate'});
			return `translate(${arg1}${arg2}, ${arg3}${arg4})`;
		}
	}

	throw new TypeError(
		[
			`translate() supports only the following signatures:`,
			`translate(x: LengthPercentageUnitString)`,
			`translate(x: number)`,
			`translate(x: number, y: number)`,
			`translate(translation: number, unit: LengthPercentageUnit)`,
			`translate(x: number, unitX: LengthPercentageUnit, y: number, unitY: LengthPercentageUnit): string;`,
		].join('\n'),
	);
}

function translate3d(
	x: LengthPercentageUnitString | number,
	y: LengthPercentageUnitString | number,
	z: LengthPercentageUnitString | number,
): string;
function translate3d(
	x: number,
	unitX: LengthPercentageUnit,
	y: number,
	unitY: LengthPercentageUnit,
	z: number,
	unitZ: LengthUnit,
): string;
function translate3d(...args: unknown[]): string {
	if (arguments.length === 3) {
		const [x, y, z] = args;
		const vars = [x, y, z].map((arg, i) => {
			if (isUnitWithString(arg, lengthPercentageUnits)) {
				return arg;
			}

			checkNumber({
				num: arg,
				param: i === 0 ? 'x' : i === 1 ? 'y' : 'z',
				api: 'translate3d',
			});
			if (typeof arg === 'number') {
				return `${arg}px`;
			}

			return arg;
		});

		return `translate3d(${vars.join(', ')})`;
	}

	if (arguments.length === 6) {
		const [x, unitX, y, unitY, z, unitZ] = args;
		if (
			typeof x === 'number' &&
			typeof y === 'number' &&
			typeof z === 'number'
		) {
			checkNumber({num: x, param: 'x', api: 'translate3d'});
			checkNumber({num: y, param: 'y', api: 'translate3d'});
			checkNumber({num: z, param: 'z', api: 'translate3d'});
			return `translate3d(${x}${unitX}, ${y}${unitY}, ${z}${unitZ})`;
		}
	}

	throw new TypeError(
		[
			`translate3d() supports only the following signatures:`,
			`translate3d(x: LengthPercentageUnitString, y: LengthPercentageUnitString, z: LengthPercentageUnitString)`,
			`translate3d(x: number, unitX: LengthPercentageUnit, y: number, unitY: LengthPercentageUnit, z: number, unitZ: LengthUnit)`,
		].join('\n'),
	);
}

function translateX(x: LengthPercentageUnitString): string;
function translateX(x: number, unit?: LengthPercentageUnit): string;
function translateX(x: unknown, unit: LengthPercentageUnit = 'px'): string {
	if (isUnitWithString(x, lengthPercentageUnits)) {
		return `translateX(${x})`;
	}

	checkNumber({num: x, param: 'x', api: 'translateX'});

	return `translateX(${x}${unit})`;
}

function translateY(y: LengthPercentageUnitString): string;
function translateY(y: number, unit?: LengthPercentageUnit): string;
function translateY(y: unknown, unit: LengthPercentageUnit = 'px'): string {
	if (isUnitWithString(y, lengthPercentageUnits)) {
		return `translateY(${y})`;
	}

	checkNumber({num: y, param: 'y', api: 'translateY'});
	return `translateY(${y}${unit})`;
}

function translateZ(z: LengthUnitString): string;
function translateZ(z: number, unit?: LengthUnit): string;
function translateZ(z: unknown, unit: LengthUnit = 'px'): string {
	if (isUnitWithString(z, lengthUnits)) {
		return `translateZ(${z})`;
	}

	checkNumber({num: z, param: 'z', api: 'translateZ'});

	return `translateZ(${z}${unit})`;
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
