import {expect, test} from 'bun:test';
import {Writable} from 'node:stream';
import {writeWithBackpressure} from '../write-with-backpressure';

test('waits for a writable stream to drain', async () => {
	let hasStartedWriting = false;
	let finishWrite: (error?: Error | null) => void = () => {
		throw new Error('The write did not start.');
	};

	const writable = new Writable({
		highWaterMark: 1,
		write: (_chunk, _encoding, callback) => {
			hasStartedWriting = true;
			finishWrite = callback;
		},
	});
	let settled = false;
	const write = writeWithBackpressure({
		data: Buffer.from('frame'),
		writable,
	}).then(() => {
		settled = true;
	});

	await Promise.resolve();
	expect(settled).toBe(false);
	expect(hasStartedWriting).toBe(true);
	finishWrite();
	await write;
	expect(settled).toBe(true);
});
