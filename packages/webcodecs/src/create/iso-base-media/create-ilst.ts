import {combineUint8Arrays} from '../matroska/matroska-utils';
import {addSize, stringsToUint8Array} from './primitives';

export const createIlst = (items: Uint8Array[]) => {
	return addSize(
		combineUint8Arrays([
			// name
			stringsToUint8Array('ilst'),
			// items
			...items,
		]),
	);
};
