import {expect, test} from 'bun:test';
import {EventEmitter} from 'node:events';
import type {Writable} from 'node:stream';
import {raceWithFrameError} from '../race-with-frame-error';
import {writeToStitcher} from '../write-to-stitcher';

class ControlledWritable extends EventEmitter {
	destroyed = false;
	writable = true;

	constructor(private readonly writeResult: boolean | Error) {
		super();
	}

	write() {
		if (this.writeResult instanceof Error) {
			throw this.writeResult;
		}

		return this.writeResult;
	}
}

const asWritable = (stream: ControlledWritable) =>
	stream as unknown as Writable;

const expectNoTemporaryListeners = (stream: ControlledWritable) => {
	expect(stream.listenerCount('drain')).toBe(0);
	expect(stream.listenerCount('error')).toBe(0);
	expect(stream.listenerCount('close')).toBe(0);
};

test('resolves immediately when the stream accepts the write', async () => {
	const stream = new ControlledWritable(true);

	await writeToStitcher({
		buffer: Buffer.from('frame'),
		stdin: asWritable(stream),
	});

	expectNoTemporaryListeners(stream);
});

test('waits for drain after a backpressured write', async () => {
	const stream = new ControlledWritable(false);
	let resolved = false;
	const write = writeToStitcher({
		buffer: Buffer.from('frame'),
		stdin: asWritable(stream),
	}).then(() => {
		resolved = true;
	});

	await Promise.resolve();
	expect(resolved).toBe(false);
	stream.emit('drain');
	await write;

	expectNoTemporaryListeners(stream);
});

test('rejects an asynchronous stream error', async () => {
	const stream = new ControlledWritable(false);
	const error = Object.assign(new Error('write failed'), {code: 'EIO'});
	const write = writeToStitcher({
		buffer: Buffer.from('frame'),
		stdin: asWritable(stream),
	});

	stream.emit('error', error);

	await expect(write).rejects.toBe(error);
	expectNoTemporaryListeners(stream);
});

test('rejects when the stream closes before drain', async () => {
	const stream = new ControlledWritable(false);
	const write = writeToStitcher({
		buffer: Buffer.from('frame'),
		stdin: asWritable(stream),
	});

	stream.emit('close');

	await expect(write).rejects.toThrow('ERR_STREAM_PREMATURE_CLOSE');
	expectNoTemporaryListeners(stream);
});

test('rejects a synchronous write error', async () => {
	const error = Object.assign(new Error('broken pipe'), {code: 'EPIPE'});
	const stream = new ControlledWritable(error);

	await expect(
		writeToStitcher({buffer: Buffer.from('frame'), stdin: asWritable(stream)}),
	).rejects.toBe(error);
	expectNoTemporaryListeners(stream);
});

test('rejects a stream that is already closed', async () => {
	const stream = new ControlledWritable(true);
	stream.destroyed = true;
	stream.writable = false;

	await expect(
		writeToStitcher({buffer: Buffer.from('frame'), stdin: asWritable(stream)}),
	).rejects.toThrow('ERR_STREAM_PREMATURE_CLOSE');
	expectNoTemporaryListeners(stream);
});

test('stops waiting when the frame fails', async () => {
	let rejectFrame = (_error: Error): void => undefined;
	const frameError = new Promise<never>((_resolve, reject) => {
		rejectFrame = reject;
	});
	let releaseOperation = (): void => undefined;
	const operation = new Promise<void>((resolve) => {
		releaseOperation = resolve;
	});
	let cleanupCalls = 0;
	let operationFinished = false;
	const wait = raceWithFrameError({
		cleanup: () => {
			cleanupCalls++;
		},
		frameError,
		operation: () =>
			operation.then(() => {
				operationFinished = true;
			}),
	});
	const error = new Error('Page crashed during frame callback');

	rejectFrame(error);

	await expect(wait).rejects.toBe(error);
	expect(cleanupCalls).toBe(1);
	expect(operationFinished).toBe(false);
	releaseOperation();
	await operation;
	expect(operationFinished).toBe(true);
	expect(cleanupCalls).toBe(1);
});
