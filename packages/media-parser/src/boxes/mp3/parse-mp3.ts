import type {BufferIterator} from '../../buffer-iterator';
import type {Mp3Structure, ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {parseId3} from './id3';
import {parseMpegHeader} from './parse-mpeg-header';

export const parseMp3 = async ({
	iterator,
	structure,
	state,
}: {
	iterator: BufferIterator;
	structure: Mp3Structure;
	state: ParserState;
}): Promise<ParseResult> => {
	const continueParsing = () => {
		return parseMp3({iterator, structure, state});
	};

	if (iterator.bytesRemaining() === 0) {
		return Promise.resolve({
			status: 'done',
		});
	}

	while (iterator.bytesRemaining() > 0) {
		if (iterator.bytesRemaining() < 3) {
			return {
				status: 'incomplete',
				skipTo: null,
				continueParsing,
			};
		}

		const bytes = iterator.getSlice(3);
		if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
			parseId3(iterator, structure);
			break;
		}

		if (bytes[0] === 0xff) {
			iterator.counter.decrement(3);
			await parseMpegHeader({
				iterator,
				state,
			});
			break;
		}
	}

	return {
		status: 'incomplete',
		continueParsing,
		skipTo: null,
	};
};
