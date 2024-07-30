import type {BufferIterator} from '../../../buffer-iterator';
import type {MatroskaSegment} from '../segments';
import {expectChildren} from './parse-children';

export type InfoSegment = {
	type: 'info-segment';
	length: number;
	children: MatroskaSegment[];
};

export const parseInfoSegment = (iterator: BufferIterator): InfoSegment => {
	const length = iterator.getVint();
	const children = expectChildren(iterator, length);

	return {
		type: 'info-segment',
		length,
		children,
	};
};
