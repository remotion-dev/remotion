import {expect, test} from 'bun:test';
import {makeHeart} from '../utils/make-heart';

test('Should be able to make a heart path', () => {
	const heartPath = makeHeart({
		size: 100,
	});

	expect(heartPath.width).toEqual(200);
	expect(heartPath.height).toEqual(160);
	expect(heartPath.transformOrigin).toEqual('100 80');
	expect(heartPath.instructions.length).toEqual(5);
	expect(heartPath.instructions[0]).toEqual({type: 'M', x: 100, y: 120});
	expect(heartPath.instructions[4]).toEqual({type: 'Z'});
	expect(heartPath.path.startsWith('M 100 120 C')).toBeTruthy();
});