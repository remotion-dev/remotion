import {expect, test} from 'vitest';
import {makeCircle} from '../utils/make-circle';

test('Should be able to make a circle path', () => {
	const circlePath = makeCircle({radius: 50});
	expect(circlePath).toEqual({
		height: 100,
		width: 100,
		path: 'M 50 50 m -50 0 a 50 50 0 1 0 100 0 a 50 50 0 1 0 -100 0 z',
		transformOrigin: '50 50',
		instructions: [
			{type: 'M', x: 50, y: 50},
			{type: 'm', x: -50, y: 0},
			{
				type: 'a',
				rx: 50,
				ry: 50,
				xAxisRotation: 0,
				largeArcFlag: true,
				sweepFlag: false,
				x: 100,
				y: 0,
			},
			{
				type: 'a',
				rx: 50,
				ry: 50,
				xAxisRotation: 0,
				largeArcFlag: true,
				sweepFlag: false,
				x: -100,
				y: 0,
			},
			{
				type: 'z',
			},
		],
	});
});
