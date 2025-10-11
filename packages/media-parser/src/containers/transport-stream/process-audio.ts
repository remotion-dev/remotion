import type {MediaParserLogLevel} from '../../log';
import type {TransportStreamStructure} from '../../parse-result';
import type {AvcState} from '../../state/avc/avc-state';
import type {CallbacksState} from '../../state/sample-callbacks';
import type {TransportStreamState} from '../../state/transport-stream/transport-stream';
import type {
	MediaParserOnAudioTrack,
	MediaParserOnVideoTrack,
} from '../../webcodec-sample-types';
import {readAdtsHeader} from './adts-header';
import type {TransportStreamEntry} from './parse-pmt';
import type {TransportStreamPacketBuffer} from './process-stream-buffers';
import {
	makeTransportStreamPacketBuffer,
	processStreamBuffer,
} from './process-stream-buffers';

export const canProcessAudio = ({
	streamBuffer,
}: {
	streamBuffer: TransportStreamPacketBuffer;
}) => {
	const expectedLength =
		readAdtsHeader(streamBuffer.getBuffer())?.frameLength ?? null;

	if (expectedLength === null) {
		return false;
	}

	if (expectedLength > streamBuffer.getBuffer().length) {
		return false;
	}

	return true;
};

export const processAudio = async ({
	transportStreamEntry,
	structure,
	offset,
	sampleCallbacks,
	logLevel,
	onAudioTrack,
	onVideoTrack,
	transportStream,
	makeSamplesStartAtZero,
	avcState,
}: {
	transportStreamEntry: TransportStreamEntry;
	structure: TransportStreamStructure;
	sampleCallbacks: CallbacksState;
	logLevel: MediaParserLogLevel;
	onAudioTrack: MediaParserOnAudioTrack | null;
	onVideoTrack: MediaParserOnVideoTrack | null;
	transportStream: TransportStreamState;
	offset: number;
	makeSamplesStartAtZero: boolean;
	avcState: AvcState;
}): Promise<void> => {
	const {streamBuffers, nextPesHeaderStore: nextPesHeader} = transportStream;
	const streamBuffer = streamBuffers.get(transportStreamEntry.pid);
	if (!streamBuffer) {
		throw new Error('Stream buffer not found');
	}

	const expectedLength =
		readAdtsHeader(streamBuffer.getBuffer())?.frameLength ?? null;

	if (expectedLength === null) {
		throw new Error('Expected length is null');
	}

	if (expectedLength > streamBuffer.getBuffer().length) {
		throw new Error('Expected length is greater than stream buffer length');
	}

	await processStreamBuffer({
		streamBuffer: makeTransportStreamPacketBuffer({
			buffers: streamBuffer.getBuffer().slice(0, expectedLength),
			offset,
			pesHeader: streamBuffer.pesHeader,
		}),
		programId: transportStreamEntry.pid,
		structure,
		sampleCallbacks,
		logLevel,
		onAudioTrack,
		onVideoTrack,
		transportStream,
		makeSamplesStartAtZero,
		avcState,
	});

	const rest = streamBuffer.getBuffer().slice(expectedLength);
	streamBuffers.set(
		transportStreamEntry.pid,
		makeTransportStreamPacketBuffer({
			buffers: rest,
			pesHeader: nextPesHeader.getNextPesHeader(),
			offset,
		}),
	);
};
