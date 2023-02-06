import {expect, test} from 'vitest';
import {simplifyInstructions} from '..';

test('Should simplify simple instructions', () => {
	const simplified = simplifyInstructions([
		{type: 'm', dx: 10, dy: 10},
		{type: 'h', dx: 100},
	]);

	expect(simplified).toEqual([
		{type: 'M', x: 10, y: 10},
		{type: 'L', x: 110, y: 10},
	]);
});

test('Should reduce A instructions', () => {
	const simplified = simplifyInstructions([
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
			cp1x: 0,
			cp1y: -55.22847498307934,
			cp2x: 44.77152501692067,
			cp2y: -99.99999999999996,
			x: 100,
			y: -99.99999999999997,
		},
		{
			type: 'C',
			cp1x: 155.2284749830793,
			cp1y: -99.99999999999997,
			cp2x: 199.99999999999997,
			cp2y: -55.228474983079316,
			x: 200,
			y: 1.0658141036401503e-14,
		},
		{
			type: 'C',
			cp1x: 200,
			cp1y: 55.22847498307934,
			cp2x: 155.22847498307934,
			cp2y: 100,
			x: 100.00000000000001,
			y: 100,
		},
	]);
});
