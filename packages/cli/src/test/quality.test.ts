import {describe, expect, test} from 'vitest';
import {getQuality, setQuality} from '../config/quality';
import {expectToThrow} from './expect-to-throw';

describe('Test valid setQuality inputs', () => {
	test('Integers within accepted range', () => {
		const validInputes = [1, 50, 100];
		validInputes.forEach((entry) => {
			setQuality(entry);
			expect(getQuality()).toEqual(entry);
		});
	});

	test('Undefined input', () => {
		setQuality(undefined);
		expect(getQuality()).toEqual(undefined);
	});

	test('0 input', () => {
		setQuality(0);
		expect(getQuality()).toEqual(undefined);
	});
});

describe('Test invalid setQuality inputs ', () => {
	test('invalid input type', () => {
		const invalidInputQuality = ['abc', null];
		invalidInputQuality.forEach((entry) =>
			expectToThrow(
				// @ts-expect-error
				() => setQuality(entry),
				new RegExp(
					`Quality option must be a number or undefined. Got ${typeof entry}`
				)
			)
		);
	});

	test('out of range inputs', () => {
		const outOfRangeInput = [-1, 101, 150];
		outOfRangeInput.forEach((entry) =>
			expectToThrow(
				() => setQuality(entry),
				/Quality option must be between 0 and 100./
			)
		);
	});
});
