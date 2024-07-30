import type {BufferIterator} from '../../../buffer-iterator';

export type DurationSegment = {
	type: 'duration-segment';
	duration: number;
};

export const parseDurationSegment = (
	iterator: BufferIterator,
): DurationSegment => {
	const length = iterator.getVint(1);
	if (length !== 8) {
		throw new Error('Expected duration segment to be 8 bytes');
	}

	const duration = iterator.getFloat64();

	return {
		type: 'duration-segment',
		duration,
	};
};
