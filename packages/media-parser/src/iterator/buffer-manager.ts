import type {MediaParserLogLevel} from '../log';
import {Log} from '../log';
import type {ParseMediaMode} from '../options';
import type {OffsetCounter} from './offset-counter';

type BufAndMethods = {
	getBuffer: () => ArrayBuffer;
	resize: (newLength: number) => void;
	byteLength: () => number;
};

const makeBufferWithMaxBytes = ({
	initialLength,
	maxBytes,
	fixedSizeBuffer,
}: {
	initialLength: number;
	maxBytes: number;
	fixedSizeBuffer: number | null;
}): BufAndMethods => {
	const maxByteLength = Math.min(maxBytes, 2 ** 31);

	if (fixedSizeBuffer) {
		const buf = new ArrayBuffer(fixedSizeBuffer);
		let length = initialLength;
		return {
			getBuffer: () => buf.slice(0, length),
			resize: (newLength: number) => {
				length = newLength;
			},
			byteLength: () => length,
		};
	}

	try {
		const buf = new ArrayBuffer(initialLength, {
			maxByteLength,
		});
		return {
			getBuffer: () => buf,
			resize: (len) => buf.resize(len),
			byteLength: () => buf.byteLength,
		};
	} catch (e) {
		// Cloudflare Workers have a limit of 128MB max array buffer size
		if (e instanceof RangeError && maxBytes > 2 ** 27) {
			const newBuf = new ArrayBuffer(initialLength, {
				maxByteLength: 2 ** 27,
			});
			return {
				getBuffer: () => newBuf,
				resize: (len) => newBuf.resize(len),
				byteLength: () => newBuf.byteLength,
			};
		}

		throw e;
	}
};

export const bufferManager = ({
	initialData,
	maxBytes,
	counter,
	useFixedSizeBuffer,
	logLevel,
	checkResize,
}: {
	initialData: Uint8Array;
	maxBytes: number;
	counter: OffsetCounter;
	useFixedSizeBuffer: number | null;
	logLevel: MediaParserLogLevel;
	checkResize: boolean;
}) => {
	const buf = makeBufferWithMaxBytes({
		initialLength: initialData.byteLength,
		maxBytes,
		fixedSizeBuffer: useFixedSizeBuffer,
	});

	if (checkResize) {
		if (!buf.resize && useFixedSizeBuffer === null) {
			throw new Error(
				[
					'`ArrayBuffer.resize` is not supported in this Runtime.',
					'On the server: Use at least Node.js 20 or Bun.',
					'In the browser: Chrome 111, Edge 111, Safari 16.4, Firefox 128, Opera 111',
					'Bypass this error by setting `useFixedSizeBuffer` to the size of the buffer you want to use.',
				].join('\n'),
			);
		}

		if (
			(buf.getBuffer() as unknown as {resize?: boolean}).resize &&
			useFixedSizeBuffer
		) {
			Log.warn(
				logLevel,
				'`ArrayBuffer.resize` is supported in this Runtime, but you are using `useFixedSizeBuffer`. This is not necessary.',
			);
		}
	}

	let uintArray = new Uint8Array(buf.getBuffer());
	uintArray.set(initialData);

	let view = new DataView(uintArray.buffer);

	const destroy = () => {
		uintArray = new Uint8Array(0);
		buf.resize(0);
	};

	const flushBytesRead = (force: boolean, mode: ParseMediaMode) => {
		const bytesToRemove = counter.getDiscardedOffset();

		// Only do this operation if it is really worth it 😇
		// let's set the threshold to 3MB
		if (bytesToRemove < 3_000_000 && !force) {
			return {bytesRemoved: 0, removedData: null};
		}

		// Don't remove if the data is not even available
		if (view.byteLength < bytesToRemove && !force) {
			return {bytesRemoved: 0, removedData: null};
		}

		counter.discardBytes(bytesToRemove);

		const removedData =
			mode === 'download' ? uintArray.slice(0, bytesToRemove) : null;

		const newData = uintArray.slice(bytesToRemove);
		uintArray.set(newData);
		buf.resize(newData.byteLength);

		view = new DataView(uintArray.buffer);

		return {bytesRemoved: bytesToRemove, removedData};
	};

	const skipTo = (offset: number) => {
		const becomesSmaller = offset < counter.getOffset();
		if (becomesSmaller) {
			const toDecrement = counter.getOffset() - offset;
			if (toDecrement > counter.getDiscardedOffset()) {
				throw new Error(
					'Cannot count backwards, data has already been flushed',
				);
			}

			counter.decrement(toDecrement);
		}

		const currentOffset = counter.getOffset();
		counter.increment(offset - currentOffset);
	};

	const addData = (newData: Uint8Array) => {
		const oldLength = buf.byteLength();
		const newLength = oldLength + newData.byteLength;

		if (newLength < oldLength) {
			throw new Error('Cannot decrement size');
		}

		if (newLength > (maxBytes ?? Infinity)) {
			throw new Error(
				`Exceeded maximum byte length ${maxBytes} with ${newLength}`,
			);
		}

		buf.resize(newLength);

		uintArray = new Uint8Array(buf.getBuffer());
		uintArray.set(newData, oldLength);
		view = new DataView(uintArray.buffer);
	};

	const replaceData = (newData: Uint8Array, seekTo: number) => {
		buf.resize(newData.byteLength);

		uintArray = new Uint8Array(buf.getBuffer());
		uintArray.set(newData);
		view = new DataView(uintArray.buffer);
		counter.setDiscardedOffset(seekTo);
		// reset counter to 0
		counter.decrement(counter.getOffset());
		// seek to the new position
		counter.increment(seekTo);
	};

	return {
		getView: () => view,
		getUint8Array: () => uintArray,
		destroy,
		addData,
		skipTo,
		removeBytesRead: flushBytesRead,
		replaceData,
	};
};
