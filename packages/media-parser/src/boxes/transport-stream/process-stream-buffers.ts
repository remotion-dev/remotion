import type {TransportStreamStructure} from '../../parse-result';
import type {ParserContext} from '../../parser-context';
import {handleAacPacket} from './handle-aac-packet';
import {handleAvcPacket} from './handle-avc-packet';
import type {PacketPes} from './parse-pes';
import {getStreamForId} from './traversal';

export type TransportStreamPacketBuffer = {
	buffer: Buffer;
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
	options: ParserContext;
	programId: number;
	structure: TransportStreamStructure;
}) => {
	const stream = getStreamForId(structure, programId);
	if (!stream) {
		throw new Error('No stream found');
	}

	// 27 = AVC / H.264 Video
	if (stream.streamType === 27) {
		await handleAvcPacket({programId, streamBuffer, options});
	}
	// 15 = AAC / ADTS
	else if (stream.streamType === 15) {
		await handleAacPacket({streamBuffer, options, programId});
	}
};

export const processStreamBuffers = async ({
	streamBufferMap,
	parserContext,
	structure,
}: {
	streamBufferMap: StreamBufferMap;
	parserContext: ParserContext;
	structure: TransportStreamStructure;
}) => {
	for (const [programId, buffer] of streamBufferMap) {
		await processStreamBuffer({
			streamBuffer: buffer,
			options: parserContext,
			programId,
			structure,
		});
		streamBufferMap.delete(programId);
	}
};
