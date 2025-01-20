import {makeNextPesHeaderStore} from '../containers/transport-stream/next-pes-header-store';
import type {TransportStreamPacketBuffer} from '../containers/transport-stream/process-stream-buffers';

export const transportStreamState = () => {
	return {
		nextPesHeaderStore: makeNextPesHeaderStore(),
		streamBuffers: new Map<number, TransportStreamPacketBuffer>(),
	};
};
