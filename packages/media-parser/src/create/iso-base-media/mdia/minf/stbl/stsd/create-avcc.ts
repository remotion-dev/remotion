import {combineUint8Arrays} from '../../../../../../boxes/webm/make-header';
import {addSize, stringsToUint8Array} from '../../../../primitives';

export const createAvccBox = (privateData: Uint8Array) => {
	return addSize(
		combineUint8Arrays([
			// type
			stringsToUint8Array('avcC'),
			privateData,
		]),
	);
};
