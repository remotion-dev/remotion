import {expect, test} from 'bun:test';
import {cutInstruction} from '../cut-instruction';

test('Cut L instruction', () => {
	const result = cutInstruction({
		instruction: {
			type: 'L',
			x: 100,
			y: 100,
		},
		lastPoint: {
			x: 0,
			y: 0,
		},
		progress: 0.5,
	});

	expect(result).toEqual({
		type: 'L',
		x: 50,
		y: 50,
	});
});
