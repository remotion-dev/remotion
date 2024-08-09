import type {BufferIterator} from '../../buffer-iterator';

export interface AvccBox {
	type: 'avcc-box';
	data: Uint8Array;
	configurationString: string;
}

export const parseAvcc = ({
	data,
	size,
}: {
	data: BufferIterator;
	size: number;
}): AvccBox => {
	const confVersion = data.getUint8();
	if (confVersion !== 1) {
		throw new Error(`Unsupported AVCC version ${confVersion}`);
	}

	const profile = data.getUint8();
	const profileCompatibility = data.getUint8();
	const level = data.getUint8();

	const str = `${profile.toString(16).padStart(2, '0')}${profileCompatibility.toString(16).padStart(2, '0')}${level.toString(16).padStart(2, '0')}`;

	data.counter.decrement(4);

	return {
		type: 'avcc-box',
		data: data.getSlice(size - 8),
		configurationString: str,
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
