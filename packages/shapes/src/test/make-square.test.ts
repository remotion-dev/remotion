import {expect, test} from 'vitest';
import {makeSquare} from '../make-square';

test('Should be able to make a square path', () => {
	const square = makeSquare({x: 50, y: 50, size: 100});
	expect(square).toEqual('M 50, 50 l 100, 0 l 0, 100 l -100, 0 Z');
});
