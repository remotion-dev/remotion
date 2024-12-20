import type {BufferIterator} from '../../buffer-iterator';
import type {TransportStreamStructure} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import type {TransportStreamBox} from './boxes';
import type {NextPesHeaderStore} from './next-pes-header-store';
import {parsePat} from './parse-pat';
import {parsePes} from './parse-pes';
import {parsePmt} from './parse-pmt';
import {parseStream} from './parse-stream-packet';
import {type StreamBufferMap} from './process-stream-buffers';
import {getProgramForId, getStreamForId} from './traversal';

export const parsePacket = async ({
	iterator,
	structure,
	streamBuffers,
	parserState,
	nextPesHeaderStore,
}: {
	iterator: BufferIterator;
	structure: TransportStreamStructure;
	streamBuffers: StreamBufferMap;
	parserState: ParserState;
	nextPesHeaderStore: NextPesHeaderStore;
}): Promise<TransportStreamBox | null> => {
	const offset = iterator.counter.getOffset();
	const syncByte = iterator.getUint8();
	if (syncByte !== 0x47) {
		throw new Error('Invalid sync byte');
	}

	iterator.startReadingBits();
	iterator.getBits(1); // transport error indicator
	const payloadUnitStartIndicator = iterator.getBits(1);
	iterator.getBits(1); // transport priority
	const programId = iterator.getBits(13);
	iterator.getBits(2); // transport scrambling control
	const adaptationFieldControl1 = iterator.getBits(1); // adaptation field control 1
	iterator.getBits(1); // adaptation field control 2
	iterator.getBits(4); // continuity counter
	iterator.stopReadingBits();
	if (adaptationFieldControl1 === 1) {
		iterator.startReadingBits();
		const adaptationFieldLength = iterator.getBits(8);
		const headerOffset = iterator.counter.getOffset();
		if (adaptationFieldLength > 0) {
			iterator.getBits(1); // discontinuity indicator
			iterator.getBits(1); // random access indicator
			iterator.getBits(1); // elementary stream priority indicator
			iterator.getBits(1); // PCR flag
			iterator.getBits(1); // OPCR flag
			iterator.getBits(1); // splicing point flag
			iterator.getBits(1); // transport private data flag
			iterator.getBits(1); // adaptation field extension flag
		}

		const remaining =
			adaptationFieldLength - (iterator.counter.getOffset() - headerOffset);
		iterator.stopReadingBits();
		const toDiscard = Math.max(0, remaining);
		iterator.discard(toDiscard);
	}

	const read = iterator.counter.getOffset() - offset;
	if (read === 188) {
		return Promise.resolve(null);
	}

	const pat = structure.boxes.find(
		(b) => b.type === 'transport-stream-pmt-box',
	);
	const isPes =
		payloadUnitStartIndicator && pat?.streams.find((e) => e.pid === programId);

	if (isPes) {
		const packetPes = parsePes(iterator);
		nextPesHeaderStore.setNextPesHeader(packetPes);
	} else if (payloadUnitStartIndicator === 1) {
		iterator.getUint8(); // pointerField
	}

	if (programId === 0) {
		return Promise.resolve(parsePat(iterator));
	}

	const program = getProgramForId(structure, programId);
	if (program) {
		const pmt = parsePmt(iterator);
		return Promise.resolve(pmt);
	}

	const stream = getStreamForId(structure, programId);
	if (stream) {
		await parseStream({
			iterator,
			transportStreamEntry: stream,
			streamBuffers,
			nextPesHeader: nextPesHeaderStore.getNextPesHeader(),
			state: parserState,
			programId,
			structure,
		});
		return Promise.resolve(null);
	}

	throw new Error('Unknown packet identifier');
};
