import {parseBoxes} from './boxes/iso-base-media/process-box';
import {parseWebm} from './boxes/webm/parse-webm-header';
import type {BufferIterator} from './buffer-iterator';
import type {AnySegment, IsoBaseMediaBox, ParseResult} from './parse-result';
import type {ParserContext} from './parser-context';

export type BoxAndNext =
	| {
			type: 'complete';
			box: IsoBaseMediaBox;
			size: number;
			skipTo: number | null;
	  }
	| {
			type: 'incomplete';
	  };

export const parseVideo = ({
	iterator,
	options,
	getCurrentStructure,
}: {
	iterator: BufferIterator;
	options: ParserContext;
	getCurrentStructure: () => AnySegment[];
}): ParseResult => {
	if (iterator.bytesRemaining() === 0) {
		return {
			status: 'incomplete',
			segments: [],
			continueParsing: () => {
				return parseVideo({
					iterator,
					options,
					getCurrentStructure,
				});
			},
			skipTo: null,
		};
	}

	if (iterator.isIsoBaseMedia()) {
		return parseBoxes({
			iterator,
			maxBytes: Infinity,
			allowIncompleteBoxes: true,
			initialBoxes: [],
			options,
		});
	}

	if (iterator.isWebm()) {
		return parseWebm(iterator);
	}

	throw new Error('Unknown video format');
};
