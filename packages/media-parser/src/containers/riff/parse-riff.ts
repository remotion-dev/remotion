import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {parseRiffBody} from './parse-riff-body';
import {parseRiffHeader} from './parse-riff-header';

export const parseRiff = (state: ParserState): Promise<ParseResult> => {
	if (state.iterator.counter.getOffset() === 0) {
		return Promise.resolve(parseRiffHeader(state));
	}

	return parseRiffBody(state);
};
