import {expect, test} from 'bun:test';
import {makePie} from '../utils/make-pie';

test('Test makePie() function', () => {
	const pie = makePie({progress: 0.5, radius: 100, closePath: true});
	expect(pie).toEqual({
		height: 200,
		width: 200,
		path: 'M 100 0 A 100 100 0 0 1 100 200 L 100 100 Z',
		instructions: [
			{type: 'M', x: 100, y: 0},
			{
				type: 'A',
				rx: 100,
				ry: 100,
				xAxisRotation: 0,
				largeArcFlag: false,
				sweepFlag: true,
				x: 100,
				y: 200,
			},
			{type: 'L', x: 100, y: 100},
			{type: 'Z'},
		],
		transformOrigin: '100 100',
	});
});
