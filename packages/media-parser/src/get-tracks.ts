import {makeBaseMediaTrack} from './boxes/iso-base-media/make-track';
import type {MoovBox} from './boxes/iso-base-media/moov/moov';
import {getTracksFromMatroska} from './boxes/webm/get-ready-tracks';
import {getMainSegment} from './boxes/webm/traversal';
import type {SamplePosition} from './get-sample-positions';
import type {AnySegment} from './parse-result';
import type {ParserState} from './parser-state';
import {getMoovBox, getMvhdBox, getTracksSegment, getTraks} from './traversal';

type SampleAspectRatio = {
	numerator: number;
	denominator: number;
};

export type VideoTrack = {
	type: 'video';
	samplePositions: SamplePosition[] | null;
	trackId: number;
	description: Uint8Array | undefined;
	timescale: number;
	codec: string;
	sampleAspectRatio: SampleAspectRatio;
	width: number;
	height: number;
	displayAspectWidth: number;
	displayAspectHeight: number;
	codedWidth: number;
	codedHeight: number;
	rotation: number;
};

export type AudioTrack = {
	type: 'audio';
	samplePositions: SamplePosition[] | null;
	trackId: number;
	timescale: number;
	codec: string;
	numberOfChannels: number;
	sampleRate: number;
	description: Uint8Array | undefined;
};

export type OtherTrack = {
	type: 'other';
	samplePositions: SamplePosition[] | null;
	trackId: number;
	timescale: number;
};

export type Track = VideoTrack | AudioTrack | OtherTrack;

export const getNumberOfTracks = (moovBox: MoovBox): number => {
	const mvHdBox = getMvhdBox(moovBox);
	if (!mvHdBox) {
		return 0;
	}

	return mvHdBox.nextTrackId - 1;
};

export const hasTracks = (segments: AnySegment[]): boolean => {
	const mainSegment = getMainSegment(segments);

	if (mainSegment) {
		return getTracksSegment(mainSegment) !== null;
	}

	const moovBox = getMoovBox(segments);

	if (!moovBox) {
		return false;
	}

	const numberOfTracks = getNumberOfTracks(moovBox);
	const tracks = getTraks(moovBox);

	return tracks.length === numberOfTracks;
};

export const getTracks = (
	segments: AnySegment[],
	state: ParserState,
): {
	videoTracks: VideoTrack[];
	audioTracks: AudioTrack[];
	otherTracks: OtherTrack[];
} => {
	const videoTracks: VideoTrack[] = [];
	const audioTracks: AudioTrack[] = [];
	const otherTracks: OtherTrack[] = [];

	const mainSegment = segments.find((s) => s.type === 'main-segment');
	if (mainSegment && mainSegment.type === 'main-segment') {
		const matroskaTracks = getTracksFromMatroska(
			mainSegment,
			state.getTimescale(),
		);

		for (const track of matroskaTracks) {
			if (track.type === 'video') {
				videoTracks.push(track);
			} else if (track.type === 'audio') {
				audioTracks.push(track);
			} else if (track.type === 'other') {
				otherTracks.push(track);
			}
		}

		return {
			videoTracks,
			audioTracks,
			otherTracks,
		};
	}

	const moovBox = getMoovBox(segments);
	if (!moovBox) {
		return {
			videoTracks,
			audioTracks,
			otherTracks,
		};
	}

	const tracks = getTraks(moovBox);

	for (const trakBox of tracks) {
		const track = makeBaseMediaTrack(trakBox);
		if (!track) {
			continue;
		}

		if (track.type === 'video') {
			videoTracks.push(track);
		} else if (track.type === 'audio') {
			audioTracks.push(track);
		} else if (track.type === 'other') {
			otherTracks.push(track);
		}
	}

	return {
		videoTracks,
		audioTracks,
		otherTracks,
	};
};
