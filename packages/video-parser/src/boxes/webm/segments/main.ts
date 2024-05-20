import type {BufferIterator} from '../../../read-and-increment-offset';
import {expectSegment, type MatroskaSegment} from '../segments';

export type MainSegment = {
	type: 'main-segment';
	children: MatroskaSegment[];
};

export const parseMainSegment = (iterator: BufferIterator): MainSegment => {
	iterator.getVint(8);

	const children = expectSegment(iterator);

	return {
		type: 'main-segment',
		children: [children],
	};
};
