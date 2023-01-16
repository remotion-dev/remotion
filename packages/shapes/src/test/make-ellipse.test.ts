import {expect, test} from 'vitest';
import {makeEllipse} from '../utils/make-ellipse';

test('Should be able to make a circle path', () => {
	const circlePath = makeEllipse({rx: 100, ry: 50});
	expect(circlePath).toEqual({
		path: 'M 100 0 a 100 50 0 1 0 1 0',
		height: 100,
		width: 200,
	});
});
