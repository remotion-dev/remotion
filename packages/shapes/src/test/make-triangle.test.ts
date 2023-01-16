import {expect, test} from 'vitest';
import {makeTriangle} from '../utils/make-triangle';

test('Should be able to make a triangle path', () => {
	const rightTriangle = makeTriangle({
		length: 100,
		direction: 'right',
	});
	expect(rightTriangle).toEqual({
		width: 86.60254037844386,
		height: 100,
		path: 'M 0 0 L 0 100 L 86.60254037844386 50 z',
		transformOrigin: '28.867513459481287 50',
	});
});
