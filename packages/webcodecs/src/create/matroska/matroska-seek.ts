import type {MatroskaElement} from '@remotion/media-parser';
import {makeMatroskaBytes, padMatroskaBytes} from './matroska-utils';

export type Seek = {
	hexString: MatroskaElement;
	byte: number;
};

export const createMatroskaSeekHead = (seeks: Seek[]) => {
	return padMatroskaBytes(
		makeMatroskaBytes({
			type: 'SeekHead',
			minVintWidth: null,
			value: seeks.map((seek) => {
				return {
					type: 'Seek',
					minVintWidth: null,
					value: [
						{
							type: 'SeekID',
							minVintWidth: null,
							value: seek.hexString,
						},
						{
							type: 'SeekPosition',
							minVintWidth: null,
							value: {
								value: seek.byte,
								byteLength: null,
							},
						},
					],
				};
			}),
		}),
		200,
	);
};
