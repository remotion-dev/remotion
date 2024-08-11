import type {BufferIterator} from '../../../buffer-iterator';

export type WritingAppSegment = {
	type: 'writing-app-segment';
	value: string;
};

export const parseWritingSegment = (
	iterator: BufferIterator,
	length: number,
): WritingAppSegment => {
	const value = iterator.getByteString(length);

	return {
		type: 'writing-app-segment',
		value,
	};
};
