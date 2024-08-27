import {makeMatroskaBytes} from '../boxes/webm/make-header';
import type {BytesAndOffset} from '../boxes/webm/segments/all-segments';

export const createMatroskaSegment = (children: BytesAndOffset[]) => {
	return makeMatroskaBytes({
		type: 'Segment',
		value: children,
		minVintWidth: 8,
	});
};
