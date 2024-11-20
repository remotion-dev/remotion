import type {BufferIterator} from '../../../buffer-iterator';
import type {
	ExpectSegmentParseResult,
	MatroskaParseResult,
} from '../../../parse-result';
import type {ParserContext} from '../../../parser-context';
import type {MatroskaSegment} from '../segments';
import {expectSegment} from '../segments';

const processParseResult = ({
	parseResult,
	children,
}: {
	children: MatroskaSegment[];
	parseResult: ExpectSegmentParseResult;
}): ExpectSegmentParseResult => {
	if (parseResult.segment && !children.includes(parseResult.segment)) {
		children.push(parseResult.segment);
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
				});
			},
		};
	}

	return {
		status: 'done',
		segment: parseResult.segment,
	};
};

export const expectChildren = async ({
	iterator,
	length,
	children,
	parserContext,
}: {
	iterator: BufferIterator;
	length: number;
	children: MatroskaSegment[];
	parserContext: ParserContext;
}): Promise<MatroskaParseResult> => {
	const startOffset = iterator.counter.getOffset();

	while (iterator.counter.getOffset() < startOffset + length) {
		if (iterator.bytesRemaining() === 0) {
			break;
		}

		const parseResult = await expectSegment(iterator, parserContext);

		const child = processParseResult({
			children,
			parseResult,
		});

		if (child.status === 'incomplete') {
			if (!parserContext.supportsContentRange) {
				throw new Error(
					'Content-Range header is not supported by the reader, but was asked to seek',
				);
			}

			return {
				status: 'incomplete',
				continueParsing: () => {
					return expectChildren({
						children,
						iterator,
						length,
						parserContext,
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
