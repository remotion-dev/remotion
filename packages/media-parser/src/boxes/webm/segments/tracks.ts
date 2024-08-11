import type {BufferIterator} from '../../../buffer-iterator';
import type {MatroskaSegment} from '../segments';
import {expectChildren} from './parse-children';
import type {OnSimpleBlock} from './track-entry';

export type TracksSegment = {
	type: 'tracks-segment';
	children: MatroskaSegment[];
};

export const parseTracksSegment = (
	iterator: BufferIterator,
	length: number,
	onSimpleBlock: OnSimpleBlock,
): TracksSegment => {
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
		type: 'tracks-segment',
		children: children.segments as MatroskaSegment[],
	};
};
