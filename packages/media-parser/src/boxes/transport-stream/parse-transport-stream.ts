import type {BufferIterator} from '../../buffer-iterator';
import type {ParseResult, TransportStreamStructure} from '../../parse-result';
import type {ParserContext} from '../../parser-context';
import {parsePacket} from './parse-packet';
import {
	processStreamBuffers,
	type StreamBufferMap,
} from './process-stream-buffers';

export const parseTransportStream = async ({
	iterator,
	parserContext,
	structure,
	streamBuffers,
}: {
	iterator: BufferIterator;
	parserContext: ParserContext;
	structure: TransportStreamStructure;
	streamBuffers: StreamBufferMap;
}): Promise<ParseResult<TransportStreamStructure>> => {
	if (iterator.bytesRemaining() === 0) {
		await processStreamBuffers({
			streamBufferMap: streamBuffers,
			parserContext,
			structure,
		});

		return Promise.resolve({
			status: 'done',
			segments: structure,
		});
	}

	while (true) {
		if (iterator.bytesRemaining() < 188) {
			return Promise.resolve({
				status: 'incomplete',
				segments: structure,
				skipTo: null,
				continueParsing: () => {
					return parseTransportStream({
						iterator,
						parserContext,
						structure,
						streamBuffers,
					});
				},
			});
		}

		const packet = await parsePacket({
			iterator,
			structure,
			streamBuffers,
			parserContext,
		});

		if (packet) {
			structure.boxes.push(packet);
			break;
		}
	}

	return Promise.resolve({
		segments: structure,
		status: 'incomplete',
		continueParsing() {
			return parseTransportStream({
				iterator,
				parserContext,
				structure,
				streamBuffers,
			});
		},
		skipTo: null,
	});
};
