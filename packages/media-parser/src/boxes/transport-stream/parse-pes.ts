import type {BufferIterator} from '../../buffer-iterator';

export type PacketPes = {
	streamId: number;
	dts: number | null;
	pts: number;
	priority: number;
};

export const parsePes = (iterator: BufferIterator) => {
	const ident = iterator.getUint24();
	if (ident !== 0x000001) {
		throw new Error(`Unexpected PES packet start code: ${ident.toString(16)}`);
	}

	const streamId = iterator.getUint8();
	iterator.getUint16(); // PES packet length, is most of the time 0, so useless
	iterator.startReadingBits();
	const markerBits = iterator.getBits(2);
	if (markerBits !== 0b10) {
		throw new Error(`Invalid marker bits: ${markerBits}`);
	}

	const scrambled = iterator.getBits(2);
	if (scrambled !== 0b00) {
		throw new Error(`Only supporting non-scrambled streams`);
	}

	const priority = iterator.getBits(1);
	iterator.getBits(1); // data alignment indicator
	iterator.getBits(1); // copy right
	iterator.getBits(1); // original or copy
	const ptsPresent = iterator.getBits(1);
	const dtsPresent = iterator.getBits(1);
	if (!ptsPresent && dtsPresent) {
		throw new Error(
			`DTS is present but not PTS, this is not allowed in the spec`,
		);
	}

	iterator.getBits(1); // escr flag
	iterator.getBits(1); // es rate flag
	iterator.getBits(1); // dsm trick mode flag
	iterator.getBits(1); // additional copy info flag
	iterator.getBits(1); // crc flag
	iterator.getBits(1); // extension flag
	const pesHeaderLength = iterator.getBits(8);
	const offset = iterator.counter.getOffset();
	let pts: number | null = null;
	if (!ptsPresent) {
		throw new Error(`PTS is required`);
	}

	const fourBits = iterator.getBits(4);
	if (fourBits !== 0b0011 && fourBits !== 0b0010) {
		throw new Error(`Invalid PTS marker bits: ${fourBits}`);
	}

	const pts1 = iterator.getBits(3);
	iterator.getBits(1); // marker bit
	const pts2 = iterator.getBits(15);
	iterator.getBits(1); // marker bit
	const pts3 = iterator.getBits(15);
	iterator.getBits(1); // marker bit
	pts = (pts1 << 30) | (pts2 << 15) | pts3;

	let dts: number | null = null;
	if (dtsPresent) {
		const _fourBits = iterator.getBits(4);
		if (_fourBits !== 0b0001) {
			throw new Error(`Invalid DTS marker bits: ${_fourBits}`);
		}

		const dts1 = iterator.getBits(3);
		iterator.getBits(1); // marker bit
		const dts2 = iterator.getBits(15);
		iterator.getBits(1); // marker bit
		const dts3 = iterator.getBits(15);
		iterator.getBits(1); // marker bit
		dts = (dts1 << 30) | (dts2 << 15) | dts3;
	}

	iterator.stopReadingBits();
	iterator.discard(pesHeaderLength - (iterator.counter.getOffset() - offset));

	const packet: PacketPes = {
		dts,
		pts,
		streamId,
		priority,
	};
	return packet;
};
