import {expect, test} from 'bun:test';
import {getActualConcurrency} from '../get-concurrency';
import {getConcurrencyFromNProc} from '../get-cpu-count';

test('Actual concurrency null should choose a good result', () => {
	expect(getActualConcurrency(null)).toBe(
		Math.round(
			Math.min(8, Math.max(1, (getConcurrencyFromNProc() as number) / 2)),
		),
	);
});

test('50% should yield half the cores', () => {
	expect(getActualConcurrency('50%')).toBe(
		Math.floor(
			Math.min(8, Math.max(1, (getConcurrencyFromNProc() as number) / 2)),
		),
	);
});

test('75% should be 3/4 of the cores', () => {
	expect(getActualConcurrency('75%')).toBe(
		Math.floor((getConcurrencyFromNProc() as number) * 0.75),
	);
});

test('Slightly over 100% is ok as long as it is rounded', () => {
	expect(getActualConcurrency('100.2%')).toBe(
		getConcurrencyFromNProc() as number,
	);
});

test('Should also accept integers', () => {
	expect(getActualConcurrency(1)).toBe(1);
});
