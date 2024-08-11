import type {BufferIterator} from '../../../buffer-iterator';
import type {MatroskaSegment} from '../segments';
import {expectChildren} from './parse-children';
import type {OnSimpleBlock} from './track-entry';

export type SeekSegment = {
	type: 'seek-segment';
	children: MatroskaSegment[];
};

export const parseSeekSegment = (
	iterator: BufferIterator,
	length: number,
	onSimpleBlock: OnSimpleBlock,
): SeekSegment => {
	const children = expectChildren({
		iterator,
		length,
		initialChildren: [],
		wrap: null,
		onSimpleBlock,
		allowIncomplete: false,
	});
	if (children.status === 'incomplete') {
		throw new Error('Incomplete children');
	}

	return {
		type: 'seek-segment',
		children: children.segments as MatroskaSegment[],
	};
};

export type SeekIdSegment = {
	type: 'seek-id-segment';
	seekId: string;
};

export const parseSeekIdSegment = (iterator: BufferIterator): SeekIdSegment => {
	const seekId = iterator.getMatroskaSegmentId();

	return {
		type: 'seek-id-segment',
		seekId,
	};
};
