import type {BufferIterator} from '../../buffer-iterator';
import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import type {FlacStructure} from './types';

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

	(state.structure.getStructure() as FlacStructure).boxes.push({
		type: 'flac-header',
	});

	return Promise.resolve({skipTo: null});
};
