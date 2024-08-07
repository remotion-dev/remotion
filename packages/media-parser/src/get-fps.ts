import type {SttsBox} from './boxes/iso-base-media/stts/stts';
import type {AnySegment} from './parse-result';

const calculateFps = ({
	sttsBox,
	timeScale,
	durationInSamples,
}: {
	sttsBox: SttsBox;
	timeScale: number;
	durationInSamples: number;
}) => {
	let totalSamples = 0;

	for (const sample of sttsBox.sampleDistribution) {
		totalSamples += sample.sampleCount;
	}

	const durationInSeconds = durationInSamples / timeScale;
	const fps = totalSamples / durationInSeconds;

	return fps;
};

type TimescaleAndDuration = {
	timescale: number;
	duration: number;
};

export const trakBoxContainsAudio = (trakBox: AnySegment): boolean => {
	if (trakBox.type !== 'trak-box') {
		return false;
	}

	const {children} = trakBox;
	const mediaBoxes = children.filter(
		(c) => c.type === 'regular-box' && c.boxType === 'mdia',
	);
	if (!mediaBoxes || mediaBoxes.length === 0) {
		return false;
	}

	const firstMediaBox = mediaBoxes[0];
	if (
		firstMediaBox.type !== 'regular-box' ||
		firstMediaBox.boxType !== 'mdia'
	) {
		return false;
	}

	const minf = firstMediaBox.children.find(
		(c) => c.type === 'regular-box' && c.boxType === 'minf',
	);
	if (!minf || minf.type !== 'regular-box' || minf.boxType !== 'minf') {
		return false;
	}

	const stbl = minf.children.find(
		(c) => c.type === 'regular-box' && c.boxType === 'stbl',
	);
	if (!stbl || stbl.type !== 'regular-box' || stbl.boxType !== 'stbl') {
		return false;
	}

	const stsd = stbl.children.find((c) => c.type === 'stsd-box');
	if (!stsd || stsd.type !== 'stsd-box') {
		return false;
	}

	const videoSample = stsd.samples.find((s) => s.type === 'audio');
	if (!videoSample || videoSample.type !== 'audio') {
		return false;
	}

	return true;
};

export const trakBoxContainsVideo = (trakBox: AnySegment): boolean => {
	if (trakBox.type !== 'trak-box') {
		return false;
	}

	const {children} = trakBox;
	const mediaBoxes = children.filter(
		(c) => c.type === 'regular-box' && c.boxType === 'mdia',
	);
	if (!mediaBoxes || mediaBoxes.length === 0) {
		return false;
	}

	const firstMediaBox = mediaBoxes[0];
	if (
		firstMediaBox.type !== 'regular-box' ||
		firstMediaBox.boxType !== 'mdia'
	) {
		return false;
	}

	const minf = firstMediaBox.children.find(
		(c) => c.type === 'regular-box' && c.boxType === 'minf',
	);
	if (!minf || minf.type !== 'regular-box' || minf.boxType !== 'minf') {
		return false;
	}

	const stbl = minf.children.find(
		(c) => c.type === 'regular-box' && c.boxType === 'stbl',
	);
	if (!stbl || stbl.type !== 'regular-box' || stbl.boxType !== 'stbl') {
		return false;
	}

	const stsd = stbl.children.find((c) => c.type === 'stsd-box');
	if (!stsd || stsd.type !== 'stsd-box') {
		return false;
	}

	const videoSample = stsd.samples.find((s) => s.type === 'video');
	if (!videoSample || videoSample.type !== 'video') {
		return false;
	}

	return true;
};

export const getTimescaleAndDuration = (
	boxes: AnySegment[],
): TimescaleAndDuration | null => {
	const moovBox = boxes.find((s) => s.type === 'moov-box');
	if (!moovBox || moovBox.type !== 'moov-box') {
		return null;
	}

	const {children} = moovBox;
	const trackBoxes = children.filter((c) => c.type === 'trak-box');
	if (!trackBoxes || trackBoxes.length === 0) {
		return null;
	}

	const trackBox = trackBoxes.find(trakBoxContainsVideo);
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

	const mdhdBox = mdiaBox?.children.find((c) => c.type === 'mdhd-box');
	if (mdhdBox && mdhdBox.type === 'mdhd-box') {
		return {timescale: mdhdBox.timescale, duration: mdhdBox.duration};
	}

	const mvhdBox = moovBox.children.find((c) => c.type === 'mvhd-box');
	if (!mvhdBox || mvhdBox.type !== 'mvhd-box') {
		return null;
	}

	const {timeScale, durationInUnits} = mvhdBox;
	return {timescale: timeScale, duration: durationInUnits};
};

export const getFps = (segments: AnySegment[]) => {
	const timescaleAndDuration = getTimescaleAndDuration(segments);
	if (!timescaleAndDuration) {
		return null;
	}

	const moovBox = segments.find((s) => s.type === 'moov-box');
	if (!moovBox || moovBox.type !== 'moov-box') {
		return null;
	}

	const mvhdBox = moovBox.children.find((c) => c.type === 'mvhd-box');
	if (!mvhdBox || mvhdBox.type !== 'mvhd-box') {
		return null;
	}

	const {children} = moovBox;
	const trackBoxes = children.filter((c) => c.type === 'trak-box');
	if (!trackBoxes || trackBoxes.length === 0) {
		return null;
	}

	const trackBox = trackBoxes.find(trakBoxContainsVideo);
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

	return calculateFps({
		sttsBox,
		timeScale: timescaleAndDuration.timescale,
		durationInSamples: timescaleAndDuration.duration,
	});
};

export const hasFps = (boxes: AnySegment[]): boolean => {
	try {
		return getFps(boxes) !== null;
	} catch (err) {
		return false;
	}
};
