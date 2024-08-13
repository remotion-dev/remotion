import type {BufferIterator} from '../../../buffer-iterator';

export type DurationSegment = {
	type: 'duration-segment';
	duration: number;
};

export const parseDurationSegment = (
	iterator: BufferIterator,
	length: number,
): DurationSegment => {
	if (length === 8) {
		return {
			type: 'duration-segment',
			duration: iterator.getFloat64(),
		};
	}

	if (length === 4) {
		return {
			type: 'duration-segment',
			duration: iterator.getFloat32(),
		};
	}

	throw new Error(
		'Expected duration segment to be 4 or 8 bytes, but it is ' + length,
	);
};
