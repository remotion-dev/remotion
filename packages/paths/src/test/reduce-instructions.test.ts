import {expect, test} from 'vitest';
import {reduceInstructions} from '../reduce-instructions';

test('Should simplify simple instructions', () => {
	const simplified = reduceInstructions([
		{type: 'm', dx: 10, dy: 10},
		{type: 'h', dx: 100},
	]);

	expect(simplified).toEqual([
		{type: 'M', x: 10, y: 10},
		{type: 'L', x: 110, y: 10},
	]);
});

test('Should reduce A instructions', () => {
	const simplified = reduceInstructions([
		{
			type: 'A',
			largeArcFlag: true,
			sweepFlag: true,
			rx: 100,
			ry: 100,
			xAxisRotation: 100,
			x: 100,
			y: 100,
		},
	]);

	expect(simplified).toEqual([
		{
			type: 'C',
			cp1x: 1.4210854715202004e-14,
			cp1y: -55.22847498307935,
			cp2x: 44.771525016920656,
			cp2y: -99.99999999999997,
			x: 100,
			y: -99.99999999999997,
		},
		{
			type: 'C',
			cp1x: 155.22847498307934,
			cp1y: -99.99999999999997,
			cp2x: 200,
			cp2y: -55.22847498307933,
			x: 200,
			y: 1.0658141036401503e-14,
		},
		{
			type: 'C',
			cp1x: 200,
			cp1y: 55.22847498307935,
			cp2x: 155.22847498307934,
			cp2y: 100,
			x: 100.00000000000001,
			y: 100,
		},
	]);
});
