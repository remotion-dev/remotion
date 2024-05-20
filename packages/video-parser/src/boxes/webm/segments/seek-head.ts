import type {BufferIterator} from '../../../read-and-increment-offset';
import {type MatroskaSegment} from '../segments';
import {expectChildren} from './parse-children';

export type SeekHeadSegment = {
	type: 'seek-head-segment';
	children: MatroskaSegment[];
	length: number;
};

export const parseSeekHeadSegment = (
	iterator: BufferIterator,
): SeekHeadSegment => {
	const length = iterator.getVint(1);

	return {
		type: 'seek-head-segment',
		length,
		children: expectChildren(iterator, length),
	};
};
