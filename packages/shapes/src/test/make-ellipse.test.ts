import {expect, test} from 'bun:test';
import {makeEllipse} from '../utils/make-ellipse';

test('Should be able to make a circle path', () => {
	const circlePath = makeEllipse({rx: 100, ry: 50});
	expect(circlePath).toEqual({
		path: 'M 100 0 a 100 50 0 1 0 1 0 Z',
		height: 100,
		width: 200,
		transformOrigin: '100 50',
		instructions: [
			{type: 'M', x: 100, y: 0},
			{
				type: 'a',
				rx: 100,
				ry: 50,
				xAxisRotation: 0,
				largeArcFlag: true,
				sweepFlag: false,
				dx: 1,
				dy: 0,
			},
			{
				type: 'Z',
			},
		],
	});
});
