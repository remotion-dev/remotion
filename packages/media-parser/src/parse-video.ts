import {parseBoxes} from './boxes/iso-base-media/process-box';
import {parseWebm} from './boxes/webm/parse-webm-header';
import type {BufferIterator} from './buffer-iterator';
import type {IsoBaseMediaBox, ParseResult} from './parse-result';
import type {ParserContext} from './parser-context';

export type PartialMdatBox = {
	type: 'partial-mdat-box';
	boxSize: number;
	fileOffset: number;
};

export type BoxAndNext =
	| {
			type: 'complete';
			box: IsoBaseMediaBox;
			size: number;
			skipTo: number | null;
	  }
	| {
			type: 'incomplete';
	  }
	| PartialMdatBox;

export const parseVideo = ({
	iterator,
	options,
}: {
	iterator: BufferIterator;
	options: ParserContext;
}): Promise<ParseResult> => {
	if (iterator.bytesRemaining() === 0) {
		return Promise.resolve({
			status: 'incomplete',
			segments: [],
			continueParsing: () => {
				return parseVideo({
					iterator,
					options,
				});
			},
			skipTo: null,
		});
	}

	if (iterator.isIsoBaseMedia()) {
		return parseBoxes({
			iterator,
			maxBytes: Infinity,
			allowIncompleteBoxes: true,
			initialBoxes: [],
			options,
			continueMdat: false,
		});
	}

	if (iterator.isWebm()) {
		return Promise.resolve(parseWebm(iterator, options));
	}

	throw new Error('Unknown video format');
};
