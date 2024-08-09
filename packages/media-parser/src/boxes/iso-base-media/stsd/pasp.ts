import type {BufferIterator} from '../../../buffer-iterator';
import type {BaseBox} from '../base-type';

export interface PaspBox extends BaseBox {
	type: 'pasp-box';
	hSpacing: number;
	vSpacing: number;
}

export const parsePasp = ({
	iterator,
	offset,
	size,
}: {
	iterator: BufferIterator;
	offset: number;
	size: number;
}): PaspBox => {
	const hSpacing = iterator.getUint32();
	const vSpacing = iterator.getUint32();

	const bytesRemainingInBox = size - (iterator.counter.getOffset() - offset);
	iterator.discard(bytesRemainingInBox);

	return {
		type: 'pasp-box',
		boxSize: size,
		offset,
		hSpacing,
		vSpacing,
	};
};
