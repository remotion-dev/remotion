import {expect, test} from 'bun:test';
import {withSourceFileWriteQueue} from '../preview-server/routes/source-file-write-queue';

const waitForTask = () => new Promise((resolve) => setTimeout(resolve, 0));

test('withSourceFileWriteQueue serializes pending writes', async () => {
	const events: string[] = [];
	let releaseFirst: () => void = () => undefined;

	const first = withSourceFileWriteQueue(async () => {
		events.push('first:start');
		await new Promise<void>((resolve) => {
			releaseFirst = resolve;
		});
		events.push('first:end');
		return 1;
	});

	const second = withSourceFileWriteQueue(() => {
		events.push('second:start');
		return Promise.resolve(2);
	});

	await waitForTask();
	expect(events).toEqual(['first:start']);

	releaseFirst();
	await expect(first).resolves.toBe(1);
	await expect(second).resolves.toBe(2);
	expect(events).toEqual(['first:start', 'first:end', 'second:start']);
});

test('withSourceFileWriteQueue continues after a failed write', async () => {
	const failure = new Error('failed write');

	await expect(
		withSourceFileWriteQueue(() => Promise.reject(failure)),
	).rejects.toThrow('failed write');

	await expect(
		withSourceFileWriteQueue(() => Promise.resolve('next write')),
	).resolves.toBe('next write');
});
