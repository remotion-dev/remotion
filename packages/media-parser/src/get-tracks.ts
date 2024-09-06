import {makeBaseMediaTrack} from './boxes/iso-base-media/make-track';
import type {MoovBox} from './boxes/iso-base-media/moov/moov';
import type {TrakBox} from './boxes/iso-base-media/trak/trak';
import {
	getMoovBox,
	getMvhdBox,
	getTraks,
} from './boxes/iso-base-media/traversal';
import {getTracksFromMatroska} from './boxes/webm/get-ready-tracks';
import {getMainSegment, getTracksSegment} from './boxes/webm/traversal';
import type {AnySegment} from './parse-result';
import type {ParserState} from './parser-state';

type SampleAspectRatio = {
	numerator: number;
	denominator: number;
};

export type VideoTrackColorParams = {
	transferCharacteristics: 'bt709' | 'smpte170m' | 'iec61966-2-1' | null;
	matrixCoefficients: 'bt709' | 'bt470bg' | 'rgb' | 'smpte170m' | null;
	primaries: 'bt709' | 'smpte170m' | 'bt470bg' | null;
	fullRange: boolean | null;
};

export type VideoTrack = {
	type: 'video';
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
	trakBox: TrakBox | null;
	codecPrivate: Uint8Array | null;
	color: VideoTrackColorParams;
};

export type AudioTrack = {
	type: 'audio';
	trackId: number;
	timescale: number;
	codec: string;
	numberOfChannels: number;
	sampleRate: number;
	description: Uint8Array | undefined;
	trakBox: TrakBox | null;
	codecPrivate: Uint8Array | null;
};

export type OtherTrack = {
	type: 'other';
	trackId: number;
	timescale: number;
	trakBox: TrakBox | null;
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

	const mainSegment = segments.find((s) => s.type === 'Segment');
	if (mainSegment && mainSegment.type === 'Segment') {
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
