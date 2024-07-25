import {BrowserSafeApis} from '@remotion/renderer/client';
import {describe, expect, test} from 'bun:test';
import {expectToThrow} from './expect-to-throw';

const setJpegQuality = BrowserSafeApis.options.jpegQualityOption.setConfig;
const getJpegQuality = BrowserSafeApis.options.jpegQualityOption.getValue;

describe('Test valid setQuality inputs', () => {
	test('Integers within accepted range', () => {
		const validInputes = [1, 50, 100];
		validInputes.forEach((entry) => {
			setJpegQuality(entry);
			expect(getJpegQuality({commandLine: {}}).value).toEqual(entry);
		});
	});

	test('Undefined input', () => {
		setJpegQuality(undefined);
		expect(getJpegQuality({commandLine: {}}).value).toEqual(80);
	});

	test('0 input', () => {
		setJpegQuality(0);
		expect(getJpegQuality({commandLine: {}}).value).toEqual(80);
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
					`Quality option must be a number or undefined. Got ${typeof entry}`,
				),
			),
		);
	});

	test('out of range inputs', () => {
		const outOfRangeInput = [-1, 101, 150];
		outOfRangeInput.forEach((entry) =>
			expectToThrow(
				() => setJpegQuality(entry),
				/Quality option must be between 0 and 100./,
			),
		);
	});
});
