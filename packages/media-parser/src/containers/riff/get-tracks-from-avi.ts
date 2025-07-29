import {addAvcProfileToTrack} from '../../add-avc-profile-to-track';
import type {
	MediaParserAudioTrack,
	MediaParserTrack,
	MediaParserVideoTrack,
} from '../../get-tracks';
import type {ParserState} from '../../state/parser-state';
import {WEBCODECS_TIMESCALE} from '../../webcodecs-timescale';
import type {
	RiffStructure,
	StrfBoxAudio,
	StrfBoxVideo,
	StrhBox,
} from './riff-box';
import {MEDIA_PARSER_RIFF_TIMESCALE} from './timescale';
import {getAvihBox, getStrhBox, getStrlBoxes} from './traversal';

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
}): MediaParserAudioTrack => {
	// 255 = AAC
	if (strf.formatTag !== 255) {
		throw new Error(`Unsupported audio format ${strf.formatTag}`);
	}

	return {
		type: 'audio',
		codec: 'mp4a.40.2', // According to Claude 3.5 Sonnet
		codecData: {type: 'aac-config', data: new Uint8Array([18, 16])},
		codecEnum: 'aac',
		description: new Uint8Array([18, 16]),
		numberOfChannels: strf.numberOfChannels,
		sampleRate: strf.sampleRate,
		originalTimescale: MEDIA_PARSER_RIFF_TIMESCALE,
		trackId: index,
		startInSeconds: 0,
		timescale: WEBCODECS_TIMESCALE,
		trackMediaTimeOffsetInTrackTimescale: 0,
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
}): MediaParserVideoTrack => {
	if (strh.handler !== 'H264') {
		throw new Error(`Unsupported video codec ${strh.handler}`);
	}

	return {
		codecData: null,
		codec: TO_BE_OVERRIDDEN_LATER,
		codecEnum: 'h264',
		codedHeight: strf.height,
		codedWidth: strf.width,
		width: strf.width,
		height: strf.height,
		type: 'video',
		displayAspectHeight: strf.height,
		originalTimescale: MEDIA_PARSER_RIFF_TIMESCALE,
		description: undefined,
		m3uStreamFormat: null,
		trackId: index,
		colorSpace: {
			fullRange: null,
			matrix: null,
			primaries: null,
			transfer: null,
		},
		advancedColor: {
			fullRange: null,
			matrix: null,
			primaries: null,
			transfer: null,
		},
		displayAspectWidth: strf.width,
		rotation: 0,
		sampleAspectRatio: {
			numerator: 1,
			denominator: 1,
		},
		fps: strh.rate / strh.scale,
		startInSeconds: 0,
		timescale: WEBCODECS_TIMESCALE,
		trackMediaTimeOffsetInTrackTimescale: 0,
	};
};

export const getTracksFromAvi = (
	structure: RiffStructure,
	state: ParserState,
): MediaParserTrack[] => {
	const tracks: MediaParserTrack[] = [];

	const boxes = getStrlBoxes(structure);

	let i = 0;
	for (const box of boxes) {
		const strh = getStrhBox(box.children);
		if (!strh) {
			continue;
		}

		const {strf} = strh;

		if (strf.type === 'strf-box-video') {
			tracks.push(
				addAvcProfileToTrack(
					makeAviVideoTrack({strh, strf, index: i}),
					state.riff.getAvcProfile(),
				),
			);
		} else if (strh.fccType === 'auds') {
			tracks.push(makeAviAudioTrack({strf, index: i}));
		} else {
			throw new Error(`Unsupported track type ${strh.fccType}`);
		}

		i++;
	}

	return tracks;
};

export const hasAllTracksFromAvi = (state: ParserState): boolean => {
	try {
		const structure = state.structure.getRiffStructure();
		const numberOfTracks = getNumberOfTracks(structure);
		const tracks = getTracksFromAvi(structure, state);
		return (
			tracks.length === numberOfTracks &&
			!tracks.find(
				(t) => t.type === 'video' && t.codec === TO_BE_OVERRIDDEN_LATER,
			)
		);
	} catch {
		return false;
	}
};
