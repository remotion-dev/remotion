import type {ParserState} from '../../state/parser-state';
import type {TransportStreamBox} from './boxes';
import {parsePat, parseSdt} from './parse-pat';
import {parsePes} from './parse-pes';
import {parsePmt} from './parse-pmt';
import {parseStream} from './parse-stream-packet';
import {getProgramForId, getStreamForId} from './traversal';

export const parsePacket = async ({
	parserState,
}: {
	parserState: ParserState;
}): Promise<TransportStreamBox | null> => {
	const {iterator} = parserState;
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

	const structure = parserState.getTsStructure();

	const pat = structure.boxes.find(
		(b) => b.type === 'transport-stream-pmt-box',
	);
	const isPes =
		payloadUnitStartIndicator && pat?.streams.find((e) => e.pid === programId);

	if (isPes) {
		const packetPes = parsePes(iterator);
		parserState.transportStream.nextPesHeaderStore.setNextPesHeader(packetPes);
	} else if (payloadUnitStartIndicator === 1) {
		iterator.getUint8(); // pointerField
	}

	if (programId === 0) {
		return Promise.resolve(parsePat(iterator));
	}

	if (programId === 17) {
		return Promise.resolve(parseSdt(iterator));
	}

	// PID 17 is SDT
	// https://de.wikipedia.org/wiki/MPEG-Transportstrom
	// Die Service Description Table nennt den Programmnamen (z. B. „ZDF“) und gibt weitere Informationen der einzelnen Programme (Services); sie wird auf PID 17 übertragen.
	const program =
		programId === 17 ? null : getProgramForId(structure, programId);
	if (program) {
		const pmt = parsePmt(iterator);
		return Promise.resolve(pmt);
	}

	const stream = getStreamForId(structure, programId);
	if (stream) {
		await parseStream({
			transportStreamEntry: stream,
			state: parserState,
			programId,
			structure,
		});
		return Promise.resolve(null);
	}

	throw new Error('Unknown packet identifier');
};
