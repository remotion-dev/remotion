import {combineUint8Arrays} from '../../../../boxes/webm/make-header';
import {addSize} from '../../primitives';

export const createMinf = ({
	vmhdAtom,
	stblAtom,
}: {
	vmhdAtom: Uint8Array;
	stblAtom: Uint8Array;
}) => {
	return addSize(combineUint8Arrays([vmhdAtom, stblAtom]));
};
