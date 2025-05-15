import type {MediaParserLogLevel} from '../../log';
import type {TransportStreamStructure} from '../../parse-result';
import type {AvcState} from '../../state/avc/avc-state';
import type {CallbacksState} from '../../state/sample-callbacks';
import type {TransportStreamState} from '../../state/transport-stream/transport-stream';
import type {
	MediaParserOnAudioTrack,
	MediaParserOnVideoTrack,
} from '../../webcodec-sample-types';
import type {TransportStreamPacketBuffer} from './process-stream-buffers';
import {
	makeTransportStreamPacketBuffer,
	processStreamBuffer,
} from './process-stream-buffers';

export const canProcessVideo = ({
	streamBuffer,
}: {
	streamBuffer: TransportStreamPacketBuffer;
}) => {
	const indexOfSeparator = streamBuffer.get2ndSubArrayIndex();

	if (indexOfSeparator === -1 || indexOfSeparator === 0) {
		return false;
	}

	return true;
};

export const processVideo = async ({
	programId,
	structure,
	streamBuffer,
	sampleCallbacks,
	logLevel,
	onAudioTrack,
	onVideoTrack,
	transportStream,
	makeSamplesStartAtZero,
	avcState,
}: {
	programId: number;
	structure: TransportStreamStructure;
	streamBuffer: TransportStreamPacketBuffer;
	sampleCallbacks: CallbacksState;
	logLevel: MediaParserLogLevel;
	onAudioTrack: MediaParserOnAudioTrack | null;
	onVideoTrack: MediaParserOnVideoTrack | null;
	transportStream: TransportStreamState;
	makeSamplesStartAtZero: boolean;
	avcState: AvcState;
}): Promise<Uint8Array> => {
	const indexOfSeparator = streamBuffer.get2ndSubArrayIndex();

	if (indexOfSeparator === -1 || indexOfSeparator === 0) {
		throw new Error('cannot process avc stream');
	}

	const buf = streamBuffer.getBuffer();
	const packet = buf.slice(0, indexOfSeparator);
	const rest = buf.slice(indexOfSeparator);

	await processStreamBuffer({
		streamBuffer: makeTransportStreamPacketBuffer({
			offset: streamBuffer.offset,
			pesHeader: streamBuffer.pesHeader,
			// Replace the regular 0x00000001 with 0x00000002 to avoid confusion with other 0x00000001 (?)
			buffers: packet,
		}),
		programId,
		structure,
		sampleCallbacks,
		logLevel,
		onAudioTrack,
		onVideoTrack,
		transportStream,
		makeSamplesStartAtZero,
		avcState,
	});
	return rest;
};
