/* eslint-disable @typescript-eslint/no-use-before-define */
import type {BufferIterator} from '../../buffer-iterator';
import type {
	ExpectSegmentParseResult,
	MatroskaParseResult,
} from '../../parse-result';
import type {ParserContext} from '../../parser-context';
import {parseEbml, postprocessEbml} from './parse-ebml';
import type {ClusterSegment, MainSegment} from './segments/all-segments';
import {type PossibleEbml, type TrackEntry} from './segments/all-segments';
import {expectChildren} from './segments/parse-children';

export type MatroskaSegment = PossibleEbml;

export type OnTrackEntrySegment = (trackEntry: TrackEntry) => void;

const continueAfterMatroskaParseResult = async ({
	result,
	iterator,
	parserContext,
	segment,
}: {
	result: MatroskaParseResult;
	iterator: BufferIterator;
	parserContext: ParserContext;
	segment: MatroskaSegment;
}): Promise<ExpectSegmentParseResult> => {
	if (result.status === 'done') {
		throw new Error('Should not continue after done');
	}

	const proceeded = await result.continueParsing();
	if (proceeded.status === 'done') {
		return {
			status: 'done',
			segment,
		};
	}

	return {
		continueParsing() {
			return continueAfterMatroskaParseResult({
				result: proceeded,
				iterator,
				parserContext,
				segment,
			});
		},
		segment: null,
		status: 'incomplete',
	};
};

export const expectSegment = async (
	iterator: BufferIterator,
	parserContext: ParserContext,
): Promise<ExpectSegmentParseResult> => {
	const offset = iterator.counter.getOffset();
	if (iterator.bytesRemaining() === 0) {
		return {
			status: 'incomplete',
			continueParsing: () => {
				return expectSegment(iterator, parserContext);
			},
			segment: null,
		};
	}

	const segmentId = iterator.getMatroskaSegmentId();

	if (segmentId === null) {
		iterator.counter.decrement(iterator.counter.getOffset() - offset);
		return {
			status: 'incomplete',
			continueParsing: () => {
				return expectSegment(iterator, parserContext);
			},
			segment: null,
		};
	}

	const length = iterator.getVint();

	if (length === null) {
		iterator.counter.decrement(iterator.counter.getOffset() - offset);
		return {
			status: 'incomplete',
			continueParsing: () => {
				return expectSegment(iterator, parserContext);
			},
			segment: null,
		};
	}

	const bytesRemainingNow =
		iterator.byteLength() - iterator.counter.getOffset();

	if (segmentId === '0x18538067' || segmentId === '0x1f43b675') {
		const newSegment: ClusterSegment | MainSegment = {
			type: segmentId === '0x18538067' ? 'Segment' : 'Cluster',
			minVintWidth: null,
			value: [],
		};

		const main = await expectChildren({
			iterator,
			length,
			children: newSegment.value,
			parserContext,
		});

		if (main.status === 'incomplete') {
			return {
				status: 'incomplete',
				continueParsing: () => {
					return continueAfterMatroskaParseResult({
						iterator,
						parserContext,
						result: main,
						segment: newSegment,
					});
				},
				segment: newSegment,
			};
		}

		return {
			status: 'done',
			segment: newSegment,
		};
	}

	if (bytesRemainingNow < length) {
		const bytesRead = iterator.counter.getOffset() - offset;
		iterator.counter.decrement(bytesRead);
		return {
			status: 'incomplete',
			segment: null,
			continueParsing: () => {
				return expectSegment(iterator, parserContext);
			},
		};
	}

	const segment = await parseSegment({
		segmentId,
		iterator,
		length,
		parserContext,
		headerReadSoFar: iterator.counter.getOffset() - offset,
	});

	return {
		status: 'done',
		segment,
	};
};

const parseSegment = async ({
	segmentId,
	iterator,
	length,
	parserContext,
	headerReadSoFar,
}: {
	segmentId: string;
	iterator: BufferIterator;
	length: number;
	parserContext: ParserContext;
	headerReadSoFar: number;
}): Promise<Promise<MatroskaSegment> | MatroskaSegment> => {
	if (length < 0) {
		throw new Error(`Expected length of ${segmentId} to be greater or equal 0`);
	}

	iterator.counter.decrement(headerReadSoFar);

	const offset = iterator.counter.getOffset();
	const ebml = await parseEbml(iterator, parserContext);
	const remapped = await postprocessEbml({offset, ebml, parserContext});

	return remapped;
};
