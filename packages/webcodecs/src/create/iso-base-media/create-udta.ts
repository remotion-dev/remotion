import {combineUint8Arrays} from '../matroska/matroska-utils';
import {addSize, stringsToUint8Array} from './primitives';

export const createUdta = (children: Uint8Array) => {
	return addSize(
		combineUint8Arrays([
			// type
			stringsToUint8Array('udta'),
			// children
			children,
		]),
	);
};
