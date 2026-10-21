import {expect, test} from 'bun:test';
import {resolveConcurrency} from '../get-concurrency';
import {getCpuCount} from '../get-cpu-count';

test('Actual concurrency null should choose a good result', () => {
	expect(resolveConcurrency(null)).toBe(
		Math.round(Math.min(8, Math.max(1, (getCpuCount() as number) / 2))),
	);
});

test('50% should yield half the cores', () => {
	expect(resolveConcurrency('50%')).toBe(
		Math.floor(Math.min(8, Math.max(1, (getCpuCount() as number) / 2))),
	);
});

test('75% should be 3/4 of the cores', () => {
	expect(resolveConcurrency('75%')).toBe(
		Math.floor((getCpuCount() as number) * 0.75),
	);
});

test('Slightly over 100% is ok as long as it is rounded', () => {
	expect(resolveConcurrency('100.2%')).toBe(getCpuCount() as number);
});

test('Should also accept integers', () => {
	expect(resolveConcurrency(1)).toBe(1);
});

test.skipIf((getCpuCount() as number) < 2)(
	'62.5% should be 5/8 of the cores',
	() => {
		expect(resolveConcurrency('62.5%')).toBe(
			Math.floor((getCpuCount() as number) * 0.625),
		);
	},
);

test.skipIf((getCpuCount() as number) < 2)(
	'87.5% should be 7/8 of the cores',
	() => {
		expect(resolveConcurrency('87.5%')).toBe(
			Math.floor((getCpuCount() as number) * 0.875),
		);
	},
);

test.skipIf((getCpuCount() as number) < 8)(
	'12.5% should be 1/8 of the cores',
	() => {
		expect(resolveConcurrency('12.5%')).toBe(
			Math.floor((getCpuCount() as number) * 0.125),
		);
	},
);
