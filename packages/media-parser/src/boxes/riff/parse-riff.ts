import type {BufferIterator} from '../../buffer-iterator';
import type {Options, ParseMediaFields} from '../../options';
import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {parseRiffBody} from './parse-riff-body';
import {parseRiffHeader} from './parse-riff-header';

export const parseRiff = ({
	iterator,
	state,
	fields,
}: {
	iterator: BufferIterator;
	state: ParserState;
	fields: Options<ParseMediaFields>;
}): Promise<ParseResult> => {
	if (iterator.counter.getOffset() === 0) {
		return Promise.resolve(parseRiffHeader({iterator, state, fields}));
	}

	return parseRiffBody({
		iterator,
		state,
		fields,
	});
};
