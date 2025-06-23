import {describe, test} from 'bun:test';
import {
	validateMediaTrimProps,
	validateStartFromProps,
	validateTrimProps,
} from '../validate-start-from-props.js';
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

describe('ValidateTrim props should throw', () => {
	describe('Throw with invalid trimLeft prop', () => {
		test('It should throw if trimLeft prop is negative', () => {
			expectToThrow(
				() => validateTrimProps(-40, 1),
				/trimLeft must be greater than equal to 0 instead got -40./,
			);
		});
		test('It should throw if trimLeft is not a number', () => {
			expectToThrow(
				// @ts-expect-error
				() => validateTrimProps('10', 20),
				/type of trimLeft prop must be a number, instead got type string./,
			);
		});
		test('It should throw if trimLeft is NaN', () => {
			expectToThrow(
				() => validateTrimProps(NaN, 20),
				/trimLeft prop can not be NaN or Infinity./,
			);
		});
		test('It should throw if trimLeft is Infinity', () => {
			expectToThrow(
				() => validateTrimProps(Infinity, 20),
				/trimLeft prop can not be NaN or Infinity./,
			);
		});
	});

	describe('Throw with invalid trimRight prop', () => {
		test('It should throw if trimRight prop is negative', () => {
			expectToThrow(
				() => validateTrimProps(0, -40),
				/trimRight must be a positive number, instead got -40./,
			);
		});

		test('It should throw if trimRight is less than trimLeft', () => {
			expectToThrow(
				() => validateTrimProps(10, 1),
				/trimRight prop must be greater than trimLeft prop./,
			);
		});

		test('It should throw if trimRight is not a number', () => {
			expectToThrow(
				// @ts-expect-error
				() => validateTrimProps(10, '20'),
				/type of trimRight prop must be a number, instead got type string./,
			);
		});

		test('It should throw if trimRight is NaN', () => {
			expectToThrow(
				() => validateTrimProps(10, NaN),
				/trimRight prop can not be NaN./,
			);
		});
	});
});

describe('ValidateMediaTrim props should throw on conflicts', () => {
	test('It should throw if both startFrom and trimLeft are provided', () => {
		expectToThrow(
			() =>
				validateMediaTrimProps({
					startFrom: 10,
					endAt: undefined,
					trimLeft: 5,
					trimRight: undefined,
				}),
			/Cannot use both startFrom and trimLeft props. Use trimLeft instead as startFrom is deprecated./,
		);
	});

	test('It should throw if both endAt and trimRight are provided', () => {
		expectToThrow(
			() =>
				validateMediaTrimProps({
					startFrom: undefined,
					endAt: 20,
					trimLeft: undefined,
					trimRight: 15,
				}),
			/Cannot use both endAt and trimRight props. Use trimRight instead as endAt is deprecated./,
		);
	});

	test('It should throw if all props are provided', () => {
		expectToThrow(
			() =>
				validateMediaTrimProps({
					startFrom: 10,
					endAt: 20,
					trimLeft: 5,
					trimRight: 15,
				}),
			/Cannot use both startFrom and trimLeft props. Use trimLeft instead as startFrom is deprecated./,
		);
	});
});
