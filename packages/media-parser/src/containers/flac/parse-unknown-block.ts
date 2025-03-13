import type {BufferIterator} from '../../buffer-iterator';
import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';

export const parseFlacUnkownBlock = ({
	iterator,
	state,
	size,
}: {
	iterator: BufferIterator;
	state: ParserState;
	size: number;
}): Promise<ParseResult> => {
	iterator.discard(size);

	state.getFlacStructure().boxes.push({
		type: 'flac-header',
	});

	return Promise.resolve(null);
};
