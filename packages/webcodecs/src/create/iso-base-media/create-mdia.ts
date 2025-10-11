import {combineUint8Arrays} from '../matroska/matroska-utils';
import {addSize, stringsToUint8Array} from './primitives';

export const createMdia = ({
	mdhd,
	hdlr,
	minf,
}: {
	mdhd: Uint8Array;
	hdlr: Uint8Array;
	minf: Uint8Array;
}) => {
	return addSize(
		combineUint8Arrays([
			// type
			stringsToUint8Array('mdia'),
			// mdhd
			mdhd,
			// hdlr
			hdlr,
			// minf
			minf,
		]),
	);
};
