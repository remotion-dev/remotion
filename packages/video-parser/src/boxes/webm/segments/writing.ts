import type {BufferIterator} from '../../../buffer-iterator';

export type WritingAppSegment = {
	type: 'writing-app-segment';
	value: string;
};

export const parseWritingSegment = (
	iterator: BufferIterator,
): WritingAppSegment => {
	const length = iterator.getVint(1);
	const value = iterator.getByteString(length);

	return {
		type: 'writing-app-segment',
		value,
	};
};
