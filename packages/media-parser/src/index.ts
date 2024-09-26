import {createMedia} from './create/create-media';

export {
	AudioTrack,
	MediaParserAudioCodec,
	MediaParserVideoCodec,
	OtherTrack,
	Track,
	VideoTrack,
	VideoTrackColorParams,
} from './get-tracks';

export type {
	Options,
	ParseMediaContainer,
	ParseMediaFields,
	ParseMediaResult,
	TracksField,
} from './options';
export {parseMedia} from './parse-media';
export {
	AudioSample,
	OnAudioSample,
	OnAudioTrack,
	OnVideoSample,
	OnVideoTrack,
	VideoSample,
} from './webcodec-sample-types';

export type {MediaFn} from './create/create-media';
export {Dimensions} from './get-dimensions';
export type {ReaderInterface} from './readers/reader';

export const MediaParserInternals = {
	createMedia,
};
