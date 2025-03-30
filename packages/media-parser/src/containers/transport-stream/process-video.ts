import type {LogLevel} from '../../log';
import type {TransportStreamStructure} from '../../parse-result';
import type {SampleCallbacks} from '../../state/sample-callbacks';
import type {TransportStreamState} from '../../state/transport-stream/transport-stream';
import type {OnAudioTrack, OnVideoTrack} from '../../webcodec-sample-types';
import type {WorkOnSeekRequestOptions} from '../../work-on-seek-request';
import {findNthSubarrayIndex} from './find-separator';
import type {TransportStreamPacketBuffer} from './process-stream-buffers';
import {processStreamBuffer} from './process-stream-buffers';

export const canProcessVideo = ({
	streamBuffer,
}: {
	streamBuffer: TransportStreamPacketBuffer;
}) => {
	const indexOfSeparator = findNthSubarrayIndex(
		streamBuffer.buffer,
		new Uint8Array([0, 0, 1, 9]),
		2,
	);
	if (indexOfSeparator === -1 || indexOfSeparator === 0) {
		return false;
	}

	return true;
};

export const processVideo = async ({
	programId,
	structure,
	streamBuffer,
	workOnSeekRequestOptions,
	sampleCallbacks,
	logLevel,
	onAudioTrack,
	onVideoTrack,
	transportStream,
	makeSamplesStartAtZero,
}: {
	programId: number;
	structure: TransportStreamStructure;
	streamBuffer: TransportStreamPacketBuffer;
	workOnSeekRequestOptions: WorkOnSeekRequestOptions;
	sampleCallbacks: SampleCallbacks;
	logLevel: LogLevel;
	onAudioTrack: OnAudioTrack | null;
	onVideoTrack: OnVideoTrack | null;
	transportStream: TransportStreamState;
	makeSamplesStartAtZero: boolean;
}): Promise<Uint8Array> => {
	const indexOfSeparator = findNthSubarrayIndex(
		streamBuffer.buffer,
		new Uint8Array([0, 0, 1, 9]),
		2,
	);
	if (indexOfSeparator === -1 || indexOfSeparator === 0) {
		throw new Error('cannot process avc stream');
	}

	const packet = streamBuffer.buffer.slice(0, indexOfSeparator);
	const rest = streamBuffer.buffer.slice(indexOfSeparator);

	await processStreamBuffer({
		streamBuffer: {
			offset: streamBuffer.offset,
			pesHeader: streamBuffer.pesHeader,
			// Replace the regular 0x00000001 with 0x00000002 to avoid confusion with other 0x00000001 (?)
			buffer: packet,
		},
		programId,
		structure,
		workOnSeekRequestOptions,
		sampleCallbacks,
		logLevel,
		onAudioTrack,
		onVideoTrack,
		transportStream,
		makeSamplesStartAtZero,
	});

	return rest;
};
