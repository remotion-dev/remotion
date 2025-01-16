import {makeNextPesHeaderStore} from '../boxes/transport-stream/next-pes-header-store';
import type {TransportStreamPacketBuffer} from '../boxes/transport-stream/process-stream-buffers';

export const transportStreamState = () => {
	return {
		nextPesHeaderStore: makeNextPesHeaderStore(),
		streamBuffers: new Map<number, TransportStreamPacketBuffer>(),
	};
};
