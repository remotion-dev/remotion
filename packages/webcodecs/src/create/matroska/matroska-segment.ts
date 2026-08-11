import type {BytesAndOffset} from './matroska-utils';
import {makeMatroskaBytes} from './matroska-utils';

export const MATROSKA_SEGMENT_MIN_VINT_WIDTH = 8;

export const createMatroskaSegment = (children: BytesAndOffset[]) => {
	return makeMatroskaBytes({
		type: 'Segment',
		value: children,
		minVintWidth: MATROSKA_SEGMENT_MIN_VINT_WIDTH,
	});
};
