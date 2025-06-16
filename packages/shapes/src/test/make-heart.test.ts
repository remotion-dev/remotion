import {expect, test} from 'bun:test';
import {makeHeart} from '../utils/make-heart';

test('Should be able to make a heart path', () => {
	const heartPath = makeHeart({
		width: 100,
		height: 100,
	});

	expect(heartPath.width).toEqual(100);
	expect(heartPath.height).toEqual(100);
	expect(heartPath.transformOrigin).toEqual('50 50');
	expect(heartPath.instructions.length).toEqual(6);
	expect(heartPath.instructions[0]).toEqual({type: 'M', x: 50, y: 85});
	expect(heartPath.instructions[5]).toEqual({type: 'Z'});
	expect(heartPath.path.startsWith('M 50 85 C')).toBeTruthy();
});
