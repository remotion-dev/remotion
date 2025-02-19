import {combineUint8Arrays} from '../../../../matroska/matroska-utils';
import {addSize, stringsToUint8Array} from '../../../primitives';

export const createVmhd = () => {
	return addSize(
		combineUint8Arrays([
			// type
			stringsToUint8Array('vmhd'),
			// version
			new Uint8Array([0]),
			// flags
			new Uint8Array([0, 0, 1]),
			// graphics mode, 0 = copy
			new Uint8Array([0, 0]),
			// opcolor
			new Uint8Array([0, 0, 0, 0, 0, 0]),
		]),
	);
};
