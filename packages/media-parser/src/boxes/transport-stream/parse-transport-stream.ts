import type {BufferIterator} from '../../buffer-iterator';
import type {ParseResult, TransportStreamStructure} from '../../parse-result';
import type {ParserContext} from '../../parser-context';
import {parsePacket} from './parse-packet';

export const parseTransportStream = async ({
	iterator,
	parsercontext,
	structure,
}: {
	iterator: BufferIterator;
	parsercontext: ParserContext;
	structure: TransportStreamStructure;
}): Promise<ParseResult<TransportStreamStructure>> => {
	if (iterator.bytesRemaining() === 0) {
		// TODO: Not right
		parsercontext.parserState.tracks.setIsDone();
		return Promise.resolve({
			status: 'done',
			segments: structure,
		});
	}

	if (iterator.bytesRemaining() < 188) {
		return Promise.resolve({
			status: 'incomplete',
			segments: structure,
			skipTo: null,
			continueParsing: () => {
				return parseTransportStream({iterator, parsercontext, structure});
			},
		});
	}

	const packet = await parsePacket(iterator, structure);

	structure.boxes.push(packet);

	return Promise.resolve({
		segments: structure,
		status: 'incomplete',
		continueParsing() {
			return parseTransportStream({iterator, parsercontext, structure});
		},
		skipTo: null,
	});
};
