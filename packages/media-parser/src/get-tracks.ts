import type {
	MatrixCoefficients,
	Primaries,
	TransferCharacteristics,
} from './containers/avc/color';
import {makeBaseMediaTrack} from './containers/iso-base-media/make-track';
import type {MoovBox} from './containers/iso-base-media/moov/moov';
import type {TrakBox} from './containers/iso-base-media/trak/trak';
import {
	getMoovBox,
	getMvhdBox,
	getTraks,
} from './containers/iso-base-media/traversal';
import {getTracksFromMp3OrWavOrAac} from './containers/mp3/get-tracks-from-mp3';
import type {AllTracks} from './containers/riff/get-tracks-from-avi';
import {
	getTracksFromAvi,
	hasAllTracksFromAvi,
} from './containers/riff/get-tracks-from-avi';
import {
	getTracksFromTransportStream,
	hasAllTracksFromTransportStream,
} from './containers/transport-stream/get-tracks';
import {getTracksFromMatroska} from './containers/webm/get-ready-tracks';
import type {MatroskaSegment} from './containers/webm/segments';
import {getMainSegment, getTracksSegment} from './containers/webm/traversal';
import type {ParserState} from './state/parser-state';

type SampleAspectRatio = {
	numerator: number;
	denominator: number;
};

export type VideoTrackColorParams = {
	transferCharacteristics: TransferCharacteristics | null;
	matrixCoefficients: MatrixCoefficients | null;
	primaries: Primaries | null;
	fullRange: boolean | null;
};

export type MediaParserVideoCodec =
	| 'vp8'
	| 'vp9'
	| 'h264'
	| 'av1'
	| 'h265'
	| 'prores';

export type MediaParserAudioCodec =
	| 'opus'
	| 'aac'
	| 'mp3'
	| 'ac3'
	| 'vorbis'
	| 'pcm-u8'
	| 'pcm-s16'
	| 'pcm-s24'
	| 'pcm-s32'
	| 'pcm-f32'
	| 'flac'
	| 'aiff';

export type VideoTrack = {
	type: 'video';
	trackId: number;
	description: Uint8Array | undefined;
	timescale: number;
	codec: string;
	codecWithoutConfig: MediaParserVideoCodec;
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
	fps: number | null;
};

export type AudioTrack = {
	type: 'audio';
	trackId: number;
	timescale: number;
	codec: string;
	codecWithoutConfig: MediaParserAudioCodec;
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

export const isoBaseMediaHasTracks = (state: ParserState) => {
	return Boolean(getMoovBox(state));
};

export const getHasTracks = (state: ParserState): boolean => {
	const structure = state.getStructure();
	if (structure.type === 'matroska') {
		const mainSegment = getMainSegment(structure.boxes);
		if (!mainSegment) {
			return false;
		}

		return getTracksSegment(mainSegment) !== null;
	}

	if (structure.type === 'iso-base-media') {
		return isoBaseMediaHasTracks(state);
	}

	if (structure.type === 'riff') {
		return hasAllTracksFromAvi(state);
	}

	if (structure.type === 'transport-stream') {
		return hasAllTracksFromTransportStream(state);
	}

	if (structure.type === 'mp3') {
		return state.callbacks.tracks.getTracks().length > 0;
	}

	if (structure.type === 'wav') {
		return state.callbacks.tracks.hasAllTracks();
	}

	if (structure.type === 'aac') {
		return state.callbacks.tracks.hasAllTracks();
	}

	if (structure.type === 'flac') {
		return state.callbacks.tracks.hasAllTracks();
	}

	throw new Error('Unknown container ' + (structure satisfies never));
};

const getTracksFromMa = (
	segments: MatroskaSegment[],
	state: ParserState,
): AllTracks => {
	const videoTracks: VideoTrack[] = [];
	const audioTracks: AudioTrack[] = [];
	const otherTracks: OtherTrack[] = [];

	const mainSegment = segments.find((s) => s.type === 'Segment');
	if (!mainSegment) {
		throw new Error('No main segment found');
	}

	const matroskaTracks = getTracksFromMatroska(
		mainSegment,
		state.webm.getTimescale(),
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
};

export const getTracksFromIsoBaseMedia = (state: ParserState) => {
	const videoTracks: VideoTrack[] = [];
	const audioTracks: AudioTrack[] = [];
	const otherTracks: OtherTrack[] = [];

	const moovBox = getMoovBox(state);
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

export const getTracks = (state: ParserState): AllTracks => {
	const structure = state.getStructure();
	if (structure.type === 'matroska') {
		return getTracksFromMa(structure.boxes, state);
	}

	if (structure.type === 'iso-base-media') {
		return getTracksFromIsoBaseMedia(state);
	}

	if (structure.type === 'riff') {
		return getTracksFromAvi(structure, state);
	}

	if (structure.type === 'transport-stream') {
		return getTracksFromTransportStream(state);
	}

	if (
		structure.type === 'mp3' ||
		structure.type === 'wav' ||
		structure.type === 'flac' ||
		structure.type === 'aac'
	) {
		return getTracksFromMp3OrWavOrAac(state);
	}

	throw new Error(`Unknown container${structure satisfies never}`);
};
