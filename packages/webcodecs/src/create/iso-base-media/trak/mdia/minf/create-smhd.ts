import {combineUint8Arrays} from '../../../../matroska/matroska-utils';
import {addSize, stringsToUint8Array} from '../../../primitives';

export const createSmhd = () => {
	return addSize(
		combineUint8Arrays([
			// type
			stringsToUint8Array('smhd'),
			// version
			new Uint8Array([0]),
			// flags
			new Uint8Array([0, 0, 0]),
			// balance
			new Uint8Array([0, 0]),
			// reserved
			new Uint8Array([0, 0]),
		]),
	);
};
