/* eslint-disable @typescript-eslint/no-use-before-define */
import {Log} from '../../log';
import type {ParserState} from '../../state/parser-state';
import type {SegmentSection} from '../../state/webm';
import {parseEbml, postprocessEbml} from './parse-ebml';
import type {ClusterSegment, MainSegment} from './segments/all-segments';
import {
	ebmlMap,
	matroskaElements,
	type PossibleEbml,
	type TrackEntry,
} from './segments/all-segments';

export type MatroskaSegment = PossibleEbml;

export type OnTrackEntrySegment = (trackEntry: TrackEntry) => void;

export const expectSegment = async ({
	state,
	isInsideSegment,
}: {
	state: ParserState;
	isInsideSegment: SegmentSection | null;
}): Promise<MatroskaSegment | null> => {
	const {iterator} = state;
	if (iterator.bytesRemaining() === 0) {
		throw new Error('has no bytes');
	}

	const offset = iterator.counter.getOffset();
	const {returnToCheckpoint} = iterator.startCheckpoint();
	const segmentId = iterator.getMatroskaSegmentId();

	if (segmentId === null) {
		returnToCheckpoint();
		return null;
	}

	const offsetBeforeVInt = iterator.counter.getOffset();
	const size = iterator.getVint();
	const offsetAfterVInt = iterator.counter.getOffset();

	if (size === null) {
		returnToCheckpoint();
		return null;
	}

	const bytesRemainingNow = iterator.bytesRemaining();

	Log.trace(
		state.logLevel,
		'Segment ID:',
		ebmlMap[segmentId as keyof typeof ebmlMap]?.name,
		'Size:' + size,
		bytesRemainingNow,
	);

	if (segmentId === matroskaElements.Segment) {
		state.webm.addSegment({
			start: offset,
			size,
		});
		const newSegment: MainSegment = {
			type: 'Segment',
			minVintWidth: offsetAfterVInt - offsetBeforeVInt,
			value: [],
		};
		return newSegment;
	}

	if (segmentId === matroskaElements.Cluster) {
		if (isInsideSegment === null) {
			throw new Error('Expected to be inside segment');
		}

		state.webm.addCluster({
			start: offset,
			size,
			segment: isInsideSegment.index,
		});

		const newSegment: ClusterSegment = {
			type: 'Cluster',
			minVintWidth: offsetAfterVInt - offsetBeforeVInt,
			value: [],
		};
		return newSegment;
	}

	if (bytesRemainingNow < size) {
		returnToCheckpoint();
		return null;
	}

	const segment = await parseSegment({
		segmentId,
		length: size,
		state,
		headerReadSoFar: iterator.counter.getOffset() - offset,
	});

	return segment;
};

const parseSegment = async ({
	segmentId,
	length,
	state,
	headerReadSoFar,
}: {
	segmentId: string;
	length: number;
	state: ParserState;
	headerReadSoFar: number;
}): Promise<Promise<MatroskaSegment> | MatroskaSegment> => {
	if (length < 0) {
		throw new Error(`Expected length of ${segmentId} to be greater or equal 0`);
	}

	state.iterator.counter.decrement(headerReadSoFar);

	const offset = state.iterator.counter.getOffset();
	const ebml = await parseEbml(state);
	const remapped = await postprocessEbml({offset, ebml, state});

	return remapped;
};
