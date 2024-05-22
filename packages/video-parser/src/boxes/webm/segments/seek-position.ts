import type {BufferIterator} from '../../../read-and-increment-offset';

export type SeekPositionSegment = {
	type: 'seek-position-segment';
	seekPosition: number;
};

export const parseSeekPositionSegment = (
	iterator: BufferIterator,
): SeekPositionSegment => {
	const length = iterator.getVint(1);

	const seekPosition = iterator.getDecimalBytes(length);

	return {
		type: 'seek-position-segment',
		seekPosition,
	};
};
