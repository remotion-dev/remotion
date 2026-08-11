import {expect, test} from 'bun:test';
import {centerPath} from '../center-path';
import {getBoundingBox} from '../get-bounding-box';

test('centerPath() centers a path around 0, 0', () => {
	expect(centerPath('M 10 10 L 20 20')).toBe('M -5 -5 L 5 5');
});

test('centerPath() accounts for bounding boxes that do not start at 0, 0', () => {
	const centered = centerPath('M 100 50 L 150 75');
	const box = getBoundingBox(centered);

	expect((box.x1 + box.x2) / 2).toBe(0);
	expect((box.y1 + box.y2) / 2).toBe(0);
});

test('centerPath() centers a path around a target point', () => {
	expect(centerPath('M 10 10 L 20 20', {x: 100, y: 50})).toBe(
		'M 95 45 L 105 55',
	);
});

test('centerPath() with arcs', () => {
	expect(centerPath('M 35,50 a 25,25,0,1,1,50,0 a 25,25,0,1,1,-50,0')).toBe(
		'M -25 0 a 25 25 0 1 1 50 0 a 25 25 0 1 1 -50 0',
	);
});
