import {expect, test} from 'bun:test';
import {shouldIgnoreConcurrency} from '../validate-concurrency';

test('concurrency should be ignored when it would result in framesPerLambda < 4', () => {
	// Test cases where concurrency should be ignored
	const testCases = [
		{concurrency: 50, durationInFrames: 10, expected: true}, // 10/50 = 0.2, ceil = 1 < 4
		{concurrency: 100, durationInFrames: 10, expected: true}, // 10/100 = 0.1, ceil = 1 < 4
		{concurrency: 10, durationInFrames: 10, expected: true}, // 10/10 = 1, ceil = 1 < 4
		{concurrency: 5, durationInFrames: 10, expected: true}, // 10/5 = 2, ceil = 2 < 4
		{concurrency: 4, durationInFrames: 10, expected: true}, // 10/4 = 2.5, ceil = 3 < 4
	];

	testCases.forEach(({concurrency, durationInFrames, expected}) => {
		const result = shouldIgnoreConcurrency({concurrency, durationInFrames});
		expect(result).toBe(expected);
	});
});

test('concurrency should not be ignored when it would result in framesPerLambda >= 4', () => {
	// Test cases where concurrency should NOT be ignored
	const testCases = [
		{concurrency: 10, durationInFrames: 100, expected: false}, // 100/10 = 10 >= 4
		{concurrency: 25, durationInFrames: 100, expected: false}, // 100/25 = 4 >= 4
		{concurrency: 50, durationInFrames: 200, expected: false}, // 200/50 = 4 >= 4
		{concurrency: 1, durationInFrames: 4, expected: false}, // 4/1 = 4 >= 4
	];

	testCases.forEach(({concurrency, durationInFrames, expected}) => {
		const result = shouldIgnoreConcurrency({concurrency, durationInFrames});
		expect(result).toBe(expected);
	});
});

test('edge cases for concurrency ignoring', () => {
	// When durationInFrames is less than 4, the effective minimum is durationInFrames
	expect(shouldIgnoreConcurrency({concurrency: 1, durationInFrames: 3})).toBe(
		false,
	); // 3/1 = 3 >= 3
	expect(shouldIgnoreConcurrency({concurrency: 2, durationInFrames: 3})).toBe(
		true,
	); // 3/2 = 1.5, ceil = 2 < 3

	// When durationInFrames is exactly 4
	expect(shouldIgnoreConcurrency({concurrency: 1, durationInFrames: 4})).toBe(
		false,
	); // 4/1 = 4 >= 4
	expect(shouldIgnoreConcurrency({concurrency: 2, durationInFrames: 4})).toBe(
		true,
	); // 4/2 = 2 < 4
});
