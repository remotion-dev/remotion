import type {SttsBox} from './containers/iso-base-media/stsd/stts';
import type {TrakBox} from './containers/iso-base-media/trak/trak';
import {
	getMdhdBox,
	getMoovBox,
	getStsdBox,
	getSttsBox,
	getTraks,
} from './containers/iso-base-media/traversal';
import type {RiffStructure} from './containers/riff/riff-box';
import {getStrhBox, getStrlBoxes} from './containers/riff/traversal';
import {isAudioStructure} from './is-audio-structure';
import type {ParserState} from './state/parser-state';

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

	if (totalSamples === 0) {
		return null;
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

const getFpsFromIsoMaseMedia = (state: ParserState) => {
	const moovBox = getMoovBox(state);
	if (!moovBox) {
		return null;
	}

	const trackBoxes = getTraks(moovBox);

	const trackBox = trackBoxes.find(trakBoxContainsVideo);
	if (!trackBox) {
		return null;
	}

	return getFpsFromMp4TrakBox(trackBox);
};

const getFpsFromAvi = (structure: RiffStructure) => {
	const strl = getStrlBoxes(structure);

	for (const s of strl) {
		const strh = getStrhBox(s.children);
		if (!strh) {
			throw new Error('No strh box');
		}

		if (strh.fccType === 'auds') {
			continue;
		}

		return strh.rate;
	}

	return null;
};

export const getFps = (state: ParserState) => {
	const segments = state.getStructure();

	if (segments.type === 'iso-base-media') {
		return getFpsFromIsoMaseMedia(state);
	}

	if (segments.type === 'riff') {
		return getFpsFromAvi(segments);
	}

	// People need to get it from slowFps
	if (segments.type === 'matroska') {
		return null;
	}

	// People need to get it from slowFps
	if (segments.type === 'transport-stream') {
		return null;
	}

	// Same as m3u8
	if (segments.type === 'm3u') {
		return null;
	}

	if (
		segments.type === 'mp3' ||
		segments.type === 'wav' ||
		segments.type === 'flac' ||
		segments.type === 'aac'
	) {
		return null;
	}

	throw new Error(
		'Cannot get fps, not implemented: ' + (segments satisfies never),
	);
};

export const hasFpsSuitedForSlowFps = (state: ParserState): boolean => {
	try {
		return getFps(state) !== null;
	} catch {
		return false;
	}
};

export const hasFps = (state: ParserState): boolean => {
	// Matroska and Transport stream has no FPS metadata
	// Not bothering to parse
	// Users should use `slowFps` field
	// same goes for audio

	const structure = state.getStructure();

	if (isAudioStructure(structure)) {
		return true;
	}

	if (structure.type === 'matroska') {
		return true;
	}

	if (structure.type === 'transport-stream') {
		return true;
	}

	if (structure.type === 'm3u') {
		return true;
	}

	return hasFpsSuitedForSlowFps(state);
};
