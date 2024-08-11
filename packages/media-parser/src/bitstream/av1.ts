import type {BufferIterator} from '../buffer-iterator';

export const expectAv1Bitstream = (iterator: BufferIterator, size: number) => {
	const offset = iterator.counter.getOffset();
	const firstByte = iterator.getUint8();

	const remaining = size - (iterator.counter.getOffset() - offset);
	iterator.discard(remaining);
	return null;
};
