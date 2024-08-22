import {makeMatroskaBytes} from '../boxes/webm/make-header';

export const createMatroskaSegment = (info: Uint8Array) => {
	return makeMatroskaBytes({
		type: 'Segment',
		value: [info],
		minVintWidth: 8,
	});
};
