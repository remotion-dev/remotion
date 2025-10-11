import {combineUint8Arrays} from '../matroska/matroska-utils';
import {addSize, stringsToUint8Array} from './primitives';

export const createMoov = ({
	mvhd,
	traks,
	udta,
}: {
	mvhd: Uint8Array;
	traks: Uint8Array[];
	udta: Uint8Array;
}) => {
	return addSize(
		combineUint8Arrays([
			// type
			stringsToUint8Array('moov'),
			// moov atom
			mvhd,
			// traks
			...traks,
			// udta
			udta,
		]),
	);
};
