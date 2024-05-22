import type {BufferIterator} from '../../../read-and-increment-offset';

export type MuxingAppSegment = {
	type: 'muxing-app-segment';
	value: string;
};

export const parseMuxingSegment = (
	iterator: BufferIterator,
): MuxingAppSegment => {
	const value = iterator.getByteString(12);

	return {
		type: 'muxing-app-segment',
		value,
	};
};
