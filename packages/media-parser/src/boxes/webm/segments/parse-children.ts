import type {BufferIterator} from '../../../buffer-iterator';
import {hasAllInfo} from '../../../has-all-info';
import type {Options, ParseMediaFields} from '../../../options';
import type {
	ExpectSegmentParseResult,
	MatroskaParseResult,
	MatroskaStructure,
} from '../../../parse-result';
import type {ParserState} from '../../../state/parser-state';
import type {MatroskaSegment} from '../segments';
import {expectSegment} from '../segments';
import type {PossibleEbml} from './all-segments';

const processParseResult = ({
	parseResult,
	children,
	state,
	fields,
	topLevelStructure,
}: {
	children: MatroskaSegment[];
	parseResult: ExpectSegmentParseResult;
	state: ParserState;
	fields: Options<ParseMediaFields>;
	topLevelStructure: MatroskaStructure;
}): ExpectSegmentParseResult => {
	if (parseResult.segment && !children.includes(parseResult.segment)) {
		children.push(parseResult.segment);
		if (hasAllInfo({fields, state})) {
			return {
				status: 'done',
				segment: parseResult.segment,
			};
		}

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
					fields,
					topLevelStructure,
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
	fields,
	topLevelStructure,
}: {
	iterator: BufferIterator;
	parserContext: ParserState;
	offset: number;
	children: PossibleEbml[];
	fields: Options<ParseMediaFields>;
	topLevelStructure: MatroskaStructure;
}) => {
	const segment = await expectSegment({
		iterator,
		parserContext,
		offset,
		children,
		fields,
		topLevelStructure,
	});
	return processParseResult({
		children,
		parseResult: segment,
		state: parserContext,
		fields,
		topLevelStructure,
	});
};

const continueAfterSegmentResult = async ({
	result,
	length,
	children,
	parserContext,
	iterator,
	startOffset,
	fields,
	topLevelStructure,
}: {
	result: ExpectSegmentParseResult;
	length: number;
	children: MatroskaSegment[];
	parserContext: ParserState;
	iterator: BufferIterator;
	startOffset: number;
	fields: Options<ParseMediaFields>;
	topLevelStructure: MatroskaStructure;
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
					fields,
					topLevelStructure,
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
				fields,
				topLevelStructure,
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
	fields,
	topLevelStructure,
}: {
	iterator: BufferIterator;
	length: number;
	children: MatroskaSegment[];
	parserContext: ParserState;
	startOffset: number;
	fields: Options<ParseMediaFields>;
	topLevelStructure: MatroskaStructure;
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
			fields,
			topLevelStructure,
		});

		if (
			hasAllInfo({
				fields,
				state: parserContext,
			})
		) {
			return {
				status: 'done',
			};
		}

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
						fields,
						topLevelStructure,
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
