import {createMedia} from './create/create-media';
import type {LogLevel} from './log';
import {Log} from './log';

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
	ParseMediaDynamicOptions,
	ParseMediaFields,
	ParseMediaOptions,
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

export type {LogLevel};

export const MediaParserInternals = {
	createMedia,
	Log,
};
