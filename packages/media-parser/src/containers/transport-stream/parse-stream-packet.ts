import {combineUint8Arrays} from '../../combine-uint8-arrays';
import type {TransportStreamStructure} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {readAdtsHeader} from './adts-header';
import {getRestOfPacket} from './discard-rest-of-packet';
import {findNextSeparator} from './find-separator';
import type {TransportStreamEntry} from './parse-pmt';
import {processStreamBuffer} from './process-stream-buffers';

const parseAdtsStream = async ({
	restOfPacket,
	transportStreamEntry,
	state,
	structure,
	offset,
}: {
	restOfPacket: Uint8Array;
	transportStreamEntry: TransportStreamEntry;
	structure: TransportStreamStructure;
	state: ParserState;
	offset: number;
}) => {
	const {streamBuffers, nextPesHeaderStore: nextPesHeader} =
		state.transportStream;
	const streamBuffer = streamBuffers.get(transportStreamEntry.pid);
	if (!streamBuffer) {
		streamBuffers.set(transportStreamEntry.pid, {
			buffer: restOfPacket,
			pesHeader: nextPesHeader.getNextPesHeader(),
			offset,
		});

		return;
	}

	const expectedLength =
		readAdtsHeader(streamBuffer.buffer)?.frameLength ?? null;

	const bytesToTake = expectedLength
		? Math.min(
				restOfPacket.length,
				expectedLength - streamBuffer.buffer.byteLength,
			)
		: restOfPacket.length;

	streamBuffer.buffer = combineUint8Arrays([
		streamBuffer.buffer,
		restOfPacket.slice(0, bytesToTake),
	]);
	if (expectedLength === streamBuffer.buffer.byteLength) {
		await processStreamBuffer({
			streamBuffer,
			programId: transportStreamEntry.pid,
			state,
			structure,
		});

		const rest = restOfPacket.slice(bytesToTake);
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
	if (transportStreamEntry.streamType === 27) {
		return parseAvcStream({
			restOfPacket,
			transportStreamEntry,
			state,
			programId,
			structure,
			offset: iterator.counter.getOffset(),
		});
	}

	if (transportStreamEntry.streamType === 15) {
		return parseAdtsStream({
			restOfPacket,
			transportStreamEntry,
			state,
			structure,
			offset: iterator.counter.getOffset(),
		});
	}

	throw new Error(`Unsupported stream type ${transportStreamEntry.streamType}`);
};
