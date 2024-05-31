import type {BufferIterator} from '../../../read-and-increment-offset';

export type VoidSegment = {
	type: 'void-segment';
	length: number;
};

export const parseVoidSegment = (iterator: BufferIterator): VoidSegment => {
	const length = iterator.getVint(8);
	iterator.discard(length);

	return {
		type: 'void-segment',
		length,
	};
};
