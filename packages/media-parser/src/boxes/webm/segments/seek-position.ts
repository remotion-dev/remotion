import type {BufferIterator} from '../../../buffer-iterator';

export type SeekPositionSegment = {
	type: 'seek-position-segment';
	seekPosition: number;
};

export const parseSeekPositionSegment = (
	iterator: BufferIterator,
	length: number,
): SeekPositionSegment => {
	const seekPosition = iterator.getUint(length);

	return {
		type: 'seek-position-segment',
		seekPosition,
	};
};
