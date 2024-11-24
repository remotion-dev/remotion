import type {SttsBox} from './boxes/iso-base-media/stsd/stts';
import type {TrakBox} from './boxes/iso-base-media/trak/trak';
import {
	getMdhdBox,
	getMoovBox,
	getStsdBox,
	getSttsBox,
	getTraks,
} from './boxes/iso-base-media/traversal';
import type {Structure} from './parse-result';

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

export const trakBoxContainsAudio = (trakBox: TrakBox): boolean => {
	const stsd = getStsdBox(trakBox);
	if (!stsd) {
		return false;
	}

	const videoSample = stsd.samples.find((s) => s.type === 'audio');
	if (!videoSample || videoSample.type !== 'audio') {
		return false;
	}

	return true;
};

export const trakBoxContainsVideo = (trakBox: TrakBox): boolean => {
	const stsd = getStsdBox(trakBox);
	if (!stsd) {
		return false;
	}

	const videoSample = stsd.samples.find((s) => s.type === 'video');
	if (!videoSample || videoSample.type !== 'video') {
		return false;
	}

	return true;
};

export const getTimescaleAndDuration = (
	trakBox: TrakBox,
): TimescaleAndDuration | null => {
	const mdhdBox = getMdhdBox(trakBox);
	if (mdhdBox) {
		return {timescale: mdhdBox.timescale, duration: mdhdBox.duration};
	}

	return null;
};

export const getFpsFromMp4TrakBox = (trakBox: TrakBox) => {
	const timescaleAndDuration = getTimescaleAndDuration(trakBox);
	if (!timescaleAndDuration) {
		return null;
	}

	const sttsBox = getSttsBox(trakBox);
	if (!sttsBox) {
		return null;
	}

	return calculateFps({
		sttsBox,
		timeScale: timescaleAndDuration.timescale,
		durationInSamples: timescaleAndDuration.duration,
	});
};

export const getFps = (segments: Structure) => {
	if (segments.type === 'iso-base-media') {
		const moovBox = getMoovBox(segments.boxes);
		if (!moovBox) {
			return null;
		}

		const trackBoxes = getTraks(moovBox);

		const trackBox = trackBoxes.find(trakBoxContainsVideo);
		if (!trackBox) {
			return null;
		}

		return getFpsFromMp4TrakBox(trackBox);
	}

	// TODO: Matroska doesn't have Matroska
	if (segments.type === 'matroska') {
		return null;
	}

	throw new Error('Cannot get fps, not implemented');
};

export const hasFps = (boxes: Structure): boolean => {
	try {
		// Matroska has no FPS metadata
		// Not bothering to parse
		// Idea: `guaranteedFps` field
		if (boxes.type === 'matroska') {
			return true;
		}

		return getFps(boxes) !== null;
	} catch {
		return false;
	}
};
