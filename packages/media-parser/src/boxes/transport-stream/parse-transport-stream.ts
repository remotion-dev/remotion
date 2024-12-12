import type {BufferIterator} from '../../buffer-iterator';
import {hasAllInfo} from '../../has-all-info';
import type {Options, ParseMediaFields} from '../../options';
import type {ParseResult, TransportStreamStructure} from '../../parse-result';
import type {ParserContext} from '../../parser-context';
import type {NextPesHeaderStore} from './next-pes-header-store';
import {parsePacket} from './parse-packet';
import {
	processFinalStreamBuffers,
	type StreamBufferMap,
} from './process-stream-buffers';

export const parseTransportStream = async ({
	iterator,
	parserContext,
	structure,
	streamBuffers,
	fields,
	nextPesHeaderStore,
}: {
	iterator: BufferIterator;
	parserContext: ParserContext;
	structure: TransportStreamStructure;
	streamBuffers: StreamBufferMap;
	fields: Options<ParseMediaFields>;
	nextPesHeaderStore: NextPesHeaderStore;
}): Promise<ParseResult<TransportStreamStructure>> => {
	if (iterator.bytesRemaining() === 0) {
		await processFinalStreamBuffers({
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
		if (
			hasAllInfo({
				fields,
				state: parserContext.parserState,
				structure,
			})
		) {
			break;
		}

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
						fields,
						nextPesHeaderStore,
					});
				},
			});
		}

		const packet = await parsePacket({
			iterator,
			structure,
			streamBuffers,
			parserContext,
			nextPesHeaderStore,
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
				fields,
				nextPesHeaderStore,
			});
		},
		skipTo: null,
	});
};
