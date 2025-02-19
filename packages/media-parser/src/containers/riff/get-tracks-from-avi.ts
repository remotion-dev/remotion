import {addAvcProfileToTrack} from '../../add-avc-profile-to-track';
import type {AudioTrack, OtherTrack, VideoTrack} from '../../get-tracks';
import type {ParserState} from '../../state/parser-state';
import type {
	RiffStructure,
	StrfBoxAudio,
	StrfBoxVideo,
	StrhBox,
} from './riff-box';
import {MEDIA_PARSER_RIFF_TIMESCALE} from './timescale';
import {getAvihBox, getStrhBox, getStrlBoxes} from './traversal';

export type AllTracks = {
	videoTracks: VideoTrack[];
	audioTracks: AudioTrack[];
	otherTracks: OtherTrack[];
};

export const TO_BE_OVERRIDDEN_LATER = 'to-be-overriden-later';

export const getNumberOfTracks = (structure: RiffStructure): number => {
	const avihBox = getAvihBox(structure);
	if (avihBox) {
		return avihBox.streams;
	}

	throw new Error('No avih box found');
};

export const makeAviAudioTrack = ({
	strf,
	index,
}: {
	strf: StrfBoxAudio;
	index: number;
}): AudioTrack => {
	// 255 = AAC
	if (strf.formatTag !== 255) {
		throw new Error(`Unsupported audio format ${strf.formatTag}`);
	}

	return {
		type: 'audio',
		codec: 'mp4a.40.2', // According to Claude 3.5 Sonnet
		codecPrivate: new Uint8Array([18, 16]),
		codecWithoutConfig: 'aac',
		description: new Uint8Array([18, 16]),
		numberOfChannels: strf.numberOfChannels,
		sampleRate: strf.sampleRate,
		timescale: MEDIA_PARSER_RIFF_TIMESCALE,
		trackId: index,
		trakBox: null,
	};
};

export const makeAviVideoTrack = ({
	strh,
	strf,
	index,
}: {
	strh: StrhBox;
	strf: StrfBoxVideo;
	index: number;
}): VideoTrack => {
	if (strh.handler !== 'H264') {
		throw new Error(`Unsupported video codec ${strh.handler}`);
	}

	return {
		codecPrivate: null,
		codec: TO_BE_OVERRIDDEN_LATER,
		codecWithoutConfig: 'h264',
		codedHeight: strf.height,
		codedWidth: strf.width,
		width: strf.width,
		height: strf.height,
		type: 'video',
		displayAspectHeight: strf.height,
		timescale: MEDIA_PARSER_RIFF_TIMESCALE,
		description: undefined,
		trackId: index,
		color: {
			fullRange: null,
			matrixCoefficients: null,
			primaries: null,
			transferCharacteristics: null,
		},
		displayAspectWidth: strf.width,
		trakBox: null,
		rotation: 0,
		sampleAspectRatio: {
			numerator: 1,
			denominator: 1,
		},
		fps: strh.rate / strh.scale,
	};
};

export const getTracksFromAvi = (
	structure: RiffStructure,
	state: ParserState,
): AllTracks => {
	const videoTracks: VideoTrack[] = [];
	const audioTracks: AudioTrack[] = [];
	const otherTracks: OtherTrack[] = [];

	const boxes = getStrlBoxes(structure);

	let i = 0;
	for (const box of boxes) {
		const strh = getStrhBox(box.children);
		if (!strh) {
			continue;
		}

		const {strf} = strh;

		if (strf.type === 'strf-box-video') {
			videoTracks.push(
				addAvcProfileToTrack(
					makeAviVideoTrack({strh, strf, index: i}),
					state.riff.getAvcProfile(),
				),
			);
		} else if (strh.fccType === 'auds') {
			audioTracks.push(makeAviAudioTrack({strf, index: i}));
		} else {
			throw new Error(`Unsupported track type ${strh.fccType}`);
		}

		i++;
	}

	return {audioTracks, otherTracks, videoTracks};
};

export const hasAllTracksFromAvi = (state: ParserState): boolean => {
	try {
		const structure = state.getRiffStructure();
		const numberOfTracks = getNumberOfTracks(structure);
		const tracks = getTracksFromAvi(structure, state);
		return (
			tracks.videoTracks.length +
				tracks.audioTracks.length +
				tracks.otherTracks.length ===
				numberOfTracks &&
			!tracks.videoTracks.find((t) => t.codec === TO_BE_OVERRIDDEN_LATER)
		);
	} catch {
		return false;
	}
};
