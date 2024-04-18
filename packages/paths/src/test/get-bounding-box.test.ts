import {expect, test} from 'bun:test';
import {getBoundingBox} from '../get-bounding-box';
import {resetPath} from '../reset-path';

test('getBoundingBox()', () => {
	expect(
		getBoundingBox('M 35,50 a 25,25,0,1,1,50,0 a 25,25,0,1,1,-50,0'),
	).toEqual({
		x1: 35,
		x2: 85,
		y1: 24.999999999999993,
		y2: 75,
		height: 50.00000000000001,
		viewBox: '35 24.999999999999993 50 50.00000000000001',
		width: 50,
	});
});

test('reset path should have 0 bounding box', () => {
	const newPath = resetPath('M 35,50 a 25,25,0,1,1,50,0 a 25,25,0,1,1,-50,0');
	const {x1, x2, y1, y2} = getBoundingBox(newPath);

	expect(x1).toBe(0);
	expect(x2).toBe(50);
	expect(y1).toBe(7.105427357601002e-15);
	expect(y2).toBeWithin(49.9999999999, 50.0000000001);
});
