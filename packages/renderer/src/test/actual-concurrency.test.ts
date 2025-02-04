import {expect, test} from 'bun:test';
import {resolveConcurrency} from '../get-concurrency';
import {getCpuCount} from '../get-cpu-count';

const indent = false;
const logLevel = 'info' as const;

test('Actual concurrency null should choose a good result', async () => {
	expect(
		await resolveConcurrency({
			userPreference: null,
			indent: false,
			logLevel: 'info',
		}),
	).toBe(
		Math.round(
			Math.min(
				8,
				Math.max(1, ((await getCpuCount({indent, logLevel})) as number) / 2),
			),
		),
	);
});

test('50% should yield half the cores', async () => {
	expect(
		await resolveConcurrency({userPreference: '50%', indent, logLevel}),
	).toBe(
		Math.floor(
			Math.min(
				8,
				Math.max(1, ((await getCpuCount({indent, logLevel})) as number) / 2),
			),
		),
	);
});

test('75% should be 3/4 of the cores', async () => {
	expect(
		await resolveConcurrency({userPreference: '75%', indent, logLevel}),
	).toBe(
		Math.floor(((await getCpuCount({indent, logLevel})) as number) * 0.75),
	);
});

test('Slightly over 100% is ok as long as it is rounded', async () => {
	expect(
		await resolveConcurrency({userPreference: '100.2%', indent, logLevel}),
	).toBe((await getCpuCount({indent, logLevel})) as number);
});

test('Should also accept integers', async () => {
	expect(await resolveConcurrency({indent, logLevel, userPreference: 1})).toBe(
		1,
	);
});
