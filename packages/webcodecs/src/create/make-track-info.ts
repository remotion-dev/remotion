import type {
	MediaParserAdvancedColor,
	MediaParserAudioCodec,
	MediaParserVideoCodec,
} from '@remotion/media-parser';

export type MakeTrackAudio = {
	trackNumber: number;
	codec: MediaParserAudioCodec;
	numberOfChannels: number;
	sampleRate: number;
	type: 'audio';
	codecPrivate: Uint8Array | null;
	timescale: number;
};

export type MakeTrackVideo = {
	color: MediaParserAdvancedColor;
	width: number;
	height: number;
	trackNumber: number;
	codec: MediaParserVideoCodec;
	type: 'video';
	codecPrivate: Uint8Array | null;
	timescale: number;
};
