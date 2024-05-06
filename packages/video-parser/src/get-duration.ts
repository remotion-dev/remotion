import type {Box} from './parse-video';

export const getDuration = (boxes: Box[]): number | null => {
	const moovBox = boxes.find(
		(b) => b.type === 'regular-box' && b.boxType === 'moov',
	);
	if (!moovBox || moovBox.type !== 'regular-box') {
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
