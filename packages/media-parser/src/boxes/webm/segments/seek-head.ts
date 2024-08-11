import type {BufferIterator} from '../../../buffer-iterator';
import {type MatroskaSegment} from '../segments';
import {expectChildren} from './parse-children';

export type SeekHeadSegment = {
	type: 'seek-head-segment';
	children: MatroskaSegment[];
	length: number;
};

export const parseSeekHeadSegment = (
	iterator: BufferIterator,
	length: number,
): SeekHeadSegment => {
	const children = expectChildren({
		iterator,
		length,
		initialChildren: [],
		wrap: null,
	});

	if (children.status === 'incomplete') {
		throw new Error('Incomplete children');
	}

	return {
		type: 'seek-head-segment',
		length,
		children: children.segments as MatroskaSegment[],
	};
};
