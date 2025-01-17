import type {BufferIterator} from '../../buffer-iterator';
import type {Options, ParseMediaFields} from '../../options';
import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {expectSegment} from './segments';

// Parsing according to https://darkcoding.net/software/reading-mediarecorders-webm-opus-output/
export const parseWebm = async ({
	iterator,
	state,
	fields,
}: {
	iterator: BufferIterator;
	state: ParserState;
	fields: Options<ParseMediaFields>;
}): Promise<ParseResult> => {
	const structure = state.structure.getStructure();
	if (structure.type !== 'matroska') {
		throw new Error('Invalid structure type');
	}

	const continueParsing = () => {
		return parseWebm({
			iterator,
			fields,
			state,
		});
	};

	const results = await expectSegment({
		iterator,
		state,
		fields,
	});
	if (results !== null) {
		structure.boxes.push(results);
	}

	return {
		status: 'incomplete',
		continueParsing,
		skipTo: null,
	};
};
