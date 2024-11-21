import type {BufferIterator} from '../../buffer-iterator';
import type {MatroskaParseResult, ParseResult} from '../../parse-result';
import type {ParserContext} from '../../parser-context';
import type {MatroskaSegment} from './segments';
import {expectChildren} from './segments/parse-children';

const continueAfterMatroskaResult = (
	result: MatroskaParseResult,
	children: MatroskaSegment[],
): ParseResult => {
	if (result.status === 'done') {
		return {
			status: 'done',
			segments: children,
		};
	}

	return {
		status: 'incomplete',
		segments: children,
		continueParsing: async () => {
			const newResult = await result.continueParsing();
			return continueAfterMatroskaResult(newResult, children);
		},
		skipTo: null,
	};
};

// Parsing according to https://darkcoding.net/software/reading-mediarecorders-webm-opus-output/
export const parseWebm = async (
	counter: BufferIterator,
	parserContext: ParserContext,
): Promise<ParseResult> => {
	const children: MatroskaSegment[] = [];
	const results = await expectChildren({
		iterator: counter,
		length: Infinity,
		children,
		parserContext,
		startOffset: counter.counter.getOffset(),
	});
	return continueAfterMatroskaResult(results, children);
};
