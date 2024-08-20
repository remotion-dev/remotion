import type {DurationSegment} from './boxes/webm/segments/all-segments';
import type {AnySegment} from './parse-result';
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

	return (duration.value / timestampScale.value) * 1000;
};

export const getDuration = (boxes: AnySegment[]): number | null => {
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

	return mvhdBox.durationInSeconds;
};

export const hasDuration = (boxes: AnySegment[]): boolean => {
	try {
		return getDuration(boxes) !== null;
	} catch (err) {
		return false;
	}
};
