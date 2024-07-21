import type {BufferIterator} from '../../../buffer-iterator';
import {type MatroskaSegment} from '../segments';
import {expectChildren} from './parse-children';

export type MainSegment = {
	type: 'main-segment';
	children: MatroskaSegment[];
};

export const parseMainSegment = (iterator: BufferIterator): MainSegment => {
	const length = iterator.getVint(8);

	const children = expectChildren(iterator, length);

	return {
		type: 'main-segment',
		children,
	};
};
