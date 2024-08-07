import type {BufferIterator} from '../../../buffer-iterator';
import type {BaseBox} from '../base-type';

export interface StszBox extends BaseBox {
	type: 'stsz-box';
}

export const parseStsz = ({
	iterator,
	offset,
	size,
}: {
	iterator: BufferIterator;
	offset: number;
	size: number;
}): StszBox => {
	iterator.discard(size - (iterator.counter.getOffset() - offset));

	return {
		type: 'stsz-box',
		boxSize: size,
		offset,
	};
};
