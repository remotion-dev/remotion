import type {BufferIterator} from '../../../buffer-iterator';
import type {MatroskaSegment} from '../segments';
import {expectChildren} from './parse-children';

export type TracksSegment = {
	type: 'tracks-segment';
	children: MatroskaSegment[];
};

export const parseTracksSegment = (iterator: BufferIterator): TracksSegment => {
	const length = iterator.getVint(1);

	return {
		type: 'tracks-segment',
		children: expectChildren(iterator, length),
	};
};
