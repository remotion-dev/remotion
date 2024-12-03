import type {BufferIterator} from '../../buffer-iterator';
import type {
	MatroskaParseResult,
	MatroskaStructure,
	ParseResult,
} from '../../parse-result';
import type {ParserContext} from '../../parser-context';
import {expectChildren} from './segments/parse-children';

const continueAfterMatroskaResult = (
	result: MatroskaParseResult,
	structure: MatroskaStructure,
): ParseResult<MatroskaStructure> => {
	if (result.status === 'done') {
		return {
			status: 'done',
			segments: structure,
		};
	}

	return {
		status: 'incomplete',
		segments: structure,
		continueParsing: async () => {
			const newResult = await result.continueParsing();
			return continueAfterMatroskaResult(newResult, structure);
		},
		skipTo: null,
	};
};

// Parsing according to https://darkcoding.net/software/reading-mediarecorders-webm-opus-output/
export const parseWebm = async (
	counter: BufferIterator,
	parserContext: ParserContext,
): Promise<ParseResult<MatroskaStructure>> => {
	const structure: MatroskaStructure = {type: 'matroska', boxes: []};
	const results = await expectChildren({
		iterator: counter,
		length: Infinity,
		children: structure.boxes,
		parserContext,
		startOffset: counter.counter.getOffset(),
	});
	return continueAfterMatroskaResult(results, structure);
};
