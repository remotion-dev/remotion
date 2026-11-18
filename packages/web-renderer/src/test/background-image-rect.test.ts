import {expect, test} from 'vitest';
import {
	getBackgroundImageRect,
	parsePosition,
	resolveLengthPercentage,
	resolvePosition,
	splitAtTopLevel,
} from '../drawing/background-image-rect';

test('uses native CSS math when Typed OM rejects a supported function', () => {
	const original = Object.getOwnPropertyDescriptor(window, 'CSSNumericValue');
	Object.defineProperty(window, 'CSSNumericValue', {
		configurable: true,
		value: {
			parse: () => {
				throw new SyntaxError('Unsupported Typed OM function');
			},
		},
	});
	try {
		expect(
			resolveLengthPercentage({
				percentageBasis: 40,
				value: 'round(up, 10%, 3px)',
			}),
		).toBe(6);
	} finally {
		if (original) Object.defineProperty(window, 'CSSNumericValue', original);
		else Reflect.deleteProperty(window, 'CSSNumericValue');
	}
});

test('positions an oversized percentage background image', () => {
	const rect = getBackgroundImageRect({
		backgroundPosition: '25% 0%',
		backgroundSize: '220% 100%',
		intrinsicSize: null,
		positioningArea: new DOMRect(10, 20, 100, 50),
	});

	expect(rect.x).toBeCloseTo(-20);
	expect(rect.y).toBe(20);
	expect(rect.width).toBeCloseTo(220);
	expect(rect.height).toBe(50);
});

test('supports pixel sizes and positions', () => {
	const rect = getBackgroundImageRect({
		backgroundPosition: '12px 8px',
		backgroundSize: '40px 30px',
		intrinsicSize: null,
		positioningArea: new DOMRect(10, 20, 100, 50),
	});

	expect(rect).toEqual(new DOMRect(22, 28, 40, 30));
});

test('uses the positioning area for auto sizes', () => {
	const rect = getBackgroundImageRect({
		backgroundPosition: 'center',
		backgroundSize: 'auto',
		intrinsicSize: null,
		positioningArea: new DOMRect(10, 20, 100, 50),
	});

	expect(rect).toEqual(new DOMRect(10, 20, 100, 50));
});

// PR #13036: contain's dependent tile dimension is snapped before repetition.
test('snaps the dependent contain dimension for a raster tile', () => {
	const rect = getBackgroundImageRect({
		backgroundSize: 'contain',
		backgroundPosition: '0% 0%',
		positioningArea: new DOMRect(0, 0, 101, 128),
		intrinsicSize: {width: 16, height: 8},
	});
	expect(rect.width).toBe(101);
	expect(rect.height).toBe(51);
});

// PR #13031: Chrome preserves nested math and exponent notation in computed style.
test('resolves nested math without splitting function commas', () => {
	const position = parsePosition('calc(50% + min(10px, 10%)) 50%');
	expect(
		resolvePosition({containerSize: 100, imageSize: 50, value: position.x}),
	).toBe(30);
	expect(
		resolvePosition({containerSize: 100, imageSize: 150, value: position.x}),
	).toBe(-30);
});
test('retains scientific notation magnitude in computed positions', () => {
	expect(
		resolvePosition({
			containerSize: 100,
			imageSize: 50,
			value: 'calc(100% - 1e-06px)',
		}),
	).toBeCloseTo(49.999999, 8);
	expect(
		resolvePosition({containerSize: 100, imageSize: 50, value: '1e+06px'}),
	).toBe(1e6);
});

// KINO-7766: round fits a whole tile count and restores an auto axis's ratio.
test.each([
	{repeat: 'round', size: '35px 35px', width: 32, height: 32},
	{repeat: 'round repeat', size: '35px auto', width: 32, height: 16},
	{repeat: 'repeat round', size: 'auto 35px', width: 64, height: 32},
	{repeat: 'round', size: '200px 200px', width: 96, height: 96},
	{repeat: 'round repeat', size: '0px auto', width: 0, height: 0},
])(
	'sizes round tiles for $repeat and $size',
	({repeat, size, width, height}) => {
		const rect = getBackgroundImageRect({
			backgroundSize: size,
			backgroundPosition: '0% 0%',
			backgroundRepeat: repeat,
			positioningArea: new DOMRect(0, 0, 96, 96),
			intrinsicSize: {width: 16, height: 8},
		});
		expect(rect.width).toBe(width);
		expect(rect.height).toBe(height);
	},
);

// Multiple CSS masks may include URL punctuation inside quoted arguments.
test('retains parentheses and commas inside quoted image URLs', () => {
	const value = 'url("/mask)tile.png"), url("/mask(,tile.png")';
	expect(splitAtTopLevel(value, ',')).toEqual([
		'url("/mask)tile.png")',
		'url("/mask(,tile.png")',
	]);
});
