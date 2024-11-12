import type {
	MediaParserAudioCodec,
	MediaParserVideoCodec,
	VideoTrackColorParams,
} from '../get-tracks';

export type MakeTrackAudio = {
	trackNumber: number;
	codec: MediaParserAudioCodec;
	numberOfChannels: number;
	sampleRate: number;
	type: 'audio';
	codecPrivate: Uint8Array | null;
};

export type MakeTrackVideo = {
	color: VideoTrackColorParams;
	width: number;
	height: number;
	trackNumber: number;
	codec: MediaParserVideoCodec;
	type: 'video';
	codecPrivate: Uint8Array | null;
};
