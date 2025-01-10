import {describe, test} from 'bun:test';
import {validateStartFromProps} from '../validate-start-from-props.js';
import {expectToThrow} from './expect-to-throw.js';

describe('ValidateStartFrom props should throw', () => {
	describe('Throw with invalid startFrom prop', () => {
		test('It should throw if startFrom prop is negative', () => {
			expectToThrow(
				() => validateStartFromProps(-40, 1),
				/startFrom must be greater than equal to 0 instead got -40./,
			);
		});
		test('It should throw if startFrom is not a number', () => {
			expectToThrow(
				// @ts-expect-error
				() => validateStartFromProps('10', 20),
				/type of startFrom prop must be a number, instead got type string./,
			);
		});
		test('It should throw if startFrom is NaN', () => {
			expectToThrow(
				() => validateStartFromProps(NaN, 20),
				/startFrom prop can not be NaN or Infinity./,
			);
		});
		test('It should throw if startFrom is Infinity', () => {
			expectToThrow(
				() => validateStartFromProps(Infinity, 20),
				/startFrom prop can not be NaN or Infinity./,
			);
		});
	});

	describe('Throw with invalid endAt prop', () => {
		test('It should throw if endAt prop is negative', () => {
			expectToThrow(
				() => validateStartFromProps(0, -40),
				/endAt must be a positive number, instead got -40./,
			);
		});

		test('It should throw if endAt is less than startFrom', () => {
			expectToThrow(
				() => validateStartFromProps(10, 1),
				/endAt prop must be greater than startFrom prop./,
			);
		});

		test('It should throw if endAt is not a number', () => {
			expectToThrow(
				// @ts-expect-error
				() => validateStartFromProps(10, '20'),
				/type of endAt prop must be a number, instead got type string./,
			);
		});

		test('It should throw if endAt is NaN', () => {
			expectToThrow(
				() => validateStartFromProps(10, NaN),
				/endAt prop can not be NaN./,
			);
		});
	});
});
