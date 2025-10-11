import {expect, test} from 'bun:test';
import {makeHeart} from '../utils/make-heart';

test('Should be able to make a heart path', () => {
	const heartPath = makeHeart({
		aspectRatio: 1.1,
		height: 100,
		bottomRoundnessAdjustment: 0,
		depthAdjustment: 0,
	});

	expect(heartPath.width).toBeCloseTo(110);
	expect(heartPath.height).toBeCloseTo(100);
	expect(heartPath.transformOrigin).toEqual('55.00000000000001 50');
	expect(heartPath.instructions.length).toEqual(8);
	expect(heartPath.instructions[0]).toEqual({
		type: 'M',
		x: 55.00000000000001,
		y: 100,
	});
	expect(heartPath.instructions[5]).toEqual({
		cp1x: 97.00000000000001,
		cp1y: 0,
		cp2x: 110.00000000000001,
		cp2y: 13,
		type: 'C',
		x: 110.00000000000001,
		y: 25,
	});
	expect(heartPath.path.startsWith('M 55.00000000000001 100 C')).toBeTruthy();
});
