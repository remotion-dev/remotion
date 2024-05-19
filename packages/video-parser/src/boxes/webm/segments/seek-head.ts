import type {BufferIterator} from '../../../read-and-increment-offset';
import {expectSegment, type MatroskaSegment} from '../segments';

export type SeekHeadSegment = {
	type: 'seek-head-segment';
	child: MatroskaSegment;
};

export const parseSeekHeadSegment = (
	iterator: BufferIterator,
	length: number,
): SeekHeadSegment => {
	const child = expectSegment(iterator);
	return {
		type: 'seek-head-segment',
		child,
	};
};
