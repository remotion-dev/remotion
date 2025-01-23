import type {TransportStreamStructure} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
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
	state,
	programId,
	structure,
}: {
	streamBuffer: TransportStreamPacketBuffer;
	state: ParserState;
	programId: number;
	structure: TransportStreamStructure;
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
			state,
			offset: streamBuffer.offset,
		});
	}
	// 15 = AAC / ADTS
	else if (stream.streamType === 15) {
		await handleAacPacket({
			streamBuffer,
			state,
			programId,
			offset: streamBuffer.offset,
		});
	}

	if (!state.callbacks.tracks.hasAllTracks()) {
		const tracksRegistered = state.callbacks.tracks.getTracks().length;
		const {streams} = findProgramMapTableOrThrow(structure);
		if (streams.length === tracksRegistered) {
			state.callbacks.tracks.setIsDone(state.logLevel);
		}
	}
};

export const processFinalStreamBuffers = async ({
	state,
	structure,
}: {
	state: ParserState;
	structure: TransportStreamStructure;
}) => {
	for (const [programId, buffer] of state.transportStream.streamBuffers) {
		if (buffer.buffer.byteLength > 0) {
			await processStreamBuffer({
				streamBuffer: buffer,
				state,
				programId,
				structure,
			});
			state.transportStream.streamBuffers.delete(programId);
		}
	}
};
