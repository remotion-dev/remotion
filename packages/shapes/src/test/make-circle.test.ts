import {expect, test} from 'vitest';
import {makeCircle} from '../utils/make-circle';

test('Should be able to make a circle path', () => {
	const circlePath = makeCircle({radius: 50});
	expect(circlePath).toEqual({
		height: 100,
		width: 100,
		path: 'M 50 50 m -50 0 a 50 50 0 1 0 100 0 50 50 0 1 0 -100 0',
		transformOrigin: '50 50',
	});
});
