import {expect, test} from 'vitest';
import {makeEllipse} from '../make-ellipse';

test('Should be able to make a circle path', () => {
	const circlePath = makeEllipse({rx: 50, ry: 50});
	expect(circlePath).toEqual('M 50 0 a 50 50 0 1 0 1 0');
});
