import type {BufferIterator} from '../../../iterator/buffer-iterator';

export interface Av1CBox {
	type: 'av1C-box';
	privateData: Uint8Array;
}

export const parseAv1C = ({
	data,
	size,
}: {
	data: BufferIterator;
	size: number;
}): Av1CBox => {
	if (size < 8) {
		throw new Error(`Expected av1C box to be at least 8 bytes, got ${size}`);
	}

	return {
		type: 'av1C-box',
		privateData: data.getSlice(size - 8),
	};
};
