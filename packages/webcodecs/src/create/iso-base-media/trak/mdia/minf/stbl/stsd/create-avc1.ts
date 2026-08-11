import {combineUint8Arrays} from '../../../../../../matroska/matroska-utils';
import {addSize, stringsToUint8Array} from '../../../../../primitives';

export const createStsdData = (codecSpecificData: Uint8Array) => {
	return addSize(
		combineUint8Arrays([
			// type
			stringsToUint8Array('stsd'),
			// version
			new Uint8Array([0]),
			// flags
			new Uint8Array([0, 0, 0]),
			// entry count
			new Uint8Array([0, 0, 0, 1]),
			// entry
			codecSpecificData,
		]),
	);
};
