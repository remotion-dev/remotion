import type {BufferIterator} from '../../buffer-iterator';
import type {ParseResult} from '../../parse-result';
import type {ParserContext} from '../../parser-context';
import {expectChildren} from './segments/parse-children';

// Parsing according to https://darkcoding.net/software/reading-mediarecorders-webm-opus-output/
export const parseWebm = (
	counter: BufferIterator,
	parserContext: ParserContext,
): Promise<ParseResult> => {
	return expectChildren({
		iterator: counter,
		length: Infinity,
		initialChildren: [],
		wrap: null,
		parserContext,
	});
};
