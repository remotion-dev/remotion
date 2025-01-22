import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {parsePacket} from './parse-packet';
import {processFinalStreamBuffers} from './process-stream-buffers';

export const parseTransportStream = async (
	state: ParserState,
): Promise<ParseResult> => {
	const structure = state.getTsStructure();

	const {iterator} = state;

	if (iterator.bytesRemaining() < 188) {
		return Promise.resolve(null);
	}

	const packet = await parsePacket({
		parserState: state,
	});

	if (packet) {
		structure.boxes.push(packet);
	}

	if (iterator.bytesRemaining() === 0) {
		await processFinalStreamBuffers({
			state,
			structure,
		});
	}

	return Promise.resolve(null);
};
