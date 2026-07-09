import {describe, expect, test} from 'bun:test';
import {Easing} from '../easing.js';
import {interpolate} from '../interpolate.js';
import {expectToThrow} from './expect-to-throw.js';

describe('Basic interpolations', () => {
	test('Input and output range strictly monotonically increasing', () => {
		expect(interpolate(1, [0, 1], [0, 2])).toEqual(2);
	});
	test('Input range strictly monotonically increasing, Output range non-increasing', () => {
		expect(interpolate(1, [0, 1], [2, 2])).toEqual(2);
	});
	test('Interpolate with 4 values, output non-increasing', () => {
		expect(interpolate(Math.PI, [0, 1, 4, 9], [0, 2, 1000, -1000])).toEqual(
			714.4364894275378,
		);
	});
	test('Interpolate Infinity: output range increasing', () => {
		expect(interpolate(Infinity, [0, 1], [0, 2])).toEqual(Infinity);
	});
	test('Interpolate Infinity: output range decreasing', () => {
		expect(interpolate(Infinity, [0, 1], [1, 0])).toEqual(-Infinity);
	});
});

test('Must be the same length', () => {
	expectToThrow(() => {
		interpolate(1, [0, 2], [0, 1, 2]);
	}, /inputRange \(2\) and outputRange \(3\) must have the same length/);
});

test('Must pass at least 1 element for input range', () => {
	expectToThrow(() => {
		interpolate(1, [], []);
	}, /inputRange must have at least 1 element/);
});

test('Can interpolate a single keyframe', () => {
	expect(interpolate(-10, [20], [9])).toBe(9);
	expect(interpolate(20, [20], [9])).toBe(9);
	expect(interpolate(30, [20], [9])).toBe(9);
	expect(
		interpolate(30, [20], [9], {
			extrapolateRight: 'identity',
		}),
	).toBe(9);
});

test('Easing array with one keyframe accepts no entries', () => {
	expect(
		interpolate(0.5, [0], [1], {
			easing: [],
		}),
	).toBe(1);
});

test('Input range must be strictly monotonically non-decreasing', () => {
	expectToThrow(() => {
		interpolate(1, [0, 1, 0.5], [0, 2, 0.2]);
	}, /inputRange must be strictly monotonically increasing/);
	expectToThrow(() => {
		interpolate(0.75, [0, 1, 1], [0, 2, 0]);
	}, /inputRange must be strictly monotonically increasing/);
});

test('Output range can be non-monotonic', () => {
	expect(interpolate(0.75, [0, 0.5, 1], [0, 2, 0])).toEqual(1);
});

test('Output range monotonically decreasing', () => {
	expect(interpolate(0.75, [0, 0.5, 1], [0, 2, 2])).toEqual(2);
});

test('Cannot have Infinity in input range', () => {
	expectToThrow(() => {
		interpolate(1, [-Infinity, 0], [0, 2]);
	}, /inputRange must contain only finite numbers, but got \[-Infinity,0\]/);
});

test('Cannot have Infinity in output Range', () => {
	expectToThrow(
		() => interpolate(1, [0, 1], [Infinity, 2]),
		/outputRange must contain only finite numbers, but got \[Infinity,2\]/,
	);
});

test('Should throw if passing 2x infinity input range', () => {
	expectToThrow(
		() => interpolate(1, [Infinity, Infinity], [0, 2]),
		/inputRange must contain only finite numbers, but got \[Infinity,Infinity\]/,
	);
});

test('Should throw if passing 2x infinity output range', () => {
	expectToThrow(
		() => interpolate(1, [0, 1], [-Infinity, Infinity]),
		/outputRange must contain only finite numbers, but got \[-Infinity,Infinity\]/,
	);
});

test('Should throw on Infinity as third argument', () => {
	expectToThrow(
		() => interpolate(1, [0, 1, Infinity], [0, 2, 3]),
		/inputRange must contain only finite numbers, but got \[0,1,Infinity\]/,
	);
});

test('Should throw on Infinity as third argument', () => {
	expectToThrow(
		() => interpolate(1, [0, 1, Infinity], [0, 2, 3]),
		/inputRange must contain only finite numbers, but got \[0,1,Infinity\]/,
	);
});

test('Easing test', () => {
	expect(
		interpolate(0.5, [0, 1], [0, 1], {
			easing: Easing.sin,
		}),
	).toEqual(1 - Math.cos((0.5 * Math.PI) / 2));
});

test('Easing array: one easing per segment between keyframes', () => {
	const linear = (t: number) => t;
	const quad = (t: number) => t * t;
	// Midpoint of second segment [10, 20]: normalized t = 0.5, quad -> 0.25
	expect(
		interpolate(15, [0, 10, 20], [0, 10, 20], {
			easing: [linear, quad],
		}),
	).toEqual(12.5);
});

test('Easing array: first segment easing only affects first segment', () => {
	const linear = (t: number) => t;
	const quad = (t: number) => t * t;
	expect(
		interpolate(5, [0, 10, 20], [0, 10, 20], {
			easing: [quad, linear],
		}),
	).toEqual(2.5);
});

test('Easing array: same as single easing when all segments use the same function', () => {
	const single = interpolate(15, [0, 10, 20], [0, 100, 200], {
		easing: Easing.linear,
	});
	const arrayed = interpolate(15, [0, 10, 20], [0, 100, 200], {
		easing: [Easing.linear, Easing.linear],
	});
	expect(arrayed).toEqual(single);
});

test('Easing array must have length inputRange.length - 1', () => {
	expectToThrow(() => {
		interpolate(1, [0, 10, 20], [0, 1, 2], {
			easing: [Easing.linear],
		});
	}, /When easing is an array, it must have one entry per segment between keyframes \(length inputRange.length - 1 = 2\), but got length 1/);
});

test('Easing array entries must be functions', () => {
	expectToThrow(() => {
		interpolate(5, [0, 10, 20], [0, 10, 20], {
			// @ts-expect-error
			easing: [Easing.linear, 'not-a-fn'],
		});
	}, /easing\[1\] must be a function/);
});

test('Easing array with two keyframes uses a single easing entry', () => {
	expect(
		interpolate(0.5, [0, 1], [0, 1], {
			easing: [Easing.sin],
		}),
	).toEqual(1 - Math.cos((0.5 * Math.PI) / 2));
});

test('Easing array with two keyframes rejects more than one entry', () => {
	expectToThrow(() => {
		interpolate(0.5, [0, 1], [0, 1], {
			easing: [Easing.linear, Easing.linear],
		});
	}, /When easing is an array, it must have one entry per segment between keyframes \(length inputRange.length - 1 = 1\), but got length 2/);
});

test('Posterize quantizes the input before interpolating', () => {
	expect(interpolate(17, [0, 60], [0, 1], {posterize: 3})).toBe(0.25);
	expect(interpolate(19, [0, 30, 60], [0, 100, 200], {posterize: 10})).toBe(
		33.33333333333333,
	);
});

test('Posterize option must be a positive finite number', () => {
	expectToThrow(() => {
		interpolate(10, [0, 20], [0, 1], {posterize: 0});
	}, /posterize must be a positive finite number, but got 0/);
	expectToThrow(() => {
		interpolate(10, [0, 20], [0, 1], {posterize: -1});
	}, /posterize must be a positive finite number, but got -1/);
	expectToThrow(() => {
		interpolate(10, [0, 20], [0, 1], {posterize: Infinity});
	}, /posterize must be a positive finite number, but got Infinity/);
	expectToThrow(() => {
		interpolate(10, [0, 20], [0, 1], {posterize: NaN});
	}, /posterize must be a positive finite number, but got NaN/);
});

test('Interpolates numeric tuples component-wise', () => {
	const start: readonly [number, number] = interpolate(
		30,
		[0, 60],
		[
			[0, 0.5],
			[1, 0.5],
		],
	);
	expect(start).toEqual([0.5, 0.5]);

	expect(
		interpolate(
			15,
			[0, 30],
			[
				[1, 2, 3],
				[2, 4, 6],
			],
		),
	).toEqual([1.5, 3, 4.5]);

	expect(
		interpolate(
			75,
			[0, 50, 100],
			[
				[0, 0],
				[1, 1],
				[0, 0.5],
			],
		),
	).toEqual([0.5, 0.75]);
});

test('Interpolates numeric tuples with one keyframe', () => {
	expect(interpolate(999, [0], [[0.2, 0.8]])).toEqual([0.2, 0.8]);
});

test('Numeric tuple interpolation supports easing, extrapolation and posterization', () => {
	expect(
		interpolate(
			15,
			[0, 30],
			[
				[0, 0],
				[100, 50],
			],
			{easing: Easing.quad},
		),
	).toEqual([25, 12.5]);
	expect(
		interpolate(
			45,
			[0, 30],
			[
				[0, 0],
				[100, 50],
			],
			{extrapolateRight: 'clamp'},
		),
	).toEqual([100, 50]);
	expect(
		interpolate(
			19,
			[0, 30],
			[
				[0, 0],
				[90, 30],
			],
			{posterize: 10},
		),
	).toEqual([30, 10]);
});

test('Numeric tuple interpolation throws on type and length mismatches', () => {
	expectToThrow(() => interpolate(0, [0, 1], [[0, 0.5], 1]), /numeric tuples/);
	expectToThrow(
		() => interpolate(0, [0, 1], [[0, 0.5], '1px']),
		/supported scale, translate, and rotate strings/,
	);
	expectToThrow(
		() =>
			interpolate(
				0,
				[0, 1],
				[
					[0, 0.5],
					[1, 0.5, 0],
				],
			),
		/outputRange tuples must all have the same length/,
	);
	expectToThrow(
		() =>
			interpolate(
				0,
				[0, 1],
				[
					[NaN, 0.5],
					[1, 0.5],
				],
			),
		/outputRange tuples must contain only finite numbers/,
	);
	expectToThrow(
		() =>
			interpolate(
				0,
				[0, 1],
				[
					[Infinity, 0.5],
					[1, 0.5],
				],
			),
		/outputRange tuples must contain only finite numbers/,
	);
	expectToThrow(
		() => interpolate(0, [0, 1], [[], [1, 0.5]]),
		/outputRange tuples must contain at least 1 number/,
	);
});

test('Interpolates scale strings', () => {
	expect(interpolate(15, [0, 30], ['1', '2'])).toBe('1.5');
	expect(interpolate(15, [0, 30], ['1 2', '2 4'])).toBe('1.5 3');
	expect(interpolate(15, [0, 30], ['1', '2 4 3'])).toBe('1.5 2.5 2');
	expect(interpolate(15, [0, 30], [1, '2 4 3'])).toBe('1.5 2.5 2');
});

test('Interpolates translate strings', () => {
	expect(interpolate(15, [0, 30], ['0px', '100px'])).toBe('50px');
	expect(interpolate(15, [0, 30], ['0px 59px', '100px 0px'])).toBe(
		'50px 29.5px',
	);
	expect(interpolate(15, [0, 30], ['0px', '100px 50%'])).toBe('50px 25%');
	expect(interpolate(15, [0, 30], ['0px 59px 10rem', '100px 0px 20rem'])).toBe(
		'50px 29.5px 15rem',
	);
});

test('Interpolates transform-origin keyword strings', () => {
	expect(interpolate(15, [0, 30], ['center', 'right bottom'])).toBe('75% 75%');
	expect(interpolate(15, [0, 30], ['left top', 'right bottom'])).toBe(
		'50% 50%',
	);
	expect(interpolate(15, [0, 30], ['top left', 'bottom right'])).toBe(
		'50% 50%',
	);
	expect(interpolate(15, [0, 30], ['top', 'bottom'])).toBe('50% 50%');
	expect(interpolate(15, [0, 30], ['left', 'right'])).toBe('50% 50%');
	expect(interpolate(15, [0, 30], ['left 25%', 'right 75%'])).toBe('50% 50%');
	expect(interpolate(15, [0, 30], ['top 25%', '75% bottom'])).toBe('50% 50%');
});

test('Interpolates transform-origin z components', () => {
	expect(interpolate(15, [0, 30], ['left top 10px', 'right bottom 30px'])).toBe(
		'50% 50% 20px',
	);
	expect(interpolate(15, [0, 30], ['left top', 'right bottom 10px'])).toBe(
		'50% 50% 5px',
	);
});

test('Interpolates rotate strings', () => {
	expect(interpolate(15, [0, 30], ['0deg', '100deg'])).toBe('50deg');
	expect(interpolate(15, [0, 30], ['-10.5deg', '20.5deg'])).toBe('5deg');
	expect(interpolate(15, [0, 30], ['0deg', '100deg 50deg'])).toBe(
		'50deg 25deg',
	);
	expect(interpolate(15, [0, 30], ['0turn', '0.5turn'])).toBe('0.25turn');
});

test('String interpolation supports easing, extrapolation and posterization', () => {
	expect(
		interpolate(15, [0, 30], ['0px', '100px'], {
			easing: Easing.quad,
		}),
	).toBe('25px');
	expect(
		interpolate(45, [0, 30], ['0deg', '100deg'], {
			extrapolateRight: 'clamp',
		}),
	).toBe('100deg');
	expect(
		interpolate(19, [0, 30], ['0px 0px', '90px 30px'], {
			posterize: 10,
		}),
	).toBe('30px 10px');
});

test('String interpolation throws on type and unit mismatches', () => {
	expectToThrow(
		() => interpolate(15, [0, 30], ['1', '100px']),
		/Cannot interpolate scale values with translate values/,
	);
	expectToThrow(
		() => interpolate(15, [0, 30], ['0deg', '100px']),
		/Cannot interpolate rotate values with translate values/,
	);
	expectToThrow(
		() => interpolate(15, [0, 30], ['0px', '100%']),
		/different units on axis 1/,
	);
	expectToThrow(
		() => interpolate(15, [0, 30], ['0deg', '0.5turn']),
		/different units on axis 1/,
	);
	expectToThrow(
		() => interpolate(15, [0, 30], ['0px', '1px 2px 3px 4px']),
		/1 to 3 components/,
	);
	expectToThrow(
		() => interpolate(15, [0, 30], ['left', '100px 100px']),
		/different units on axis 1/,
	);
	expectToThrow(
		() => interpolate(15, [0, 30], ['left right', 'right bottom']),
		/valid transform-origin keyword pair/,
	);
	expectToThrow(
		() => interpolate(15, [0, 30], ['top bottom', 'right bottom']),
		/valid transform-origin keyword pair/,
	);
	expectToThrow(
		() => interpolate(15, [0, 30], ['10% left', 'right bottom']),
		/horizontal transform-origin keywords/,
	);
	expectToThrow(
		() => interpolate(15, [0, 30], ['left top 50%', 'right bottom 10px']),
		/supported transform-origin z length/,
	);
	expectToThrow(
		() => interpolate(15, [0, 30], ['left top center', 'right bottom 10px']),
		/supported transform-origin z length/,
	);
});

test('Easing.circle with default extrapolate extend clamps normalized input', () => {
	expect(
		interpolate(150, [0, 100], [0, 100], {
			easing: Easing.circle,
		}),
	).toBe(100);
	expect(
		interpolate(-50, [0, 100], [0, 100], {
			easing: Easing.circle,
		}),
	).toBe(0);
});

test('Extrapolation left test', () => {
	const testValues: ('extend' | undefined)[] = ['extend', undefined];
	testValues.forEach((entry) => {
		expect(
			interpolate(-3, [0, 1, 2], [0, 0.5, 1], {
				extrapolateRight: entry,
			}),
		).toEqual(-1.5);
	});
});

test('Extrapolation right test', () => {
	const testValues: ('extend' | undefined)[] = ['extend', undefined];
	testValues.forEach((entry) => {
		expect(
			interpolate(3, [0, 1, 2], [0, 0.5, 1], {
				extrapolateRight: entry,
			}),
		).toEqual(1.5);
	});
});

test('Extrapolation identity', () => {
	const testValues: [
		number,
		{
			extrapolateRight?: 'identity' | undefined;
			extrapolateLeft?: 'identity' | undefined;
		},
	][] = [
		[1000, {extrapolateRight: 'identity'}],
		[-1000, {extrapolateLeft: 'identity'}],
	];
	testValues.forEach((entry) => {
		expect(interpolate(entry[0], [0, 1, 2], [0, 2, 4], entry[1])).toBe(
			entry[0],
		);
	});
});

test('Clamp right test', () => {
	expect(
		interpolate(2000, [0, 1, 1000], [0, 1, -1000], {
			extrapolateRight: 'clamp',
		}),
	).toEqual(-1000);
});

test('Allow tail spring extends right extrapolation', () => {
	const tailValue = interpolate(60, [0, 30], [1000, 0], {
		extrapolateRight: 'clamp',
		easing: Easing.spring({
			allowTail: true,
			damping: 200,
			durationRestThreshold: 0.1,
			mass: 1,
			stiffness: 100,
		}),
	});

	expect(tailValue).toBeGreaterThan(0);
	expect(tailValue).toBeLessThan(10);

	expect(
		interpolate(60, [0, 30], [1000, 0], {
			extrapolateRight: 'clamp',
			easing: Easing.spring({
				damping: 200,
				durationRestThreshold: 0.1,
				mass: 1,
				stiffness: 100,
			}),
		}),
	).toBe(0);
});

test('Allow tail spring keeps previous string segment settling while the next segment starts', () => {
	const parseTranslate = (value: string): [number, number] => {
		const [x, y] = value.split(' ');
		return [Number(x.replace('px', '')), Number(y.replace('px', ''))];
	};

	const withoutTail = interpolate(
		45,
		[0, 30, 60],
		['0px 1000px', '0px 0px', '1000px 0px'],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'extend',
			easing: [
				Easing.spring({
					damping: 200,
					durationRestThreshold: 0.03,
					mass: 1,
					stiffness: 100,
				}),
				Easing.spring({
					damping: 200,
					durationRestThreshold: 0.03,
					mass: 1,
					stiffness: 100,
				}),
			],
		},
	);
	const withTail = interpolate(
		45,
		[0, 30, 60],
		['0px 1000px', '0px 0px', '1000px 0px'],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'extend',
			easing: [
				Easing.spring({
					allowTail: true,
					damping: 200,
					durationRestThreshold: 0.03,
					mass: 1,
					stiffness: 100,
					overshootClamping: false,
				}),
				Easing.spring({
					allowTail: true,
					damping: 200,
					durationRestThreshold: 0.03,
					mass: 1,
					stiffness: 100,
					overshootClamping: false,
				}),
			],
		},
	);

	const [xWithoutTail, yWithoutTail] = parseTranslate(withoutTail);
	const [xWithTail, yWithTail] = parseTranslate(withTail);

	expect(xWithoutTail).toBeGreaterThan(0);
	expect(xWithTail).toBeGreaterThan(0);
	expect(yWithoutTail).toBe(0);
	expect(yWithTail).toBeGreaterThan(0);
	expect(yWithTail).toBeLessThan(10);
});

test('Clamp left test', () => {
	expect(
		interpolate(-2000, [0, 1, 1000], [Math.PI, 1, -1000], {
			extrapolateLeft: 'clamp',
		}),
	).toEqual(Math.PI);
});

test('Zig-zag test', () => {
	const testValues: [number, number][] = [
		[3.5, -500],
		[4, -1000],
		[6, 3000],
		[-0.1, -1100],
	];

	testValues.forEach((entry) => {
		expect(
			interpolate(entry[0], [1, 2, 3, 4, 5], [0, 1000, 0, -1000, 1000]),
		).toBe(entry[1]);
	});
});

test('Handle bad types', () => {
	// @ts-expect-error
	expect(() => interpolate(undefined, [0, 1], [1, 0])).toThrowError(
		/input can not be undefined/,
	);
	// @ts-expect-error
	expect(() => interpolate(1, undefined, [1, 0])).toThrowError(
		/inputRange can not be undefined/,
	);
	// @ts-expect-error
	expect(() => interpolate(1, [1, 0], undefined)).toThrowError(
		/outputRange can not be undefined/,
	);
	// @ts-expect-error
	expect(() => interpolate(1)).toThrowError(/inputRange can not be undefined/);
	// @ts-expect-error
	expect(() => interpolate('1', [0, 1], [1, 0])).toThrowError(
		/Cannot interpolate an input which is not a number/,
	);
	// @ts-expect-error
	expect(() => interpolate(1, 'string', 'string')).toThrowError(
		/inputRange must contain only numbers/,
	);
	// @ts-expect-error
	expect(() => interpolate(1, [1, 2, 3], 'str')).toThrowError(
		/outputRange must contain only numbers/,
	);
	// @ts-expect-error
	expect(() => interpolate(1, undefined, 'string')).toThrowError(
		/inputRange can not be undefined/,
	);
	// @ts-expect-error
	expect(() => interpolate([1, 2], undefined, 'string')).toThrowError(
		/inputRange can not be undefined/,
	);
});

test('wrap option', () => {
	expect(interpolate(1.5, [0, 1], [0, 2], {extrapolateRight: 'wrap'})).toBe(1);
	expect(interpolate(-0.5, [0, 1], [0, 2], {extrapolateLeft: 'wrap'})).toBe(1);
});
