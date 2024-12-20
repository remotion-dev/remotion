import type {BufferIterator} from '../../buffer-iterator';
import {hasAllInfo} from '../../has-all-info';
import type {Options, ParseMediaFields} from '../../options';
import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import type {NextPesHeaderStore} from './next-pes-header-store';
import {parsePacket} from './parse-packet';
import {
	processFinalStreamBuffers,
	type StreamBufferMap,
} from './process-stream-buffers';

export const parseTransportStream = async ({
	iterator,
	state,
	streamBuffers,
	fields,
	nextPesHeaderStore,
}: {
	iterator: BufferIterator;
	state: ParserState;
	streamBuffers: StreamBufferMap;
	fields: Options<ParseMediaFields>;
	nextPesHeaderStore: NextPesHeaderStore;
}): Promise<ParseResult> => {
	const structure = state.structure.getStructure();
	if (structure.type !== 'transport-stream') {
		throw new Error('Invalid structure type');
	}

	if (iterator.bytesRemaining() === 0) {
		await processFinalStreamBuffers({
			streamBufferMap: streamBuffers,
			state,
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
				state,
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
						state,
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
			parserState: state,
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
				state,
				streamBuffers,
				fields,
				nextPesHeaderStore,
			});
		},
		skipTo: null,
	});
};
