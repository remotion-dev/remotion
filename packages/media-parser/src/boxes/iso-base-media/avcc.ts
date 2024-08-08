import type {BufferIterator} from '../../buffer-iterator';

export interface AvccBox {
	type: 'avcc-box';
	data: Uint8Array;
}

export const parseAvcc = ({
	data,
	size,
}: {
	data: BufferIterator;
	size: number;
}): AvccBox => {
	return {
		type: 'avcc-box',
		data: data.getSlice(size - 8),
	};
};

export interface HvccBox {
	type: 'hvcc-box';
	data: Uint8Array;
}

export const parseHvcc = ({
	data,
	size,
}: {
	data: BufferIterator;
	size: number;
}): HvccBox => {
	return {
		type: 'hvcc-box',
		data: data.getSlice(size - 8),
	};
};
