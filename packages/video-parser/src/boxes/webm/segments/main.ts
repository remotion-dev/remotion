import type {BufferIterator} from '../../../read-and-increment-offset';

export type MainSegment = {
	type: 'main-segment';
};

export const parseMainSegment = (
	iterator: BufferIterator,
	length: number,
): MainSegment => {
	iterator.discard(length);

	return {
		type: 'main-segment',
	};
};
