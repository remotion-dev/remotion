import type {BufferIterator} from '../../buffer-iterator';
import type {TransportStreamStructure} from '../../parse-result';
import type {ParserContext} from '../../parser-context';
import {combineUint8Arrays} from '../webm/make-header';
import {getRestOfPacket} from './discard-rest-of-packet';
import {findNextSeparator} from './find-separator';
import type {PacketPes} from './parse-pes';
import type {TransportStreamEntry} from './parse-pmt';
import {
	processStreamBuffer,
	type StreamBufferMap,
} from './process-stream-buffers';

export const doesPesPacketFollow = (iterator: BufferIterator) => {
	const assertion = iterator.getUint24() === 0x000001;
	iterator.counter.decrement(3);
	return assertion;
};

export const parseStream = async ({
	iterator,
	transportStreamEntry,
	streamBuffers,
	parserContext,
	programId,
	structure,
	nextPesHeader,
}: {
	iterator: BufferIterator;
	transportStreamEntry: TransportStreamEntry;
	streamBuffers: StreamBufferMap;
	parserContext: ParserContext;
	programId: number;
	structure: TransportStreamStructure;
	nextPesHeader: PacketPes;
}): Promise<void> => {
	const restOfPacket = getRestOfPacket(iterator);
	const streamBuffer = streamBuffers.get(transportStreamEntry.pid);
	let indexOfSeparator = findNextSeparator(restOfPacket, transportStreamEntry);

	while (indexOfSeparator > 0 && restOfPacket[indexOfSeparator - 1] === 0) {
		indexOfSeparator--;
	}

	if (indexOfSeparator === -1) {
		if (streamBuffer) {
			streamBuffer.buffer = combineUint8Arrays([
				streamBuffer.buffer,
				restOfPacket,
			]);
		} else {
			streamBuffers.set(programId, {
				pesHeader: nextPesHeader,
				buffer: restOfPacket,
			});
		}
	} else if (streamBuffer) {
		const packet = restOfPacket.slice(0, indexOfSeparator);
		streamBuffer.buffer = combineUint8Arrays([streamBuffer.buffer, packet]);
		await processStreamBuffer({
			options: parserContext,
			streamBuffer,
			programId,
			structure,
		});
		const rest = restOfPacket.slice(indexOfSeparator);
		streamBuffers.set(programId, {
			pesHeader: nextPesHeader,
			buffer: rest,
		});
	} else {
		if (indexOfSeparator !== 0) {
			throw new Error(
				'No stream buffer found but new separator is not at the beginning',
			);
		}

		streamBuffers.set(programId, {
			pesHeader: nextPesHeader,
			buffer: restOfPacket,
		});
	}
};
