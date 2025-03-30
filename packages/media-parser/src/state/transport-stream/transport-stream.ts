import type {TransportStreamPacketBuffer} from '../../containers/transport-stream/process-stream-buffers';
import {lastEmittedSampleState} from './last-emitted-sample';
import {makeNextPesHeaderStore} from './next-pes-header-store';
import {startOffsetStore} from './start-offset';

export const transportStreamState = () => {
	const streamBuffers = new Map<number, TransportStreamPacketBuffer>();
	const startOffset = startOffsetStore();
	const lastEmittedSample = lastEmittedSampleState();

	const state = {
		nextPesHeaderStore: makeNextPesHeaderStore(),
		streamBuffers,
		startOffset,
		resetBeforeSeek: () => {
			state.streamBuffers.clear();
			state.nextPesHeaderStore = makeNextPesHeaderStore();

			// start offset is useful, we can keep it
		},
		lastEmittedSample,
	};

	return state;
};

export type TransportStreamState = ReturnType<typeof transportStreamState>;
