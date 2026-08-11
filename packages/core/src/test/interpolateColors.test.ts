import {describe, expect, test} from 'bun:test';
import {Easing} from '../easing.js';
import {interpolateColors} from '../interpolate-colors.js';
import {expectToThrow} from './expect-to-throw.js';

test('Throws if color string is not right', () => {
	expectToThrow(() => {
		interpolateColors(1, [0, 1], ['#fabgdf', '#ffaabb']);
	}, /invalid color string #fabgdf provided/);
});

describe('Throws error for undefined parameters', () => {
	test('Undefined input', () => {
		expectToThrow(() => {
			// @ts-expect-error
			interpolateColors(undefined, ['#aaa', '#bbb'], ['#fff', '#000']);
		}, /input can not be undefined/);
	});
	test('Undefined inputRange', () => {
		expectToThrow(() => {
			// @ts-expect-error
			interpolateColors(1, undefined, ['#fff', '#000']);
		}, /inputRange can not be undefined/);
	});
	test('Undefined outputRange', () => {
		expectToThrow(() => {
			// @ts-expect-error
			interpolateColors(1, ['#fff', '#000'], undefined);
		}, /outputRange can not be undefined/);
	});
});

test('inputRange and outputRange must be of same length', () => {
	expectToThrow(() => {
		interpolateColors(1, [1, 2, 3], ['#ffffff', '#aaaaaa']);
	}, /inputRange \(3 values provided\) and outputRange \(2 values provided\) must have the same length/);
});

test('Basic interpolate Colors', () => {
	expect(interpolateColors(1, [0, 1], ['#ffaadd', '#fabfdf'])).toBe(
		'rgba(250, 191, 223, 1)',
	);
});

test('Posterize quantizes the input before interpolating colors', () => {
	expect(interpolateColors(17, [0, 60], ['black', 'white'])).toBe(
		'rgba(72, 72, 72, 1)',
	);
	expect(
		interpolateColors(17, [0, 60], ['black', 'white'], {
			posterize: 3,
		}),
	).toBe('rgba(64, 64, 64, 1)');
});

test('Posterize option must be a positive finite number for colors', () => {
	expectToThrow(() => {
		interpolateColors(17, [0, 60], ['black', 'white'], {posterize: 0});
	}, /posterize must be a positive finite number, but got 0/);
});

test('Easing remaps color interpolation', () => {
	expect(
		interpolateColors(0.5, [0, 1], ['black', 'white'], {
			easing: (input) => input * input,
		}),
	).toBe('rgba(64, 64, 64, 1)');
});

test('Easing array remaps color interpolation per segment', () => {
	expect(
		interpolateColors(15, [0, 10, 20], ['black', 'red', 'white'], {
			easing: [Easing.linear, (input) => input * input],
		}),
	).toBe('rgba(255, 64, 64, 1)');
});

test('Easing array must have one entry per color segment', () => {
	expectToThrow(() => {
		interpolateColors(5, [0, 10, 20], ['black', 'red', 'white'], {
			easing: [Easing.linear],
		});
	}, /When easing is an array, it must have one entry per segment between keyframes/);
});

test('Can interpolate a single color keyframe', () => {
	expect(interpolateColors(-10, [20], ['blue'])).toBe('rgba(0, 0, 255, 1)');
	expect(interpolateColors(20, [20], ['blue'])).toBe('rgba(0, 0, 255, 1)');
	expect(interpolateColors(30, [20], ['blue'])).toBe('rgba(0, 0, 255, 1)');
});

test('Clamp Right', () => {
	expect(interpolateColors(2, [0, 1], ['#ffaadd', '#fabfdf'])).toBe(
		'rgba(250, 191, 223, 1)',
	);
});

test('Clamp Left', () => {
	expect(interpolateColors(-1, [0, 1], ['#ffaadd', '#fabfdf'])).toBe(
		'rgba(255, 170, 221, 1)',
	);
});

test('Color shorthands', () => {
	expect(interpolateColors(1, [0, 1], ['#fad', '#fabfdf'])).toBe(
		'rgba(250, 191, 223, 1)',
	);
});

test('Color names', () => {
	expect(interpolateColors(1, [0, 1], ['red', 'blue'])).toBe(
		'rgba(0, 0, 255, 1)',
	);
});

test('Mix transparency', () => {
	expect(interpolateColors(0.5, [0, 1], ['transparent', 'blue'])).toBe(
		'rgba(0, 0, 128, 0.5)',
	);
});

test('HSV', () => {
	expect(
		interpolateColors(0.5, [0, 1], ['hsla(120, 100%, 25%, 0)', 'blue']),
	).toBe('rgba(0, 64, 128, 0.5)');

	expect(interpolateColors(0.5, [0, 1], ['hsl(120, 50%, 50%)', 'blue'])).toBe(
		'rgba(32, 96, 160, 1)',
	);
});

describe('RGB', () => {
	test('standard rgb interpolation', () =>
		expect(
			interpolateColors(0.5, [0, 1], ['rgb(0,0,0)', 'rgb(255,255,255)']),
		).toBe('rgba(128, 128, 128, 1)'));

	test('rgb clamping', () => {
		expect(
			interpolateColors(0.5, [0, 1], ['rgb(-1,0,0)', 'rgb(256,255,255)']),
		).toBe('rgba(128, 128, 128, 1)');
	});
});

describe('oklch', () => {
	test('oklch black', () => {
		expect(interpolateColors(1, [0, 1], ['oklch(0 0 0)', 'black'])).toBe(
			'rgba(0, 0, 0, 1)',
		);
	});

	test('oklch white', () => {
		expect(interpolateColors(1, [0, 1], ['black', 'oklch(1 0 0)'])).toBe(
			'rgba(255, 255, 255, 1)',
		);
	});

	test('oklch with alpha', () => {
		const result = interpolateColors(
			1,
			[0, 1],
			['black', 'oklch(1 0 0 / 0.5)'],
		);
		expect(result).toBe('rgba(255, 255, 255, 0.502)');
	});

	test('oklch with percentage lightness', () => {
		expect(interpolateColors(1, [0, 1], ['black', 'oklch(100% 0 0)'])).toBe(
			'rgba(255, 255, 255, 1)',
		);
	});

	test('oklch interpolation', () => {
		const result = interpolateColors(
			0.5,
			[0, 1],
			['oklch(0 0 0)', 'oklch(1 0 0)'],
		);
		expect(result).toBe('rgba(128, 128, 128, 1)');
	});
});

describe('oklab', () => {
	test('oklab black', () => {
		expect(interpolateColors(1, [0, 1], ['oklab(0 0 0)', 'black'])).toBe(
			'rgba(0, 0, 0, 1)',
		);
	});

	test('oklab white', () => {
		expect(interpolateColors(1, [0, 1], ['black', 'oklab(1 0 0)'])).toBe(
			'rgba(255, 255, 255, 1)',
		);
	});

	test('oklab with alpha', () => {
		const result = interpolateColors(
			1,
			[0, 1],
			['black', 'oklab(1 0 0 / 0.5)'],
		);
		expect(result).toBe('rgba(255, 255, 255, 0.502)');
	});
});

describe('lab', () => {
	test('lab black', () => {
		expect(interpolateColors(1, [0, 1], ['lab(0 0 0)', 'black'])).toBe(
			'rgba(0, 0, 0, 1)',
		);
	});

	test('lab white', () => {
		expect(interpolateColors(1, [0, 1], ['black', 'lab(100 0 0)'])).toBe(
			'rgba(255, 255, 255, 1)',
		);
	});

	test('lab with alpha', () => {
		const result = interpolateColors(
			1,
			[0, 1],
			['black', 'lab(100 0 0 / 0.5)'],
		);
		expect(result).toBe('rgba(255, 255, 255, 0.502)');
	});
});

describe('lch', () => {
	test('lch black', () => {
		expect(interpolateColors(1, [0, 1], ['lch(0 0 0)', 'black'])).toBe(
			'rgba(0, 0, 0, 1)',
		);
	});

	test('lch white', () => {
		expect(interpolateColors(1, [0, 1], ['black', 'lch(100 0 0)'])).toBe(
			'rgba(255, 255, 255, 1)',
		);
	});

	test('lch with alpha', () => {
		const result = interpolateColors(
			1,
			[0, 1],
			['black', 'lch(100 0 0 / 0.5)'],
		);
		expect(result).toBe('rgba(255, 255, 255, 0.502)');
	});
});

describe('hwb', () => {
	test('hwb pure red', () => {
		expect(interpolateColors(1, [0, 1], ['black', 'hwb(0 0% 0%)'])).toBe(
			'rgba(255, 0, 0, 1)',
		);
	});

	test('hwb white', () => {
		expect(interpolateColors(1, [0, 1], ['black', 'hwb(0 100% 0%)'])).toBe(
			'rgba(255, 255, 255, 1)',
		);
	});

	test('hwb black', () => {
		expect(interpolateColors(1, [0, 1], ['white', 'hwb(0 0% 100%)'])).toBe(
			'rgba(0, 0, 0, 1)',
		);
	});

	test('hwb gray', () => {
		expect(interpolateColors(1, [0, 1], ['black', 'hwb(0 50% 50%)'])).toBe(
			'rgba(128, 128, 128, 1)',
		);
	});

	test('hwb with alpha', () => {
		const result = interpolateColors(
			1,
			[0, 1],
			['black', 'hwb(0 0% 0% / 0.5)'],
		);
		expect(result).toBe('rgba(255, 0, 0, 0.502)');
	});

	test('hwb interpolation', () => {
		const result = interpolateColors(
			0.5,
			[0, 1],
			['hwb(0 0% 0%)', 'hwb(0 100% 0%)'],
		);
		// Red to white at midpoint
		expect(result).toBe('rgba(255, 128, 128, 1)');
	});
});
