import {makeMatroskaBytes} from '../boxes/webm/make-header';

export const makeMatroskaInfo = ({
	timescale,
	duration,
}: {
	timescale: number;
	duration: number;
}) => {
	return makeMatroskaBytes({
		type: 'Info',
		value: [
			{
				type: 'TimestampScale',
				value: {
					value: timescale,
					byteLength: null,
				},
				minVintWidth: null,
			},
			{
				type: 'MuxingApp',
				value: '@remotion/media-parser',
				minVintWidth: null,
			},
			{
				type: 'WritingApp',
				value: '@remotion/media-parser',
				minVintWidth: null,
			},
			{
				type: 'Duration',
				value: {
					value: duration,
					size: '64',
				},
				minVintWidth: null,
			},
		],
		minVintWidth: null,
	});
};
