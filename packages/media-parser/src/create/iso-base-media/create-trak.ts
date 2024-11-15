import {combineUint8Arrays} from '../../boxes/webm/make-header';
import {addSize, stringsToUint8Array} from './primitives';

export const createTrak = ({
	tkhd,
	mdia,
}: {
	tkhd: Uint8Array;
	mdia: Uint8Array;
}) => {
	return addSize(
		combineUint8Arrays([
			// name
			stringsToUint8Array('trak'),
			// tkhd
			tkhd,
			// mdia
			mdia,
		]),
	);
};
