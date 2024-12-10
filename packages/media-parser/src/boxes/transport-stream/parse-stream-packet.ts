import type {BufferIterator} from '../../buffer-iterator';
import type {UnimplementedBox} from './boxes';
import {getRestOfPacket} from './discard-rest-of-packet';
import type {TransportStreamEntry} from './parse-pmt';
import type {StreamBufferMap} from './process-stream-buffers';

export const doesPesPacketFollow = (iterator: BufferIterator) => {
	const assertion = iterator.getUint24() === 0x000001;
	iterator.counter.decrement(3);
	return assertion;
};

export const parseStream = ({
	iterator,
	transportStreamEntry,
	streamBuffers,
}: {
	iterator: BufferIterator;
	transportStreamEntry: TransportStreamEntry;
	streamBuffers: StreamBufferMap;
}): UnimplementedBox => {
	const streamBuffer = streamBuffers.get(transportStreamEntry.pid);
	if (!streamBuffer) {
		throw new Error('No header found for ' + transportStreamEntry.pid);
	}

	const restOfPacket = getRestOfPacket(iterator);

	streamBuffer.buffer = Buffer.concat([streamBuffer.buffer, restOfPacket]);

	return {type: 'transport-stream-unimplemented-box'};
};
