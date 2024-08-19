import type {BufferIterator} from '../../buffer-iterator';
import type {ParseResult} from '../../parse-result';
import type {ParserContext} from '../../parser-context';
import {parseEbml} from './parse-ebml';
import {expectSegment} from './segments';
import {matroskaHeader} from './segments/all-segments';

// Parsing according to https://darkcoding.net/software/reading-mediarecorders-webm-opus-output/
export const parseWebm = (
	counter: BufferIterator,
	parserContext: ParserContext,
): Promise<ParseResult> => {
	const ret = parseEbml(matroskaHeader, counter);
	const length = counter.getVint();

	if (length !== 31) {
		throw new Error(`Expected header length 31 or 35, got ${length}`);
	}

	// Discard header for now
	counter.discard(length);

	return expectSegment(counter, parserContext);
};
