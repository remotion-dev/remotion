/* eslint-disable @typescript-eslint/no-use-before-define */
import type {BufferIterator} from '../../buffer-iterator';
import type {Options, ParseMediaFields} from '../../options';
import type {
	ExpectSegmentParseResult,
	MatroskaParseResult,
	MatroskaStructure,
} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {parseEbml, postprocessEbml} from './parse-ebml';
import type {ClusterSegment, MainSegment} from './segments/all-segments';
import {type PossibleEbml, type TrackEntry} from './segments/all-segments';
import {
	expectAndProcessSegment,
	expectChildren,
} from './segments/parse-children';

export type MatroskaSegment = PossibleEbml;

export type OnTrackEntrySegment = (trackEntry: TrackEntry) => void;

const continueAfterMatroskaParseResult = async ({
	result,
	iterator,
	state,
	segment,
}: {
	result: MatroskaParseResult;
	iterator: BufferIterator;
	state: ParserState;
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
				state,
				segment,
			});
		},
		segment: null,
		status: 'incomplete',
	};
};

export const expectSegment = async ({
	iterator,
	state,
	offset,
	children,
	fields,
	topLevelStructure,
}: {
	iterator: BufferIterator;
	state: ParserState;
	offset: number;
	children: PossibleEbml[];
	fields: Options<ParseMediaFields>;
	topLevelStructure: MatroskaStructure;
}): Promise<ExpectSegmentParseResult> => {
	iterator.counter.decrement(iterator.counter.getOffset() - offset);

	if (iterator.bytesRemaining() === 0) {
		return {
			status: 'incomplete',
			continueParsing: () => {
				return expectAndProcessSegment({
					iterator,
					state,
					offset,
					children,
					fields,
					topLevelStructure,
				});
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
				return expectAndProcessSegment({
					iterator,
					state,
					offset,
					children,
					fields,
					topLevelStructure,
				});
			},
			segment: null,
		};
	}

	const offsetBeforeVInt = iterator.counter.getOffset();
	const length = iterator.getVint();
	const offsetAfterVInt = iterator.counter.getOffset();

	if (length === null) {
		iterator.counter.decrement(iterator.counter.getOffset() - offset);
		return {
			status: 'incomplete',
			continueParsing: () => {
				return expectSegment({
					iterator,
					state,
					offset,
					children,
					fields,
					topLevelStructure,
				});
			},
			segment: null,
		};
	}

	const bytesRemainingNow =
		iterator.byteLength() - iterator.counter.getOffset();

	if (segmentId === '0x18538067' || segmentId === '0x1f43b675') {
		const newSegment: ClusterSegment | MainSegment = {
			type: segmentId === '0x18538067' ? 'Segment' : 'Cluster',
			minVintWidth: offsetAfterVInt - offsetBeforeVInt,
			value: [],
		};

		const main = await expectChildren({
			iterator,
			length,
			children: newSegment.value,
			state,
			startOffset: iterator.counter.getOffset(),
			fields,
			topLevelStructure,
		});

		if (main.status === 'incomplete') {
			return {
				status: 'incomplete',
				continueParsing: () => {
					return continueAfterMatroskaParseResult({
						iterator,
						state,
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
				return expectSegment({
					iterator,
					state,
					offset,
					children,
					fields,
					topLevelStructure,
				});
			},
		};
	}

	const segment = await parseSegment({
		segmentId,
		iterator,
		length,
		state,
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
	state,
	headerReadSoFar,
}: {
	segmentId: string;
	iterator: BufferIterator;
	length: number;
	state: ParserState;
	headerReadSoFar: number;
}): Promise<Promise<MatroskaSegment> | MatroskaSegment> => {
	if (length < 0) {
		throw new Error(`Expected length of ${segmentId} to be greater or equal 0`);
	}

	iterator.counter.decrement(headerReadSoFar);

	const offset = iterator.counter.getOffset();
	const ebml = await parseEbml(iterator, state);
	const remapped = await postprocessEbml({offset, ebml, state});

	return remapped;
};
