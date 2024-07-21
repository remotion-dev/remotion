import type {BufferIterator} from '../../../buffer-iterator';

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
