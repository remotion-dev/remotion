import type {BufferIterator} from '../../../buffer-iterator';

export type MuxingAppSegment = {
	type: 'muxing-app-segment';
	value: string;
};

export const parseMuxingSegment = (
	iterator: BufferIterator,
): MuxingAppSegment => {
	const length = iterator.getVint();
	const value = iterator.getByteString(length);

	return {
		type: 'muxing-app-segment',
		value,
	};
};
