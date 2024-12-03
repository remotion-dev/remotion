import type {BufferIterator} from '../../../buffer-iterator';
import type {
	ExpectSegmentParseResult,
	MatroskaParseResult,
} from '../../../parse-result';
import type {ParserContext} from '../../../parser-context';
import type {ParserState} from '../../../state/parser-state';
import type {MatroskaSegment} from '../segments';
import {expectSegment} from '../segments';
import type {PossibleEbml} from './all-segments';

const processParseResult = ({
	parseResult,
	children,
	state,
}: {
	children: MatroskaSegment[];
	parseResult: ExpectSegmentParseResult;
	state: ParserState;
}): ExpectSegmentParseResult => {
	if (parseResult.segment && !children.includes(parseResult.segment)) {
		children.push(parseResult.segment);
		if (parseResult.segment.type === 'Tracks') {
			state.tracks.setIsDone();
		}
	}

	if (parseResult.status === 'incomplete') {
		// No need to decrement because expectSegment already does it
		return {
			status: 'incomplete',
			segment: parseResult.segment,
			continueParsing: async () => {
				const newParseResult = await parseResult.continueParsing();
				return processParseResult({
					children,
					parseResult: newParseResult,
					state,
				});
			},
		};
	}

	return {
		status: 'done',
		segment: parseResult.segment,
	};
};

export const expectAndProcessSegment = async ({
	iterator,
	parserContext,
	offset,
	children,
}: {
	iterator: BufferIterator;
	parserContext: ParserContext;
	offset: number;
	children: PossibleEbml[];
}) => {
	const segment = await expectSegment({
		iterator,
		parserContext,
		offset,
		children,
	});
	return processParseResult({
		children,
		parseResult: segment,
		state: parserContext.parserState,
	});
};

const continueAfterSegmentResult = async ({
	result,
	length,
	children,
	parserContext,
	iterator,
	startOffset,
}: {
	result: ExpectSegmentParseResult;
	length: number;
	children: MatroskaSegment[];
	parserContext: ParserContext;
	iterator: BufferIterator;
	startOffset: number;
}): Promise<MatroskaParseResult> => {
	if (result.status === 'done') {
		throw new Error('Should not continue after done');
	}

	const segmentResult = await result.continueParsing();
	if (segmentResult.status === 'done') {
		return {
			status: 'incomplete',
			continueParsing: () => {
				// eslint-disable-next-line @typescript-eslint/no-use-before-define
				return expectChildren({
					children,
					iterator,
					length,
					parserContext,
					startOffset,
				});
			},
			skipTo: null,
		};
	}

	return {
		status: 'incomplete',
		continueParsing: () => {
			return continueAfterSegmentResult({
				result: segmentResult,
				children,
				iterator,
				length,
				parserContext,
				startOffset,
			});
		},
		skipTo: null,
	};
};

export const expectChildren = async ({
	iterator,
	length,
	children,
	parserContext,
	startOffset,
}: {
	iterator: BufferIterator;
	length: number;
	children: MatroskaSegment[];
	parserContext: ParserContext;
	startOffset: number;
}): Promise<MatroskaParseResult> => {
	while (iterator.counter.getOffset() < startOffset + length) {
		if (iterator.bytesRemaining() === 0) {
			break;
		}

		const currentOffset = iterator.counter.getOffset();
		const child = await expectAndProcessSegment({
			iterator,
			parserContext,
			offset: currentOffset,
			children,
		});

		if (child.status === 'incomplete') {
			return {
				status: 'incomplete',
				continueParsing: () => {
					return continueAfterSegmentResult({
						result: child,
						children,
						iterator,
						length: length - (currentOffset - startOffset),
						parserContext,
						startOffset: currentOffset,
					});
				},
				skipTo: null,
			};
		}
	}

	return {
		status: 'done',
	};
};
