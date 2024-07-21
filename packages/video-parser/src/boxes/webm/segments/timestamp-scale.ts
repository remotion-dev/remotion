import type {BufferIterator} from '../../../buffer-iterator';

export type TimestampScaleSegment = {
	type: 'timestamp-scale-segment';
	timestampScale: number;
};

export const parseTimestampScaleSegment = (
	iterator: BufferIterator,
): TimestampScaleSegment => {
	const timestampScale = iterator.getDecimalBytes(3);

	return {
		type: 'timestamp-scale-segment',
		timestampScale,
	};
};
