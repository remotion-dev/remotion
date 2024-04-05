import {expect, test} from 'bun:test';
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

	expect(simplified[0].type).toEqual('C');
	// @ts-expect-error
	expect(Math.round(simplified[1].cp1y) * 100).toEqual(-10000);
	// @ts-expect-error
	expect(Math.round(simplified[1].cp2x) * 100).toEqual(20000);
});
