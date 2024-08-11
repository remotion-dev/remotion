import type {BufferIterator} from '../../../buffer-iterator';

type Av1Packet = {
	type: 'av1-packet';
	discarded: boolean;
};

export const av1Bitstream = (stream: BufferIterator, length: number) => {
	const address = stream.counter.getOffset();

	const firstByte = stream.getUint8();
	// log this to understand:
	// (firstByte.toString(2).padStart(8, '0'));

	// get bit 0
	const obuForbiddenBit = (firstByte >> 7) & 1;
	// get bits 1-3
	const obuType = (firstByte >> 3) & 0b1111;
	// get bit 4
	const obuExtensionFlag = (firstByte >> 2) & 1;
	// get bit 5
	const obuHasSizeField = (firstByte >> 1) & 1;
	const reservedBit = (firstByte >> 0) & 1;

	let size: number | null = null;

	if (obuExtensionFlag) {
		// extension
		stream.getUint8();
	}

	if (obuHasSizeField) {
		// size
		size = stream.leb128();
	}

	console.log(
		address.toString(16),
		firstByte.toString(2).padStart(8, '0'),
		obuForbiddenBit,
		obuType,
		obuExtensionFlag,
		obuHasSizeField,
		reservedBit,
		size,
	);

	if (size === null) {
		return {
			type: 'av1-packet',
			discarded: false,
		};
	}

	const end = stream.counter.getOffset();
	const remaining = (size === null ? length : size + 2) - (end - address);
	stream.discard(remaining);
	const remainingNow = length - (stream.counter.getOffset() - address);
	if (remainingNow > 0 && remainingNow <= 2) {
		stream.discard(remainingNow);
	}

	return {
		type: 'av1-packet',
		discarded: Boolean(size),
		remainingNow,
	};
};
