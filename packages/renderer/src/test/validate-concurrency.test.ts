import {expect, test} from 'bun:test';
import {validateConcurrency} from '../validate-concurrency';

const invalidConcurrency: String = 'invalidConcurrency';

test('setConcurrency should throw if concurrency is not a number or percentage', () => {
	expect(() =>
		validateConcurrency({
			value: invalidConcurrency,
			setting: 'concurrencyPerLambda',
			checkIfValidForCurrentMachine: false,
		}),
	).toThrow(/concurrencyPerLambda must be a number or percentage, but is/);
});

test('setConcurrency should NOT throw if concurrency is a number', () => {
	expect(() =>
		validateConcurrency({
			value: 2,
			setting: 'concurrencyPerLambda',
			checkIfValidForCurrentMachine: false,
		}),
	).not.toThrow();
});

test('setConcurrency should throw if concurrency is too high', () => {
	expect(() =>
		validateConcurrency({
			checkIfValidForCurrentMachine: true,
			value: 50,
			setting: 'concurrencyPerLambda',
		}),
	).toThrow(
		/concurrencyPerLambda is set higher than the amount of CPU cores available/,
	);
});

test('setConcurrency should throw if concurrency is string 0', () => {
	expect(() =>
		validateConcurrency({
			value: '0',
			checkIfValidForCurrentMachine: false,
			setting: 'concurrency',
		}),
	).toThrow(/concurrency must be a number or percentage, but is "0"/);
});

test('setConcurrency should throw if concurrency is too high', () => {
	expect(
		validateConcurrency({
			checkIfValidForCurrentMachine: false,
			value: '50%',
			setting: 'concurrency',
		}),
	).toBe(undefined);
});
