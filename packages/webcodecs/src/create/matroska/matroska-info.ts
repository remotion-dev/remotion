import {makeDurationWithPadding} from './make-duration-with-padding';
import {makeMatroskaBytes} from './matroska-utils';

export const makeMatroskaInfo = ({timescale}: {timescale: number}) => {
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
				value: '@remotion/webcodecs',
				minVintWidth: null,
			},
			{
				type: 'WritingApp',
				value: '@remotion/webcodecs',
				minVintWidth: null,
			},
			makeDurationWithPadding(0),
		],
		minVintWidth: null,
	});
};
