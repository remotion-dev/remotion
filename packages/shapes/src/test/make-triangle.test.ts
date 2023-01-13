import {expect, test} from 'vitest';
import {makeTriangle} from '../make-triangle';

test('Should be able to make a triangle path', () => {
	const rightTriangle = makeTriangle({
		width: 100,
		height: 100,
		direction: 'right',
	});
	expect(rightTriangle).toEqual('M 0,0 L 0,100 L 100,50 z');
});
