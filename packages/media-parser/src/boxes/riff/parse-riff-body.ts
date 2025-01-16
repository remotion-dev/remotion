import type {BufferIterator} from '../../buffer-iterator';
import type {Options, ParseMediaFields} from '../../options';
import type {ParseResult, RiffStructure} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {expectRiffBox} from './expect-riff-box';

export const parseRiffBody = async ({
	iterator,
	structure,
	maxOffset,
	state,
	fields,
}: {
	iterator: BufferIterator;
	structure: RiffStructure;
	maxOffset: number;
	state: ParserState;
	fields: Options<ParseMediaFields>;
}): Promise<ParseResult> => {
	const continueParsing = () => {
		return parseRiffBody({
			fields,
			iterator,
			maxOffset,
			state,
			structure,
		});
	};

	if (iterator.counter.getOffset() >= maxOffset) {
		throw new Error('End of RIFF body');
	}

	const result = await expectRiffBox({
		iterator,
		state,
		fields,
	});
	if (result.type === 'complete' && result.box !== null) {
		structure.boxes.push(result.box);
	}

	if (result.type === 'complete' && result.skipTo !== null) {
		return {
			status: 'incomplete',
			skipTo: result.skipTo,
			continueParsing,
		};
	}

	return {
		continueParsing,
		skipTo: null,
		status: 'incomplete',
	};
};
