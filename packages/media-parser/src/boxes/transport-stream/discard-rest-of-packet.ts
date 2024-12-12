import type {BufferIterator} from '../../buffer-iterator';

export const discardRestOfPacket = (iterator: BufferIterator) => {
	const next188 = 188 - (iterator.counter.getOffset() % 188);
	iterator.discard(next188);
};

export const getRestOfPacket = (iterator: BufferIterator) => {
	const next188 = 188 - (iterator.counter.getOffset() % 188);
	return iterator.getSlice(next188);
};
