import {getSamplePositionsFromTrack} from './boxes/iso-base-media/get-sample-positions-from-track';
import type {TrakBox} from './boxes/iso-base-media/trak/trak';
import {
	getMoofBox,
	getMoovBox,
	getMvhdBox,
} from './boxes/iso-base-media/traversal';
import {getStrhBox, getStrlBoxes} from './boxes/riff/traversal';
import type {DurationSegment} from './boxes/webm/segments/all-segments';
import {getTracks, hasTracks} from './get-tracks';
import type {
	AnySegment,
	IsoBaseMediaStructure,
	RiffStructure,
	Structure,
} from './parse-result';
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

const getDurationFromIsoBaseMedia = (
	structure: IsoBaseMediaStructure,
	parserState: ParserState,
) => {
	const moovBox = getMoovBox(structure.boxes);
	if (!moovBox) {
		return null;
	}

	const moofBox = getMoofBox(structure.boxes);
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

	const tracks = getTracks(structure, parserState);
	const allTracks = [
		...tracks.videoTracks,
		...tracks.audioTracks,
		...tracks.otherTracks,
	];
	const allSamples = allTracks.map((t) => {
		const {timescale: ts} = t;
		const samplePositions = getSamplePositionsFromTrack(
			t.trakBox as TrakBox,
			moofBox,
		);

		const highest = samplePositions
			?.map((sp) => (sp.cts + sp.duration) / ts)
			.reduce((a, b) => Math.max(a, b), 0);
		return highest ?? 0;
	});
	const highestTimestamp = Math.max(...allSamples);
	return highestTimestamp;
};

const getDurationFromAvi = (structure: RiffStructure) => {
	const strl = getStrlBoxes(structure);

	const lengths: number[] = [];
	for (const s of strl) {
		const strh = getStrhBox(s.children);
		if (!strh) {
			throw new Error('No strh box');
		}

		const samplesPerSecond = strh.rate / strh.scale;

		const streamLength = strh.length / samplesPerSecond;
		lengths.push(streamLength);
	}

	return Math.max(...lengths);
};

export const getDuration = (
	structure: Structure,
	parserState: ParserState,
): number | null => {
	if (structure.type === 'matroska') {
		return getDurationFromMatroska(structure.boxes);
	}

	if (structure.type === 'iso-base-media') {
		return getDurationFromIsoBaseMedia(structure, parserState);
	}

	if (structure.type === 'riff') {
		return getDurationFromAvi(structure);
	}

	if (structure.type === 'transport-stream') {
		return null;
	}

	throw new Error('Has no duration ' + (structure satisfies never));
};

// `duration` just grabs from metadata, and otherwise returns null
// Therefore just checking if we have tracks
export const hasDuration = (
	structure: Structure,
	parserState: ParserState,
): boolean => {
	return hasTracks(structure, parserState);
};

// `slowDuration` does through everything, and therefore is false
// Unless it it somewhere in the metadata and is non-null
export const hasSlowDuration = (
	structure: Structure,
	parserState: ParserState,
): boolean => {
	try {
		return getDuration(structure, parserState) !== null;
	} catch {
		return false;
	}
};
