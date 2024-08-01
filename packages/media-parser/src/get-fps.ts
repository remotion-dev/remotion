import type {SttsBox} from './boxes/iso-base-media/stts/stts';
import type {AnySegment} from './parse-result';

const calculateFps = (sttsBox: SttsBox, timeScale: number) => {
	let sum = 0;
	let totalSamples = 0;
	for (const sample of sttsBox.sampleDistribution) {
		sum += sample.sampleCount * sample.sampleDelta;
		totalSamples += sample.sampleCount;
	}

	return timeScale / (sum / totalSamples);
};

export const getFps = (segments: AnySegment[]) => {
	const moovBox = segments.find((s) => s.type === 'moov-box');
	if (!moovBox || moovBox.type !== 'moov-box') {
		return null;
	}

	const mvhdBox = moovBox.children.find((c) => c.type === 'mvhd-box');
	if (!mvhdBox || mvhdBox.type !== 'mvhd-box') {
		return null;
	}

	const {timeScale} = mvhdBox;

	const {children} = moovBox;
	const trackBoxes = children.filter((c) => c.type === 'trak-box');
	if (!trackBoxes || trackBoxes.length === 0) {
		return null;
	}

	// TODO: What if the video track is not the first track?
	const trackBox = trackBoxes[0];
	if (!trackBox || trackBox.type !== 'trak-box') {
		return null;
	}

	const trackBoxChildren = trackBox.children;
	if (!trackBoxChildren || trackBoxChildren.length === 0) {
		return null;
	}

	const mdiaBox = trackBoxChildren.find(
		(c) => c.type === 'regular-box' && c.boxType === 'mdia',
	);
	if (
		!mdiaBox ||
		mdiaBox.type !== 'regular-box' ||
		mdiaBox.boxType !== 'mdia'
	) {
		return null;
	}

	const minfBox = mdiaBox.children.find(
		(c) => c.type === 'regular-box' && c.boxType === 'minf',
	);
	if (
		!minfBox ||
		minfBox.type !== 'regular-box' ||
		minfBox.boxType !== 'minf'
	) {
		return null;
	}

	const stblBox = minfBox.children.find(
		(c) => c.type === 'regular-box' && c.boxType === 'stbl',
	);
	if (
		!stblBox ||
		stblBox.type !== 'regular-box' ||
		stblBox.boxType !== 'stbl'
	) {
		return null;
	}

	const sttsBox = stblBox.children.find((c) => c.type === 'stts-box');
	if (!sttsBox || sttsBox.type !== 'stts-box') {
		return null;
	}

	return calculateFps(sttsBox, timeScale);
};

export const hasFps = (boxes: AnySegment[]): boolean => {
	try {
		return getFps(boxes) !== null;
	} catch (err) {
		return false;
	}
};
