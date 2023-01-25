import {expect, test} from 'vitest';
import {validateConcurrency} from '../validate-concurrency';

const invalidConcurrency: String = 'invalidConcurrency';

test('setConcurrency should throw if concurrency is not a number or percentage', () => {
	expect(() =>
		validateConcurrency(invalidConcurrency, 'concurrencyPerLambda')
	).toThrow(/concurrencyPerLambda must be a number or percentage, but is/);
});

test('setConcurrency should NOT throw if concurrency is a number', () => {
	expect(() => validateConcurrency(2, 'concurrencyPerLambda')).not.toThrow();
});

test('setConcurrency should throw if concurrency is too high', () => {
	expect(() => validateConcurrency(50, 'concurrencyPerLambda')).toThrow(
		/concurrencyPerLambda is set higher than the amount of CPU cores available/
	);
});

test('setConcurrency should throw if concurrency is too high', () => {
	expect(() => validateConcurrency('0', 'concurrency')).toThrow(
		/concurrency must be a number or percentage, but is "0"/
	);
});

test('setConcurrency should throw if concurrency is too high', () => {
	expect(validateConcurrency('50%', 'concurrency')).toBe(undefined);
});
