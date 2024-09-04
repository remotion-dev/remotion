import {makeMatroskaBytes, padMatroskaBytes} from '../boxes/webm/make-header';
import type {MatroskaElement} from '../boxes/webm/segments/all-segments';

export type Seek = {
	hexString: MatroskaElement;
	byte: number;
};

export const createMatroskaSeekHead = (seeks: Seek[]) => {
	return padMatroskaBytes(
		makeMatroskaBytes({
			type: 'SeekHead',
			minVintWidth: 8,
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
