import type {BufferIterator} from '../../read-and-increment-offset';
import {parseMainSegment} from './segments/main';

export const expectSegment = (iterator: BufferIterator) => {
	const segmentId = iterator.getMatroskaSegmentId();

	// TODO: Could be "unknown size"
	const length = iterator.getVint();

	if (segmentId === '0x18538067') {
		return [parseMainSegment(iterator, length)];
	}

	return [];
};
