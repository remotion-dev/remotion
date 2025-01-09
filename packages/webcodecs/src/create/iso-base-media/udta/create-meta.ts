import {combineUint8Arrays} from '../../matroska/matroska-utils';
import {addSize, stringsToUint8Array} from '../primitives';

export const createMeta = ({
	hdlr,
	ilst,
}: {
	hdlr: Uint8Array;
	ilst: Uint8Array;
}) => {
	return addSize(
		combineUint8Arrays([
			// type
			stringsToUint8Array('meta'),
			// version
			new Uint8Array([0]),
			// flags
			new Uint8Array([0, 0, 0]),
			// hdlr
			hdlr,
			// ilst
			ilst,
		]),
	);
};
