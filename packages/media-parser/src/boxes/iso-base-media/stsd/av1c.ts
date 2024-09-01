import type {BufferIterator} from '../../../buffer-iterator';

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
	return {
		type: 'av1C-box',
		privateData: data.getSlice(size - 8),
	};
};
