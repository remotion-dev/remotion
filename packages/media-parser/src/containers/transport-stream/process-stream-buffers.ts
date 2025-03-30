import type {LogLevel} from '../../log';
import type {TransportStreamStructure} from '../../parse-result';
import type {SampleCallbacks} from '../../state/sample-callbacks';
import type {TransportStreamState} from '../../state/transport-stream/transport-stream';
import type {OnAudioTrack, OnVideoTrack} from '../../webcodec-sample-types';
import type {WorkOnSeekRequestOptions} from '../../work-on-seek-request';
import {filterStreamsBySupportedTypes} from './get-tracks';
import {handleAacPacket} from './handle-aac-packet';
import {handleAvcPacket} from './handle-avc-packet';
import type {PacketPes} from './parse-pes';
import {findProgramMapTableOrThrow, getStreamForId} from './traversal';

export type TransportStreamPacketBuffer = {
	buffer: Uint8Array;
	pesHeader: PacketPes;
	offset: number;
};

export type StreamBufferMap = Map<number, TransportStreamPacketBuffer>;

export const processStreamBuffer = async ({
	streamBuffer,
	programId,
	structure,
	workOnSeekRequestOptions,
	sampleCallbacks,
	logLevel,
	onAudioTrack,
	onVideoTrack,
	transportStream,
}: {
	streamBuffer: TransportStreamPacketBuffer;
	programId: number;
	structure: TransportStreamStructure;
	workOnSeekRequestOptions: WorkOnSeekRequestOptions;
	sampleCallbacks: SampleCallbacks;
	logLevel: LogLevel;
	onAudioTrack: OnAudioTrack | null;
	onVideoTrack: OnVideoTrack | null;
	transportStream: TransportStreamState;
}) => {
	const stream = getStreamForId(structure, programId);
	if (!stream) {
		throw new Error('No stream found');
	}

	// 27 = AVC / H.264 Video
	if (stream.streamType === 27) {
		await handleAvcPacket({
			programId,
			streamBuffer,
			workOnSeekRequestOptions,
			sampleCallbacks,
			logLevel,
			onVideoTrack,
			offset: streamBuffer.offset,
			transportStream,
		});
	}
	// 15 = AAC / ADTS
	else if (stream.streamType === 15) {
		await handleAacPacket({
			streamBuffer,
			programId,
			offset: streamBuffer.offset,
			workOnSeekRequestOptions,
			sampleCallbacks,
			logLevel,
			onAudioTrack,
			transportStream,
		});
	}

	if (!sampleCallbacks.tracks.hasAllTracks()) {
		const tracksRegistered = sampleCallbacks.tracks.getTracks().length;
		const {streams} = findProgramMapTableOrThrow(structure);
		if (filterStreamsBySupportedTypes(streams).length === tracksRegistered) {
			sampleCallbacks.tracks.setIsDone(logLevel);
		}
	}
};

export const processFinalStreamBuffers = async ({
	structure,
	workOnSeekRequestOptions,
	sampleCallbacks,
	logLevel,
	onAudioTrack,
	onVideoTrack,
	transportStream,
}: {
	structure: TransportStreamStructure;
	workOnSeekRequestOptions: WorkOnSeekRequestOptions;
	sampleCallbacks: SampleCallbacks;
	logLevel: LogLevel;
	onAudioTrack: OnAudioTrack | null;
	onVideoTrack: OnVideoTrack | null;
	transportStream: TransportStreamState;
}) => {
	for (const [programId, buffer] of transportStream.streamBuffers) {
		if (buffer.buffer.byteLength > 0) {
			await processStreamBuffer({
				streamBuffer: buffer,
				programId,
				structure,
				workOnSeekRequestOptions,
				sampleCallbacks,
				logLevel,
				onAudioTrack,
				onVideoTrack,
				transportStream,
			});
			transportStream.streamBuffers.delete(programId);
		}
	}
};
