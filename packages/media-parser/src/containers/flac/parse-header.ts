import type {BufferIterator} from '../../buffer-iterator';
import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';

export const parseFlacHeader = ({
	state,
}: {
	state: ParserState;
	iterator: BufferIterator;
}): Promise<ParseResult> => {
	state.getFlacStructure().boxes.push({
		type: 'flac-header',
	});

	return Promise.resolve(null);
};
