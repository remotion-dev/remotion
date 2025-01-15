import type {BufferIterator} from '../../buffer-iterator';
import type {Options, ParseMediaFields} from '../../options';
import type {ParseResult, RiffStructure} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import type {RiffResult} from './expect-riff-box';
import {parseRiffBody} from './parse-riff-body';

export const continueAfterRiffBoxResult = ({
	result,
	structure,
	iterator,
	maxOffset,
	state: options,
	fields,
}: {
	result: RiffResult;
	structure: RiffStructure;
	iterator: BufferIterator;
	maxOffset: number;
	state: ParserState;
	fields: Options<ParseMediaFields>;
}): Promise<ParseResult> => {
	if (result.type === 'incomplete') {
		return Promise.resolve({
			status: 'incomplete',
			async continueParsing() {
				return Promise.resolve(
					continueAfterRiffBoxResult({
						result: await result.continueParsing(),
						structure,
						iterator,
						maxOffset,
						state: options,
						fields,
					}),
				);
			},
			segments: structure,
			skipTo: null,
		});
	}

	if (result.type === 'complete' && result.box) {
		structure.boxes.push(result.box);
	}

	return parseRiffBody({
		iterator,
		maxOffset,
		state: options,
		structure,
		fields,
	});
};
