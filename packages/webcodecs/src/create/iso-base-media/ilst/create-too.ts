import {combineUint8Arrays} from '../../matroska/matroska-utils';
import {addSize, stringsToUint8Array} from '../primitives';

export const createToo = (value: string) => {
	return addSize(
		combineUint8Arrays([
			// type: ©too
			new Uint8Array([0xa9, 0x74, 0x6f, 0x6f]),
			// data
			addSize(
				combineUint8Arrays([
					// data
					new Uint8Array([0x64, 0x61, 0x74, 0x61]),
					// type indicator
					new Uint8Array([0, 0]),
					// well-known type
					new Uint8Array([0, 1]),
					// country indicator
					new Uint8Array([0, 0]),
					// language indicator
					new Uint8Array([0, 0]),
					// value
					stringsToUint8Array(value),
				]),
			),
		]),
	);
};
