import {padMatroskaBytes} from '../boxes/webm/make-header';

export const makeDurationWithPadding = (newDuration: number) => {
	return padMatroskaBytes(
		{
			type: 'Duration',
			value: {
				value: newDuration,
				size: '64',
			},
			minVintWidth: null,
		},
		100,
	);
};
