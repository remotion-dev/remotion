import {combineUint8Arrays} from '../../boxes/webm/make-header';
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
