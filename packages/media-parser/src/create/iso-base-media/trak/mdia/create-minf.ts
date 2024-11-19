import {combineUint8Arrays} from '../../../../boxes/webm/make-header';
import {addSize, stringsToUint8Array} from '../../primitives';
import {createDinf} from './minf/create-dinf';

export const createMinf = ({
	vmhdAtom,
	stblAtom,
}: {
	vmhdAtom: Uint8Array;
	stblAtom: Uint8Array;
}) => {
	return addSize(
		combineUint8Arrays([
			// type
			stringsToUint8Array('minf'),
			// vmhd
			vmhdAtom,
			// dinf
			createDinf(),
			// stbl
			stblAtom,
		]),
	);
};
