/* eslint-disable @typescript-eslint/no-use-before-define */
import type {BufferIterator} from '../../buffer-iterator';
import {Log} from '../../log';
import type {Options, ParseMediaFields} from '../../options';
import type {ParserState} from '../../state/parser-state';
import {parseEbml, postprocessEbml} from './parse-ebml';
import type {ClusterSegment, MainSegment} from './segments/all-segments';
import {
	ebmlMap,
	type PossibleEbml,
	type TrackEntry,
} from './segments/all-segments';
import {expectChildren} from './segments/parse-children';

export type MatroskaSegment = PossibleEbml;

export type OnTrackEntrySegment = (trackEntry: TrackEntry) => void;

export const expectSegment = async ({
	iterator,
	state,
	fields,
}: {
	iterator: BufferIterator;
	state: ParserState;
	fields: Options<ParseMediaFields>;
}): Promise<MatroskaSegment | null> => {
	if (iterator.bytesRemaining() === 0) {
		throw new Error('has no bytes');
	}

	const offset = iterator.counter.getOffset();
	const {returnToCheckpoint} = iterator.startCheckpoint();
	const segmentId = iterator.getMatroskaSegmentId();
	Log.trace(
		state.logLevel,
		'Segment ID:',
		ebmlMap[segmentId as keyof typeof ebmlMap]?.name,
	);

	if (segmentId === null) {
		returnToCheckpoint();
		return null;
	}

	const offsetBeforeVInt = iterator.counter.getOffset();
	const length = iterator.getVint();
	const offsetAfterVInt = iterator.counter.getOffset();

	if (length === null) {
		returnToCheckpoint();
		return null;
	}

	const bytesRemainingNow =
		iterator.byteLength() - iterator.counter.getOffset();

	if (segmentId === '0x18538067' || segmentId === '0x1f43b675') {
		const value = await expectChildren({
			iterator,
			length,
			state,
			startOffset: iterator.counter.getOffset(),
			fields,
		});
		const newSegment: ClusterSegment | MainSegment = {
			type: segmentId === '0x18538067' ? 'Segment' : 'Cluster',
			minVintWidth: offsetAfterVInt - offsetBeforeVInt,
			value,
		};

		return newSegment;
	}

	if (bytesRemainingNow < length) {
		returnToCheckpoint();
		return null;
	}

	const segment = await parseSegment({
		segmentId,
		iterator,
		length,
		state,
		headerReadSoFar: iterator.counter.getOffset() - offset,
	});

	return segment;
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
