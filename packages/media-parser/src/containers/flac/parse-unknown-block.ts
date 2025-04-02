import type {BufferIterator} from '../../iterator/buffer-iterator';
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

	state.structure.getFlacStructure().boxes.push({
		type: 'flac-header',
	});

	return Promise.resolve(null);
};
