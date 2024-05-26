import type {BufferIterator} from '../../../read-and-increment-offset';

export type WritingAppSegment = {
	type: 'writing-app-segment';
	value: string;
};

export const parseWritingSegment = (
	iterator: BufferIterator,
): WritingAppSegment => {
	const value = iterator.getByteString(12);

	return {
		type: 'writing-app-segment',
		value,
	};
};
