import type {BufferIterator} from '../../../buffer-iterator';
import type {AnySegment} from '../../../parse-result';

export interface MdatBox {
	type: 'mdat-box';
	boxSize: number;
}

export const parseMdat = ({
	data,
	size,
	fileOffset,
}: {
	data: BufferIterator;
	size: number;
	fileOffset: number;
	existingBoxes: AnySegment[];
}): MdatBox => {
	// TODO: Do something cool with it
	// 	const tracks = getTracks(existingBoxes);
	data.discard(size - (data.counter.getOffset() - fileOffset));

	return {
		type: 'mdat-box',
		boxSize: size,
	};
};
