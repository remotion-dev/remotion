import type {BufferIterator} from '../../buffer-iterator';

export const isMoviAtom = (iterator: BufferIterator, ckId: string): boolean => {
	if (ckId !== 'LIST') {
		return false;
	}

	const listType = iterator.getByteString(4, false);
	iterator.counter.decrement(4);
	return listType === 'movi';
};
