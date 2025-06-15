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
	expect(heartPath.instructions[0]).toEqual({type: 'M', x: 100, y: 60});
	expect(heartPath.instructions[heartPath.instructions.length - 1]).toEqual({type: 'Z'});
	expect(heartPath.path).toMatch(/^M \d+/);
});