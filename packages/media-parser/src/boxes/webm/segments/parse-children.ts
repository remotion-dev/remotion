import type {BufferIterator} from '../../../buffer-iterator';
import type {ParseResult} from '../../../parse-result';
import type {ParserContext} from '../../../parser-context';
import type {MatroskaSegment} from '../segments';
import {expectSegment} from '../segments';

type WrapChildren = (segments: MatroskaSegment[]) => MatroskaSegment;

const processParseResult = ({
	parseResult,
	children,
	wrap,
}: {
	children: MatroskaSegment[];
	parseResult: ParseResult;
	wrap: WrapChildren | null;
}): ParseResult => {
	if (parseResult.status === 'incomplete') {
		// No need to decrement because expectSegment already does it
		return {
			status: 'incomplete',
			segments: [],
			continueParsing: async () => {
				const newParseResult = await parseResult.continueParsing();
				return processParseResult({
					children,
					parseResult: newParseResult,
					wrap,
				});
			},
			skipTo: null,
		};
	}

	for (const segment of parseResult.segments) {
		children.push(segment as MatroskaSegment);
	}

	return {
		status: 'done',
		segments: wrap ? [wrap(children)] : children,
	};
};

const continueParsingfunction =
	({
		result,
		iterator,
		children,
		wrap,
		parserContext,
		length,
	}: {
		result: ParseResult;
		iterator: BufferIterator;
		children: MatroskaSegment[];
		wrap: WrapChildren | null;
		parserContext: ParserContext;
		length: number;
	}) =>
	async (): Promise<ParseResult> => {
		if (result.status !== 'incomplete') {
			throw new Error('expected incomplete');
		}

		const offset = iterator.counter.getOffset();

		const continued = await result.continueParsing();
		if (continued.status === 'incomplete') {
			return {
				status: 'incomplete',
				continueParsing: continueParsingfunction({
					result: continued,
					iterator,
					children,
					wrap,
					parserContext,
					length: length - (iterator.counter.getOffset() - offset),
				}),
				skipTo: continued.skipTo,
				segments: wrap ? [wrap(children)] : children,
			};
		}

		return expectChildren({
			iterator,
			length: length - (iterator.counter.getOffset() - offset),
			initialChildren: children,
			wrap,
			parserContext,
		});
	};

export const expectChildren = ({
	iterator,
	length,
	initialChildren,
	wrap,
	parserContext,
}: {
	iterator: BufferIterator;
	length: number;
	initialChildren: MatroskaSegment[];
	wrap: WrapChildren | null;
	parserContext: ParserContext;
}): ParseResult => {
	const children: MatroskaSegment[] = [...initialChildren];
	const startOffset = iterator.counter.getOffset();

	while (iterator.counter.getOffset() < startOffset + length) {
		if (iterator.bytesRemaining() === 0) {
			break;
		}

		const parseResult = expectSegment(iterator, parserContext);

		const child = processParseResult({
			children,
			parseResult,
			wrap,
		});

		if (child.status === 'incomplete') {
			return {
				status: 'incomplete',
				continueParsing: continueParsingfunction({
					result: child,
					iterator,
					children,
					wrap,
					parserContext,
					length: length - (iterator.counter.getOffset() - startOffset),
				}),
				skipTo: child.skipTo,
				segments: wrap ? [wrap(children)] : children,
			};
		}
	}

	return {
		status: 'done',
		segments: wrap ? [wrap(children)] : children,
	};
};
