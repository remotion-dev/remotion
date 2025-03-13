import type {BufferIterator} from '../../buffer-iterator';

export interface MdhdBox {
	type: 'mdhd-box';
	version: number;
	timescale: number;
	duration: number;
	language: number;
	quality: number;
	creationTime: number | null;
	modificationTime: number | null;
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

	// flags, we discard them
	data.discard(3);

	// creation time
	const creationTime =
		version === 1 ? Number(data.getUint64()) : data.getUint32();

	// modification time
	const modificationTime =
		version === 1 ? Number(data.getUint64()) : data.getUint32();

	const timescale = data.getUint32();
	const duration = version === 1 ? data.getUint64() : data.getUint32();

	const language = data.getUint16();

	// quality
	const quality = data.getUint16();

	const remaining = size - (data.counter.getOffset() - fileOffset);
	if (remaining !== 0) {
		throw new Error(`Expected remaining bytes to be 0, got ${remaining}`);
	}

	return {
		type: 'mdhd-box',
		duration: Number(duration),
		timescale,
		version,
		language,
		quality,
		creationTime,
		modificationTime,
	};
};
