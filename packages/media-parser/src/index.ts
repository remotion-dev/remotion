import {createIsoBaseMedia} from './create/iso-base-media/create-iso-base-media';
import {createMatroskaMedia} from './create/matroska/create-matroska-media';
import type {LogLevel} from './log';
import {Log} from './log';
export {WriterInterface} from './writers/writer';

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
	ParseMediaOnProgress,
	ParseMediaOptions,
	ParseMediaProgress,
	ParseMediaResult,
	TracksField,
} from './options';
export {parseMedia} from './parse-media';
export {
	AudioOrVideoSample,
	OnAudioSample,
	OnAudioTrack,
	OnVideoSample,
	OnVideoTrack,
} from './webcodec-sample-types';

export type {MediaFn} from './create/media-fn';
export {Dimensions} from './get-dimensions';
export type {ReaderInterface} from './readers/reader';

export type {LogLevel};

export const MediaParserInternals = {
	createMatroskaMedia,
	createIsoBaseMedia,
	Log,
};

export {VERSION} from './version';
