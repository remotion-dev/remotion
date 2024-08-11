import type {BufferIterator} from '../../../buffer-iterator';

export type MuxingAppSegment = {
	type: 'muxing-app-segment';
	value: string;
};

export const parseMuxingSegment = (
	iterator: BufferIterator,
	length: number,
): MuxingAppSegment => {
	const value = iterator.getByteString(length);

	return {
		type: 'muxing-app-segment',
		value,
	};
};
