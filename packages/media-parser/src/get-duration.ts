import type {DurationSegment} from './boxes/webm/segments/all-segments';
import {getTracks} from './get-tracks';
import type {AnySegment} from './parse-result';
import type {ParserState} from './parser-state';
import {getMoovBox, getMvhdBox} from './traversal';

const getDurationFromMatroska = (segments: AnySegment[]): number | null => {
	const mainSegment = segments.find((s) => s.type === 'Segment');
	if (!mainSegment || mainSegment.type !== 'Segment') {
		return null;
	}

	const {value: children} = mainSegment;
	if (!children) {
		return null;
	}

	const infoSegment = children.find((s) => s.type === 'Info');

	const relevantBoxes = [
		...mainSegment.value,
		...(infoSegment && infoSegment.type === 'Info' ? infoSegment.value : []),
	];

	const timestampScale = relevantBoxes.find((s) => s.type === 'TimestampScale');
	if (!timestampScale || timestampScale.type !== 'TimestampScale') {
		return null;
	}

	const duration = relevantBoxes.find(
		(s) => s.type === 'Duration',
	) as DurationSegment;
	if (!duration || duration.type !== 'Duration') {
		return null;
	}

	return (duration.value.value / timestampScale.value.value) * 1000;
};

export const getDuration = (
	boxes: AnySegment[],
	parserState: ParserState,
): number | null => {
	const matroskaBox = boxes.find((b) => b.type === 'Segment');
	if (matroskaBox) {
		return getDurationFromMatroska(boxes);
	}

	const moovBox = getMoovBox(boxes);
	if (!moovBox) {
		return null;
	}

	const mvhdBox = getMvhdBox(moovBox);

	if (!mvhdBox) {
		return null;
	}

	if (mvhdBox.type !== 'mvhd-box') {
		throw new Error('Expected mvhd-box');
	}

	if (mvhdBox.durationInSeconds > 0) {
		return mvhdBox.durationInSeconds;
	}

	const tracks = getTracks(boxes, parserState);
	const allTracks = [
		...tracks.videoTracks.map((t) => t.samplePositions),
		...tracks.audioTracks.map((t) => t.samplePositions),
		...tracks.otherTracks.map((t) => t.samplePositions),
	].flat(1);
	console.log(allTracks);
	return 0;
};

export const hasDuration = (
	boxes: AnySegment[],
	parserState: ParserState,
): boolean => {
	try {
		const duration = getDuration(boxes, parserState);
		return getDuration(boxes, parserState) !== null && duration !== 0;
	} catch (err) {
		return false;
	}
};
