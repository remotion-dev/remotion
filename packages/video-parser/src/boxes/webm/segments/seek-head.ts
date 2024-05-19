import type {BufferIterator} from '../../../read-and-increment-offset';
import {expectSegment, type MatroskaSegment} from '../segments';

export type SeekHeadSegment = {
	type: 'seek-head-segment';
	children: MatroskaSegment[];
};

export const parseSeekHeadSegment = (
	iterator: BufferIterator,
	length: number,
): SeekHeadSegment => {
	const startOffset = iterator.counter.getOffset();

	const children = [];
	while (iterator.counter.getOffset() < startOffset + length) {
		const child = expectSegment(iterator);

		children.push(child);
	}

	return {
		type: 'seek-head-segment',
		children,
	};
};
