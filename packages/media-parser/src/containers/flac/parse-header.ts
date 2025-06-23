import type {BufferIterator} from '../../iterator/buffer-iterator';
import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';

export const parseFlacHeader = ({
	state,
}: {
	state: ParserState;
	iterator: BufferIterator;
}): Promise<ParseResult> => {
	state.structure.getFlacStructure().boxes.push({
		type: 'flac-header',
	});

	return Promise.resolve(null);
};
