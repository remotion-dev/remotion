import {expect, test} from 'vitest';
import {getBackgroundImageRect} from '../drawing/background-image-rect';

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
