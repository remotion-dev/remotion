import {combineUint8Arrays} from '../matroska/matroska-utils';
import {addSize, stringsToUint8Array} from './primitives';

// TODO: Not used in creation of MP4 yet
export const createColr = ({
	fullRange,
	matrixIndex,
	primaries,
	transferFunction,
}: {
	fullRange: boolean;
	matrixIndex: number;
	primaries: number;
	transferFunction: number;
}) => {
	return addSize(
		combineUint8Arrays([
			// type
			stringsToUint8Array('colr'),
			// colour_type
			stringsToUint8Array('nclx'),
			// primaries
			// 1 = 'ITU-R BT.7090
			new Uint8Array([0, primaries]),
			// transfer_function
			// 1 = 'ITU-R BT.7090
			new Uint8Array([0, transferFunction]),
			// matrix_index
			// 1 = 'ITU-R BT.7090
			new Uint8Array([0, matrixIndex]),
			// full_range_flag
			new Uint8Array([fullRange ? 1 : 0]),
		]),
	);
};
