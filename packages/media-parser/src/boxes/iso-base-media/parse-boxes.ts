import type {BufferIterator} from '../../buffer-iterator';
import type {IsoBaseMediaStructure, ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {processBox} from './process-box';

export const parseIsoBaseMedia = async ({
	iterator,
	state,
}: {
	iterator: BufferIterator;

	state: ParserState;
}): Promise<ParseResult> => {
	const continueParsing = () => {
		return parseIsoBaseMedia({
			iterator,
			state,
		});
	};

	const result = await processBox({
		iterator,
		state,
	});
	if (result.box) {
		(state.structure.getStructure() as IsoBaseMediaStructure).boxes.push(
			result.box,
		);
	}

	if (result.skipTo !== null) {
		if (!state.supportsContentRange) {
			throw new Error(
				'Content-Range header is not supported by the reader, but was asked to seek',
			);
		}

		return {
			status: 'incomplete',
			continueParsing,
			skipTo: result.skipTo,
		};
	}

	if (iterator.bytesRemaining() < 0) {
		return {
			status: 'incomplete',
			continueParsing,
			skipTo: null,
		};
	}

	iterator.removeBytesRead();

	return {
		status: 'incomplete',
		continueParsing,
		skipTo: null,
	};
};
