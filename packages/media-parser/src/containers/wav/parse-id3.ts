import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import type {WavId3} from './types';

// non-standard, we discard it in favor of LIST boxes
export const parseId3 = ({
	state,
}: {
	state: ParserState;
}): Promise<ParseResult> => {
	const {iterator} = state;
	const id3Size = iterator.getUint32Le();
	iterator.discard(id3Size);

	const id3Box: WavId3 = {
		type: 'wav-id3',
	};

	state.getWavStructure().boxes.push(id3Box);

	return Promise.resolve(null);
};
