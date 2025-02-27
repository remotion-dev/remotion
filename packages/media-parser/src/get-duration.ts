import {getDurationFromFlac} from './containers/flac/get-duration-from-flac';
import {getSamplePositionsFromTrack} from './containers/iso-base-media/get-sample-positions-from-track';
import type {TrakBox} from './containers/iso-base-media/trak/trak';
import {
	getMoofBoxes,
	getMoovBox,
	getMvhdBox,
} from './containers/iso-base-media/traversal';
import {getDurationFromM3u} from './containers/m3u/get-duration-from-m3u';
import {getDurationFromMp3} from './containers/mp3/get-duration';
import {getDurationFromAvi} from './containers/riff/get-duration';
import {getDurationFromWav} from './containers/wav/get-duration-from-wav';
import type {DurationSegment} from './containers/webm/segments/all-segments';
import {getHasTracks, getTracks} from './get-tracks';
import type {AnySegment} from './parse-result';
import type {ParserState} from './state/parser-state';

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

export const isMatroska = (boxes: AnySegment[]) => {
	const matroskaBox = boxes.find((b) => b.type === 'Segment');
	return matroskaBox;
};

const isoHasDuration = (parserState: ParserState) => {
	const structure = parserState.getIsoStructure();

	const moovBox = getMoovBox(parserState);
	if (!moovBox) {
		return false;
	}

	const mvhdBox = getMvhdBox(moovBox);

	if (!mvhdBox) {
		return false;
	}

	if (mvhdBox.type !== 'mvhd-box') {
		throw new Error('Expected mvhd-box');
	}

	if (mvhdBox.durationInSeconds > 0) {
		return true;
	}

	// Checking if this is a fragmented mp4
	const moofBoxes = getMoofBoxes(structure.boxes);
	const hasMvex = moovBox.children.some(
		(b) => b.type === 'regular-box' && b.boxType === 'mvex',
	);
	const isFragmented = moofBoxes.length > 0 || hasMvex;
	return !isFragmented;
};

const getDurationFromIsoBaseMedia = (parserState: ParserState) => {
	const structure = parserState.getIsoStructure();

	const moovBox = getMoovBox(parserState);
	if (!moovBox) {
		return null;
	}

	const moofBoxes = getMoofBoxes(structure.boxes);
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

	const tracks = getTracks(parserState);
	const allTracks = [
		...tracks.videoTracks,
		...tracks.audioTracks,
		...tracks.otherTracks,
	];
	const allSamples = allTracks.map((t) => {
		const {timescale: ts} = t;
		const samplePositions = getSamplePositionsFromTrack({
			trakBox: t.trakBox as TrakBox,
			moofBoxes,
		});

		const highest = samplePositions
			?.map((sp) => (sp.cts + sp.duration) / ts)
			.reduce((a, b) => Math.max(a, b), 0);

		return highest ?? 0;
	});

	const highestTimestamp = Math.max(...allSamples);

	return highestTimestamp;
};

export const getDuration = (parserState: ParserState): number | null => {
	const structure = parserState.getStructure();
	if (structure.type === 'matroska') {
		return getDurationFromMatroska(structure.boxes);
	}

	if (structure.type === 'iso-base-media') {
		return getDurationFromIsoBaseMedia(parserState);
	}

	if (structure.type === 'riff') {
		return getDurationFromAvi(structure);
	}

	if (structure.type === 'transport-stream') {
		return null;
	}

	if (structure.type === 'mp3') {
		return getDurationFromMp3(parserState);
	}

	if (structure.type === 'wav') {
		return getDurationFromWav(parserState);
	}

	if (structure.type === 'aac') {
		return null;
	}

	if (structure.type === 'flac') {
		return getDurationFromFlac(parserState);
	}

	if (structure.type === 'm3u') {
		return getDurationFromM3u(parserState);
	}

	throw new Error('Has no duration ' + (structure satisfies never));
};

// `duration` just grabs from metadata, and otherwise returns null
// Therefore just checking if we have tracks
export const hasDuration = (parserState: ParserState): boolean => {
	const structure = parserState.getStructureOrNull();
	if (structure === null) {
		return false;
	}

	if (structure.type === 'iso-base-media') {
		return isoHasDuration(parserState);
	}

	return getHasTracks(parserState);
};

// `slowDuration` goes through everything, and therefore is false
// Unless it it somewhere in the metadata and is non-null
export const hasSlowDuration = (parserState: ParserState): boolean => {
	try {
		return hasDuration(parserState) && getDuration(parserState) !== null;
	} catch {
		return false;
	}
};
