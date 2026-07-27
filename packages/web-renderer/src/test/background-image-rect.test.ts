import {expect, test} from 'vitest';
import {getBackgroundImageRect} from '../drawing/background-image-rect';

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
