import type {BufferIterator} from '../../buffer-iterator';
import type {TransportStreamStructure} from '../../parse-result';
import type {TransportStreamBox} from './boxes';
import {parsePat} from './parse-pat';
import {parsePes} from './parse-pes';
import {parsePmt} from './parse-pmt';
import {doesPesPacketFollow, parseStream} from './parse-stream-packet';
import {getProgramForId, getStreamForId} from './traversal';

export const parsePacket = (
	iterator: BufferIterator,
	structure: TransportStreamStructure,
): Promise<TransportStreamBox> => {
	const syncByte = iterator.getUint8();
	if (syncByte !== 0x47) {
		throw new Error('Invalid sync byte');
	}

	iterator.startReadingBits();
	iterator.getBits(1); // transport error indicator
	const payloadUnitStartIndicator = iterator.getBits(1);
	iterator.getBits(1); // transport priority
	const packetIdentifier = iterator.getBits(13);
	iterator.getBits(2); // transport scrambling control
	const adaptationFieldControl1 = iterator.getBits(1); // adaptation field control 1
	iterator.getBits(1); // adaptation field control 2
	iterator.getBits(4); // continuity counter
	iterator.stopReadingBits();
	if (adaptationFieldControl1 === 1) {
		iterator.startReadingBits();
		const adaptationFieldLength = iterator.getBits(8);
		const offset = iterator.counter.getOffset();
		iterator.getBits(1); // discontinuity indicator
		iterator.getBits(1); // random access indicator
		iterator.getBits(1); // elementary stream priority indicator
		iterator.getBits(1); // PCR flag
		iterator.getBits(1); // OPCR flag
		iterator.getBits(1); // splicing point flag
		iterator.getBits(1); // transport private data flag
		iterator.getBits(1); // adaptation field extension flag
		const remaining =
			adaptationFieldLength - (iterator.counter.getOffset() - offset);
		iterator.stopReadingBits();
		iterator.discard(Math.max(0, remaining));
	}

	const isPes = doesPesPacketFollow(iterator);
	if (isPes && payloadUnitStartIndicator === 1) {
		parsePes(iterator);
	} else if (payloadUnitStartIndicator === 1) {
		iterator.getUint8(); // pointerField
	}

	if (packetIdentifier === 0) {
		return Promise.resolve(parsePat(iterator));
	}

	const program = getProgramForId(structure, packetIdentifier);
	if (program) {
		const pmt = parsePmt(iterator);
		return Promise.resolve(pmt);
	}

	const stream = getStreamForId(structure, packetIdentifier);
	if (stream) {
		return Promise.resolve(parseStream(iterator));
	}

	throw new Error('Unknown packet identifier');
};
