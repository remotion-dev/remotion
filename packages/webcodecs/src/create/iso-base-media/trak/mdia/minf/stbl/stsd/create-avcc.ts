import {combineUint8Arrays} from '../../../../../../matroska/matroska-utils';
import {addSize, stringsToUint8Array} from '../../../../../primitives';

export const createAvccBox = (privateData: Uint8Array | null) => {
	if (!privateData) {
		throw new Error('privateData is required');
	}

	return addSize(
		combineUint8Arrays([
			// type
			stringsToUint8Array('avcC'),
			privateData,
		]),
	);
};
