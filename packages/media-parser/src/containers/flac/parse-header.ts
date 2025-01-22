import type {BufferIterator} from '../../buffer-iterator';
import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import type {FlacStructure} from './types';

export const parseFlacHeader = ({
	state,
}: {
	state: ParserState;
	iterator: BufferIterator;
}): Promise<ParseResult> => {
	(state.structure.getStructure() as FlacStructure).boxes.push({
		type: 'flac-header',
	});

	return Promise.resolve(null);
};
