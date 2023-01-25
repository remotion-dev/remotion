import {expect, test} from 'vitest';
import {calculateDisplayVideoSize} from '../calculate-sar-dar-pixels';

test('Should parse display dimensions based on SAR and DAR correctly', () => {
	const size = calculateDisplayVideoSize({
		x: 1280,
		y: 720,
		darX: 896,
		darY: 1593,
	});

	expect(size).toEqual({
		width: 720,
		height: 1280,
	});

	const size2 = calculateDisplayVideoSize({
		x: 1920,
		y: 1080,
		darX: 16,
		darY: 9,
	});

	expect(size2).toEqual({
		width: 1920,
		height: 1080,
	});
});
