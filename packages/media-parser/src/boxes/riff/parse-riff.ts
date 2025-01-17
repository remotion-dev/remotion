import type {BufferIterator} from '../../buffer-iterator';
import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {parseRiffBody} from './parse-riff-body';
import {parseRiffHeader} from './parse-riff-header';

export const parseRiff = ({
	iterator,
	state,
}: {
	iterator: BufferIterator;
	state: ParserState;
}): Promise<ParseResult> => {
	if (iterator.counter.getOffset() === 0) {
		return Promise.resolve(parseRiffHeader({iterator, state}));
	}

	return parseRiffBody({
		iterator,
		state,
	});
};
