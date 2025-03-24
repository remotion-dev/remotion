import type {ParseMediaMode} from '../options';
import type {OffsetCounter} from './offset-counter';

export const bufferManager = ({
	initialData,
	maxBytes,
	counter,
}: {
	initialData: Uint8Array;
	maxBytes: number | null;
	counter: OffsetCounter;
}) => {
	const buf = new ArrayBuffer(initialData.byteLength, {
		maxByteLength:
			maxBytes === null
				? initialData.byteLength
				: Math.min(maxBytes as number, 2 ** 32),
	});
	if (!buf.resize) {
		throw new Error(
			'`ArrayBuffer.resize` is not supported in this Runtime. On the server: Use at least Node.js 20 or Bun. In the browser: Chrome 111, Edge 111, Safari 16.4, Firefox 128, Opera 111',
		);
	}

	let uintArray = new Uint8Array(buf);
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
		const oldLength = buf.byteLength;
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
		uintArray = new Uint8Array(buf);
		uintArray.set(newData, oldLength);
		view = new DataView(uintArray.buffer);
	};

	const replaceData = (newData: Uint8Array, seekTo: number) => {
		buf.resize(newData.byteLength);
		uintArray = new Uint8Array(buf);
		uintArray.set(newData);
		view = new DataView(uintArray.buffer);
		counter.setDiscardedOffset(seekTo);
		// reset counter to 0
		counter.decrement(counter.getOffset());
		// seek to the new position
		counter.increment(seekTo);
	};

	return {
		view,
		uintArray,
		destroy,
		addData,
		skipTo,
		removeBytesRead: flushBytesRead,
		replaceData,
	};
};
