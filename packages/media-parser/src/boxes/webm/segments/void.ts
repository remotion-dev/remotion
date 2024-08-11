import type {BufferIterator} from '../../../buffer-iterator';

export type VoidSegment = {
	type: 'void-segment';
	length: number;
};

export const parseVoidSegment = (
	iterator: BufferIterator,
	length: number,
): VoidSegment => {
	iterator.discard(length);

	return {
		type: 'void-segment',
		length,
	};
};
