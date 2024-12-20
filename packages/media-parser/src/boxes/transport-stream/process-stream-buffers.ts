import type {TransportStreamStructure} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {handleAacPacket} from './handle-aac-packet';
import {handleAvcPacket} from './handle-avc-packet';
import type {PacketPes} from './parse-pes';
import {findProgramMapTableOrThrow, getStreamForId} from './traversal';

export type TransportStreamPacketBuffer = {
	buffer: Uint8Array;
	pesHeader: PacketPes;
};

export type StreamBufferMap = Map<number, TransportStreamPacketBuffer>;

export const processStreamBuffer = async ({
	streamBuffer,
	options,
	programId,
	structure,
}: {
	streamBuffer: TransportStreamPacketBuffer;
	options: ParserState;
	programId: number;
	structure: TransportStreamStructure;
}) => {
	const stream = getStreamForId(structure, programId);
	if (!stream) {
		throw new Error('No stream found');
	}

	// 27 = AVC / H.264 Video
	if (stream.streamType === 27) {
		await handleAvcPacket({programId, streamBuffer, state: options});
	}
	// 15 = AAC / ADTS
	else if (stream.streamType === 15) {
		await handleAacPacket({streamBuffer, state: options, programId});
	}

	if (!options.tracks.hasAllTracks()) {
		const tracksRegistered = options.tracks.getTracks().length;
		const {streams} = findProgramMapTableOrThrow(structure);
		if (streams.length === tracksRegistered) {
			options.tracks.setIsDone();
		}
	}
};

export const processFinalStreamBuffers = async ({
	streamBufferMap,
	parserContext,
	structure,
}: {
	streamBufferMap: StreamBufferMap;
	parserContext: ParserState;
	structure: TransportStreamStructure;
}) => {
	for (const [programId, buffer] of streamBufferMap) {
		if (buffer.buffer.byteLength > 0) {
			await processStreamBuffer({
				streamBuffer: buffer,
				options: parserContext,
				programId,
				structure,
			});
			streamBufferMap.delete(programId);
		}
	}
};
