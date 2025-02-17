import {combineUint8Arrays} from '../../combine-uint8-arrays';
import type {TransportStreamStructure} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {readAdtsHeader} from './adts-header';
import {getRestOfPacket} from './discard-rest-of-packet';
import {findNextSeparator} from './find-separator';
import type {TransportStreamEntry} from './parse-pmt';
import {processStreamBuffer} from './process-stream-buffers';

const parseAdtsStream = async ({
	transportStreamEntry,
	state,
	structure,
	offset,
}: {
	transportStreamEntry: TransportStreamEntry;
	structure: TransportStreamStructure;
	state: ParserState;
	offset: number;
}) => {
	const {streamBuffers, nextPesHeaderStore: nextPesHeader} =
		state.transportStream;

	while (true) {
		const streamBuffer = streamBuffers.get(transportStreamEntry.pid);
		if (!streamBuffer) {
			throw new Error('Stream buffer not found');
		}

		const expectedLength =
			readAdtsHeader(streamBuffer.buffer)?.frameLength ?? null;

		if (expectedLength === null) {
			break;
		}

		if (expectedLength > streamBuffer.buffer.length) {
			break;
		}

		await processStreamBuffer({
			streamBuffer: {
				buffer: streamBuffer.buffer.slice(0, expectedLength),
				offset,
				pesHeader: streamBuffer.pesHeader,
			},
			programId: transportStreamEntry.pid,
			state,
			structure,
		});

		const rest = streamBuffer.buffer.slice(expectedLength);
		streamBuffers.set(transportStreamEntry.pid, {
			buffer: rest,
			pesHeader: nextPesHeader.getNextPesHeader(),
			offset,
		});
	}
};

const parseAvcStream = async ({
	restOfPacket,
	transportStreamEntry,
	programId,
	state,
	structure,
	offset,
}: {
	restOfPacket: Uint8Array;
	transportStreamEntry: TransportStreamEntry;
	programId: number;
	state: ParserState;
	structure: TransportStreamStructure;
	offset: number;
}) => {
	const indexOfSeparator = findNextSeparator(
		restOfPacket,
		transportStreamEntry,
	);
	const {streamBuffers, nextPesHeaderStore: nextPesHeader} =
		state.transportStream;

	const streamBuffer = streamBuffers.get(transportStreamEntry.pid);

	if (indexOfSeparator === -1) {
		if (streamBuffer) {
			streamBuffer.buffer = combineUint8Arrays([
				streamBuffer.buffer,
				restOfPacket,
			]);
			return;
		}

		streamBuffers.set(programId, {
			pesHeader: nextPesHeader.getNextPesHeader(),
			buffer: restOfPacket,
			offset,
		});

		return;
	}

	if (streamBuffer) {
		const packet = restOfPacket.slice(0, indexOfSeparator);
		streamBuffer.buffer = combineUint8Arrays([streamBuffer.buffer, packet]);
		await processStreamBuffer({
			state,
			streamBuffer,
			programId,
			structure,
		});
		const rest = restOfPacket.slice(indexOfSeparator);
		streamBuffers.set(programId, {
			pesHeader: nextPesHeader.getNextPesHeader(),
			buffer: rest,
			offset,
		});
		return;
	}

	if (indexOfSeparator !== 0) {
		throw new Error(
			'No stream buffer found but new separator is not at the beginning',
		);
	}

	streamBuffers.set(programId, {
		pesHeader: nextPesHeader.getNextPesHeader(),
		buffer: restOfPacket.slice(indexOfSeparator),
		offset,
	});
};

export const parseStream = ({
	transportStreamEntry,
	state,
	programId,
	structure,
}: {
	transportStreamEntry: TransportStreamEntry;
	state: ParserState;
	programId: number;
	structure: TransportStreamStructure;
}): Promise<void> => {
	const {iterator} = state;
	const restOfPacket = getRestOfPacket(iterator);
	const offset = iterator.counter.getOffset();

	if (transportStreamEntry.streamType === 27) {
		return parseAvcStream({
			restOfPacket,
			transportStreamEntry,
			state,
			programId,
			structure,
			offset,
		});
	}

	if (transportStreamEntry.streamType === 15) {
		const {streamBuffers, nextPesHeaderStore: nextPesHeader} =
			state.transportStream;
		const streamBuffer = streamBuffers.get(transportStreamEntry.pid);
		if (!streamBuffer) {
			streamBuffers.set(transportStreamEntry.pid, {
				buffer: restOfPacket,
				pesHeader: nextPesHeader.getNextPesHeader(),
				offset,
			});
		} else {
			streamBuffer.buffer = combineUint8Arrays([
				streamBuffer.buffer,
				restOfPacket,
			]);
		}

		return parseAdtsStream({
			transportStreamEntry,
			state,
			structure,
			offset,
		});
	}

	throw new Error(`Unsupported stream type ${transportStreamEntry.streamType}`);
};
