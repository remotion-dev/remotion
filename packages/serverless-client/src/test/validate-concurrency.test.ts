import {expect, test} from 'bun:test';
import {
	shouldIgnoreConcurrency,
	validateConcurrency,
} from '../validate-concurrency';

test('should pass validation for valid concurrency values', () => {
	expect(() => {
		validateConcurrency({
			concurrency: 100,
			framesPerFunction: null,
			durationInFrames: 1000,
		});
	}).not.toThrow();
});

test('should pass validation when concurrency is not provided', () => {
	expect(() => {
		validateConcurrency({
			concurrency: null,
			framesPerFunction: 20,
			durationInFrames: 1000,
		});
	}).not.toThrow();
});

test('should throw error when both concurrency and framesPerFunction are provided', () => {
	expect(() => {
		validateConcurrency({
			concurrency: 100,
			framesPerFunction: 20,
			durationInFrames: 1000,
		});
	}).toThrow("Cannot specify both 'concurrency' and 'framesPerLambda'");
});

test('should throw error when concurrency is not a number', () => {
	expect(() => {
		validateConcurrency({
			concurrency: '100' as any,
			framesPerFunction: null,
			durationInFrames: 1000,
		});
	}).toThrow("'concurrency' needs to be a number");
});

test('should throw error when concurrency is not finite', () => {
	expect(() => {
		validateConcurrency({
			concurrency: Infinity,
			framesPerFunction: null,
			durationInFrames: 1000,
		});
	}).toThrow("'concurrency' needs to be finite");
});

test('should throw error when concurrency is NaN', () => {
	expect(() => {
		validateConcurrency({
			concurrency: NaN,
			framesPerFunction: null,
			durationInFrames: 1000,
		});
	}).toThrow("'concurrency' needs to be finite");
});

test('should throw error when concurrency is not an integer', () => {
	expect(() => {
		validateConcurrency({
			concurrency: 100.5,
			framesPerFunction: null,
			durationInFrames: 1000,
		});
	}).toThrow("'concurrency' needs to be an integer");
});

test('should throw error when concurrency is zero', () => {
	expect(() => {
		validateConcurrency({
			concurrency: 0,
			framesPerFunction: null,
			durationInFrames: 1000,
		});
	}).toThrow("'concurrency' needs to be positive");
});

test('should throw error when concurrency is negative', () => {
	expect(() => {
		validateConcurrency({
			concurrency: -10,
			framesPerFunction: null,
			durationInFrames: 1000,
		});
	}).toThrow("'concurrency' needs to be positive");
});

test('should throw error when concurrency exceeds maximum', () => {
	expect(() => {
		validateConcurrency({
			concurrency: 201,
			framesPerFunction: null,
			durationInFrames: 1000,
		});
	}).toThrow("'concurrency' cannot exceed 200");
});

test('should ignore concurrency when calculated framesPerLambda would be too low', () => {
	expect(() => {
		validateConcurrency({
			concurrency: 50,
			framesPerFunction: null,
			durationInFrames: 10,
		});
	}).not.toThrow();
});

test('shouldIgnoreConcurrency should return true when framesPerLambda would be < 4', () => {
	expect(shouldIgnoreConcurrency({concurrency: 50, durationInFrames: 10})).toBe(
		true,
	);
	expect(
		shouldIgnoreConcurrency({concurrency: 100, durationInFrames: 10}),
	).toBe(true);
	expect(shouldIgnoreConcurrency({concurrency: 10, durationInFrames: 10})).toBe(
		true,
	);
});

test('shouldIgnoreConcurrency should return false when framesPerLambda would be >= 4', () => {
	expect(
		shouldIgnoreConcurrency({concurrency: 10, durationInFrames: 100}),
	).toBe(false);
	expect(
		shouldIgnoreConcurrency({concurrency: 25, durationInFrames: 100}),
	).toBe(false);
	expect(
		shouldIgnoreConcurrency({concurrency: 50, durationInFrames: 200}),
	).toBe(false);
});

test('shouldIgnoreConcurrency should handle edge cases', () => {
	// When durationInFrames is less than 4, the effective minimum is durationInFrames
	expect(shouldIgnoreConcurrency({concurrency: 1, durationInFrames: 3})).toBe(
		false,
	);
	expect(shouldIgnoreConcurrency({concurrency: 2, durationInFrames: 3})).toBe(
		true,
	);

	// When durationInFrames is exactly 4
	expect(shouldIgnoreConcurrency({concurrency: 1, durationInFrames: 4})).toBe(
		false,
	);
	expect(shouldIgnoreConcurrency({concurrency: 2, durationInFrames: 4})).toBe(
		true,
	);
});
