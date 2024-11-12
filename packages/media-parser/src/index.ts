import {createMatroskaMedia} from './create/create-matroska-media';
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
	ParseMediaOptions,
	ParseMediaResult,
	TracksField,
} from './options';
export {parseMedia} from './parse-media';
export {
	AudioOrVideoSample,
	AudioSample,
	OnAudioSample,
	OnAudioTrack,
	OnVideoSample,
	OnVideoTrack,
	VideoSample,
} from './webcodec-sample-types';

export type {MediaFn} from './create/create-matroska-media';
export {Dimensions} from './get-dimensions';
export type {ReaderInterface} from './readers/reader';

export type {LogLevel};

export const MediaParserInternals = {
	createMatroskaMedia,
	Log,
};
