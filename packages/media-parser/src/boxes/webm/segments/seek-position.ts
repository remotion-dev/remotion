import type {BufferIterator} from '../../../buffer-iterator';

export type SeekPositionSegment = {
	type: 'seek-position-segment';
	seekPosition: number;
};

export const parseSeekPositionSegment = (
	iterator: BufferIterator,
): SeekPositionSegment => {
	const length = iterator.getVint();

	const seekPosition = iterator.getDecimalBytes(length);

	return {
		type: 'seek-position-segment',
		seekPosition,
	};
};
