import type {AnySegment} from './parse-video';

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
	if (!infoSegment || infoSegment.type !== 'info-segment') {
		return null;
	}

	const timestampScale = infoSegment.children.find(
		(s) => s.type === 'timestamp-scale-segment',
	);
	if (!timestampScale || timestampScale.type !== 'timestamp-scale-segment') {
		return null;
	}

	const duration = infoSegment.children.find(
		(s) => s.type === 'duration-segment',
	);
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

	const moovBox = boxes.find((b) => b.type === 'moov-box');
	if (!moovBox || moovBox.type !== 'moov-box') {
		return null;
	}

	const {children} = moovBox;
	if (!children) {
		return null;
	}

	const mvhdBox = children.find((b) => b.type === 'mvhd-box');

	if (!mvhdBox) {
		return null;
	}

	if (mvhdBox.type !== 'mvhd-box') {
		throw new Error('Expected mvhd-box');
	}

	return mvhdBox.durationInSeconds;
};
