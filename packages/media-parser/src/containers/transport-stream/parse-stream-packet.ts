import type {BufferIterator} from '../../iterator/buffer-iterator';
import type {TransportStreamState} from '../../state/transport-stream/transport-stream';
import {getRestOfPacket} from './discard-rest-of-packet';
import type {TransportStreamEntry} from './parse-pmt';
import {makeTransportStreamPacketBuffer} from './process-stream-buffers';

export const parseStream = ({
	transportStreamEntry,
	programId,
	iterator,
	transportStream,
}: {
	transportStreamEntry: TransportStreamEntry;
	programId: number;
	iterator: BufferIterator;
	transportStream: TransportStreamState;
}): void => {
	const restOfPacket = getRestOfPacket(iterator);
	const offset = iterator.counter.getOffset();

	const {streamBuffers, nextPesHeaderStore: nextPesHeader} = transportStream;

	if (!streamBuffers.has(transportStreamEntry.pid)) {
		streamBuffers.set(
			programId,
			makeTransportStreamPacketBuffer({
				pesHeader: nextPesHeader.getNextPesHeader(),
				buffers: null,
				offset,
			}),
		);
	}

	const streamBuffer = streamBuffers.get(transportStreamEntry.pid)!;
	streamBuffer.addBuffer(restOfPacket);
};
