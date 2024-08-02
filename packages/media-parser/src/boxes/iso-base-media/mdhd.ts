import type {BufferIterator} from '../../buffer-iterator';

export interface MdhdBox {
	type: 'mdhd-box';
	version: number;
	timescale: number;
	duration: number;
	language: number;
	quality: number;
}

export const parseMdhd = ({
	data,
	size,
	fileOffset,
}: {
	data: BufferIterator;
	size: number;
	fileOffset: number;
}): MdhdBox => {
	const version = data.getUint8();
	if (version !== 0) {
		throw new Error(`Unsupported MDHD version ${version}`);
	}

	// flags, we discard them
	data.discard(3);

	// creation time
	data.discard(4);

	// modification time
	data.discard(4);

	const timescale = data.getUint32();
	const duration = data.getUint32();

	const language = data.getUint16();

	// quality
	const quality = data.getUint16();

	const remaining = size - (data.counter.getOffset() - fileOffset);
	if (remaining !== 0) {
		throw new Error(`Expected remaining bytes to be 0, got ${remaining}`);
	}

	return {
		type: 'mdhd-box',
		duration,
		timescale,
		version,
		language,
		quality,
	};
};
