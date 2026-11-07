import {expect, test} from 'vitest';
import {
	getBackgroundImageRect,
	parsePosition,
	resolvePosition,
} from '../drawing/background-image-rect';

test('positions an oversized percentage background image', () => {
	const rect = getBackgroundImageRect({
		backgroundPosition: '25% 0%',
		backgroundSize: '220% 100%',
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
		positioningArea: new DOMRect(10, 20, 100, 50),
	});

	expect(rect).toEqual(new DOMRect(22, 28, 40, 30));
});

test('uses the positioning area for auto sizes', () => {
	const rect = getBackgroundImageRect({
		backgroundPosition: 'center',
		backgroundSize: 'auto',
		positioningArea: new DOMRect(10, 20, 100, 50),
	});

	expect(rect).toEqual(new DOMRect(10, 20, 100, 50));
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
