import type {BufferIterator} from '../../../buffer-iterator';
import type {MatroskaSegment} from '../segments';
import {expectChildren} from './parse-children';
import type {OnSimpleBlock} from './track-entry';

export type InfoSegment = {
	type: 'info-segment';
	length: number;
	children: MatroskaSegment[];
};

export const parseInfoSegment = (
	iterator: BufferIterator,
	length: number,
	onSimpleBlock: OnSimpleBlock,
): InfoSegment => {
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
		type: 'info-segment',
		length,
		children: children.segments as MatroskaSegment[],
	};
};
