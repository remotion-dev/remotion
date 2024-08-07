import type {AnySegment} from './parse-result';
import {getMoovBox, getMvhdBox} from './traversal';

const getDurationFromMatroska = (segments: AnySegment[]): number | null => {
	const mainSegment = segments.find((s) => s.type === 'main-segment');
	if (!mainSegment || mainSegment.type !== 'main-segment') {
		return null;
	}

	const {children} = mainSegment;
	if (!children) {
		return null;
	}

	const infoSegment = children.find((s) => s.type === 'info-segment');

	const relevantBoxes = [
		...mainSegment.children,
		...(infoSegment && infoSegment.type === 'info-segment'
			? infoSegment.children
			: []),
	];

	const timestampScale = relevantBoxes.find(
		(s) => s.type === 'timestamp-scale-segment',
	);
	if (!timestampScale || timestampScale.type !== 'timestamp-scale-segment') {
		return null;
	}

	const duration = relevantBoxes.find((s) => s.type === 'duration-segment');
	if (!duration || duration.type !== 'duration-segment') {
		return null;
	}

	return (duration.duration / timestampScale.timestampScale) * 1000;
};

export const getDuration = (boxes: AnySegment[]): number | null => {
	const matroskaBox = boxes.find((b) => b.type === 'main-segment');
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
