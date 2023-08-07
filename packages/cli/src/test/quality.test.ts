import {describe, expect, test} from 'vitest';
import {getJpegQuality, setJpegQuality} from '../config/jpeg-quality';
import {expectToThrow} from './expect-to-throw';

describe('Test valid setQuality inputs', () => {
	test('Integers within accepted range', () => {
		const validInputes = [1, 50, 100];
		validInputes.forEach((entry) => {
			setJpegQuality(entry);
			expect(getJpegQuality()).toEqual(entry);
		});
	});

	test('Undefined input', () => {
		setJpegQuality(undefined);
		expect(getJpegQuality()).toEqual(80);
	});

	test('0 input', () => {
		setJpegQuality(0);
		expect(getJpegQuality()).toEqual(80);
	});
});

describe('Test invalid setQuality inputs ', () => {
	test('invalid input type', () => {
		const invalidInputQuality = ['abc', null];
		invalidInputQuality.forEach((entry) =>
			expectToThrow(
				// @ts-expect-error
				() => setJpegQuality(entry),
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
				() => setJpegQuality(entry),
				/Quality option must be between 0 and 100./
			)
		);
	});
});
