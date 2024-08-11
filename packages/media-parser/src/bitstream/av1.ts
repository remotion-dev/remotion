import type {BufferIterator} from '../buffer-iterator';

export const expectBitstream = (iterator: BufferIterator, size: number) => {
	const offset = iterator.counter.getOffset();
	const firstByte = iterator.getUint8();
	console.log({firstByte, size});

	const remaining = size - (iterator.counter.getOffset() - offset);
	iterator.discard(remaining);
	return null;
};
