import type {BufferIterator} from '../../../buffer-iterator';

export type SeekPositionSegment = {
	type: 'seek-position-segment';
	seekPosition: number;
};

export const parseSeekPositionSegment = (
	iterator: BufferIterator,
): SeekPositionSegment => {
	const seekPosition = iterator.getDecimalBytes(length);

	return {
		type: 'seek-position-segment',
		seekPosition,
	};
};
