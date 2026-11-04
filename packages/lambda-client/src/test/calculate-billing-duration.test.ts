import {expect, test} from 'bun:test';
import {calculateBillingDuration} from '../calculate-billing-duration';
import {OVERHEAD_TIME_PER_LAMBDA} from '../most-expensive-chunks';

test('calculates billing duration for completed chunks with lambda overhead', () => {
	expect(
		calculateBillingDuration({
			timings: [
				{chunk: 0, start: 1000, rendered: 1500},
				{chunk: 1, start: 1200, rendered: 2000},
			],
			functionsInvoked: 2,
			elapsedTimeOfUnfinishedChunks: 10000,
		}),
	).toBe(500 + OVERHEAD_TIME_PER_LAMBDA + 800 + OVERHEAD_TIME_PER_LAMBDA);
});

test('only estimates unfinished duration for lambdas that have been invoked', () => {
	expect(
		calculateBillingDuration({
			timings: [{chunk: 0, start: 1000, rendered: 1500}],
			functionsInvoked: 2,
			elapsedTimeOfUnfinishedChunks: 10000,
		}),
	).toBe(500 + OVERHEAD_TIME_PER_LAMBDA + 10000);
});

test('does not charge for chunks that have not been invoked yet', () => {
	expect(
		calculateBillingDuration({
			timings: [],
			functionsInvoked: 1,
			elapsedTimeOfUnfinishedChunks: 10000,
		}),
	).toBe(10000);
});
