import type {BufferIterator} from '../../../buffer-iterator';
import {
	parseAv1BitstreamHeaderSegment,
	type Av1BitstreamHeaderSegment,
} from './av1/header-segment';

type Av1BitstreamUimplementedSegment = {
	type: 'av1-bitstream-unimplemented';
};

export type Av1BitstreamSegment =
	| Av1BitstreamHeaderSegment
	| Av1BitstreamUimplementedSegment;

export const av1Bitstream = (
	stream: BufferIterator,
	length: number,
): {
	discarded: boolean;
	segment: Av1BitstreamSegment;
} => {
	const address = stream.counter.getOffset();

	stream.startReadingBits();

	// log this to understand:
	// (firstByte.toString(2).padStart(8, '0'));

	// get bit 0
	const obuForbiddenBit = stream.getBits(1);
	if (obuForbiddenBit) {
		throw new Error('obuForbiddenBit is not 0');
	}

	// get bits 1-3
	const obuType = stream.getBits(4);

	// get bit 4
	const obuExtensionFlag = stream.getBits(1);
	// get bit 5
	const obuHasSizeField = stream.getBits(1);
	// reserved bit
	stream.getBits(1);

	let size: number | null = null;

	if (obuExtensionFlag) {
		// extension
		stream.getBits(6);
	}

	if (obuHasSizeField) {
		// size
		size = stream.leb128();
	}

	/*
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
	*/

	const segment: Av1BitstreamSegment =
		obuType === 1
			? parseAv1BitstreamHeaderSegment(stream)
			: {
					type: 'av1-bitstream-unimplemented',
				};

	stream.stopReadingBits();

	if (size === null) {
		return {
			discarded: false,
			segment,
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
		discarded: Boolean(size),
		segment,
	};
};
