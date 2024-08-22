import {makeMatroskaBytes} from '../boxes/webm/make-header';

export const createMatroskaSegment = (children: Uint8Array[]) => {
	return makeMatroskaBytes({
		type: 'Segment',
		value: children,
		minVintWidth: 8,
	});
};
