import {combineUint8Arrays} from '../../matroska/matroska-utils';
import {addSize, stringsToUint8Array} from '../primitives';

export const createCmt = (comment: string) => {
	return addSize(
		combineUint8Arrays([
			// ©cmt
			new Uint8Array([0xa9, 0x63, 0x6d, 0x74]),
			addSize(
				combineUint8Arrays([
					// data
					stringsToUint8Array('data'),
					// type indicator
					new Uint8Array([0, 0]),
					// well-known type
					new Uint8Array([0, 1]),
					// country indicator
					new Uint8Array([0, 0]),
					// language indicator
					new Uint8Array([0, 0]),
					// value
					stringsToUint8Array(comment),
				]),
			),
		]),
	);
};
