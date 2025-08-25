/* eslint-disable @typescript-eslint/no-use-before-define */
import type {BufferIterator} from '../../iterator/buffer-iterator';
import type {MediaParserLogLevel} from '../../log';
import {Log} from '../../log';
import type {SegmentSection} from '../../state/matroska/webm';
import type {MediaSectionState} from '../../state/video-section';
import {parseEbml, postprocessEbml} from './parse-ebml';
import type {ClusterSegment, MainSegment} from './segments/all-segments';
import {
	ebmlMap,
	matroskaElements,
	type PossibleEbml,
	type TrackEntry,
} from './segments/all-segments';
import {type WebmRequiredStatesForProcessing} from './state-for-processing';

export type MatroskaSegment = PossibleEbml;

export type OnTrackEntrySegment = (trackEntry: TrackEntry) => void;

export const expectSegment = async ({
	statesForProcessing,
	isInsideSegment,
	iterator,
	logLevel,
	mediaSectionState,
}: {
	iterator: BufferIterator;
	logLevel: MediaParserLogLevel;
	statesForProcessing: WebmRequiredStatesForProcessing | null;
	isInsideSegment: SegmentSection | null;
	mediaSectionState: MediaSectionState | null;
}): Promise<MatroskaSegment | null> => {
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
		logLevel,
		'Segment ID:',
		ebmlMap[segmentId as keyof typeof ebmlMap]?.name,
		'Size:' + size,
		bytesRemainingNow,
	);

	if (segmentId === matroskaElements.Segment) {
		if (!statesForProcessing) {
			throw new Error('States for processing are required');
		}

		statesForProcessing.webmState.addSegment({
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

		if (!statesForProcessing) {
			throw new Error('States for processing are required');
		}

		if (mediaSectionState) {
			mediaSectionState.addMediaSection({
				start: offset,
				size,
			});
		}

		statesForProcessing.webmState.addCluster({
			start: offset,
			size: size + (offsetAfterVInt - offset),
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
		headerReadSoFar: iterator.counter.getOffset() - offset,
		statesForProcessing,
		iterator,
		logLevel,
	});

	return segment;
};

const parseSegment = async ({
	segmentId,
	length,
	iterator,
	headerReadSoFar,
	statesForProcessing,
	logLevel,
}: {
	segmentId: string;
	length: number;
	iterator: BufferIterator;
	headerReadSoFar: number;
	statesForProcessing: WebmRequiredStatesForProcessing | null;
	logLevel: MediaParserLogLevel;
}): Promise<MatroskaSegment | null> => {
	if (length < 0) {
		throw new Error(`Expected length of ${segmentId} to be greater or equal 0`);
	}

	iterator.counter.decrement(headerReadSoFar);

	const offset = iterator.counter.getOffset();
	const ebml = await parseEbml(iterator, statesForProcessing, logLevel);
	if (ebml === null) {
		return null;
	}

	if (!statesForProcessing) {
		return ebml;
	}

	const remapped = await postprocessEbml({
		offset,
		ebml,
		statesForProcessing,
	});

	return remapped;
};
