import {makeMatroskaBytes, padMatroskaBytes} from '../boxes/webm/make-header';

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
			...padMatroskaBytes(
				{
					type: 'Duration',
					value: {
						value: duration,
						size: '64',
					},
					minVintWidth: null,
				},
				// TODO: That's too much padding
				1000,
			),
		],
		minVintWidth: null,
	});
};
