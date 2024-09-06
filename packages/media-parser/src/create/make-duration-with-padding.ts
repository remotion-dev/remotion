import {makeMatroskaBytes} from '../boxes/webm/make-header';

export const makeDurationWithPadding = (newDuration: number) => {
	return makeMatroskaBytes({
		type: 'Duration',
		value: {
			value: newDuration,
			size: '64',
		},
		minVintWidth: 8,
	});
};
