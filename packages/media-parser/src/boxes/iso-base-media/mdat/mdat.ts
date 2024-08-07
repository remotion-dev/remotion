import type {BufferIterator} from '../../../buffer-iterator';

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
}): MdatBox => {
	data.discard(size - (data.counter.getOffset() - fileOffset));

	return {
		type: 'mdat-box',
		boxSize: size,
	};
};
