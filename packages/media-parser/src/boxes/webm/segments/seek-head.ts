import type {BufferIterator} from '../../../buffer-iterator';
import {type MatroskaSegment} from '../segments';
import {expectChildren} from './parse-children';
import type {OnSimpleBlock} from './track-entry';

export type SeekHeadSegment = {
	type: 'seek-head-segment';
	children: MatroskaSegment[];
	length: number;
};

export const parseSeekHeadSegment = (
	iterator: BufferIterator,
	length: number,
	onSimpleBlock: OnSimpleBlock,
): SeekHeadSegment => {
	const children = expectChildren({
		iterator,
		length,
		initialChildren: [],
		wrap: null,
		onSimpleBlock,
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
