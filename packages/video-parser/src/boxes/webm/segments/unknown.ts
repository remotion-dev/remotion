import type {BufferIterator} from '../../../read-and-increment-offset';

export type UnknownSegment = {
	id: string;
	type: 'unknown-segment';
};

export const parseUnknownSegment = (
	iterator: BufferIterator,
	id: string,
	length: number,
): UnknownSegment => {
	iterator.discard(length);

	return {
		id,
		type: 'unknown-segment',
	};
};
