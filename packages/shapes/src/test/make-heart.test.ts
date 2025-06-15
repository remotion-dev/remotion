import {expect, test} from 'bun:test';
import {makeHeart} from '../utils/make-heart';

test('Should be able to make a heart path', () => {
	const heartPath = makeHeart({
		width: 200,
		height: 200,
	});

	expect(heartPath.width).toBeGreaterThan(0);
	expect(heartPath.height).toBeGreaterThan(0);
	expect(heartPath.transformOrigin).toEqual('100 100');
	expect(heartPath.instructions.length).toBeGreaterThan(0);
	expect(heartPath.instructions[0].type).toEqual('M');
	expect(heartPath.instructions[heartPath.instructions.length - 1]).toEqual({type: 'Z'});
	expect(heartPath.path).toMatch(/^M \d+/);
});