import {combineUint8Arrays} from '../../../../matroska/matroska-utils';
import {addSize, stringsToUint8Array} from '../../../primitives';

export const createDinf = () => {
	return addSize(
		combineUint8Arrays([
			stringsToUint8Array('dinf'),
			addSize(
				combineUint8Arrays([
					stringsToUint8Array('dref'),
					new Uint8Array([0]), // version
					new Uint8Array([0, 0, 0]), // flags
					new Uint8Array([0, 0, 0, 1]), // entry count
					addSize(
						combineUint8Arrays([
							stringsToUint8Array('url '),
							new Uint8Array([0]), // version
							new Uint8Array([0, 0, 1]), // flags
						]),
					),
				]),
			),
		]),
	);
};
