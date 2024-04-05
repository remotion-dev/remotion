import {expect, test} from 'bun:test';
import {serializeInstructions} from '../serialize-instructions';

test('Should serialize instructions', () => {
	expect(
		serializeInstructions([
			{
				type: 'M',
				x: 100,
				y: 100,
			},
			{
				type: 'Z',
			},
		]),
	).toBe('M 100 100 Z');
});

test('Should not serialize bad instructions', () => {
	expect(() =>
		serializeInstructions([
			{
				type: 'M',
				x: 100,
				y: 100,
			},
			{
				// @ts-expect-error
				type: 'X',
			},
		]),
	).toThrow(/Unknown instruction type: X/);
});
