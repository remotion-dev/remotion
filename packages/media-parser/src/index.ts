import {IoEventEmitter} from './create/event-emitter';
import {createIsoBaseMedia} from './create/iso-base-media/create-iso-base-media';
import {createMatroskaMedia} from './create/matroska/create-matroska-media';
import type {ProgressTracker} from './create/progress-tracker';
import {makeProgressTracker} from './create/progress-tracker';
import {createWav} from './create/wav/create-wav';
import {
	withResolvers,
	withResolversAndWaitForReturn,
} from './create/with-resolvers';
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

export const MediaParserInternals = {
	createMatroskaMedia,
	createIsoBaseMedia,
	createWav,
	Log,
	IoEventEmitter,
	makeProgressTracker,
	withResolvers,
	withResolversAndWaitForReturn,
};

export type {IoEventEmitter, LogLevel, ProgressTracker};

export {VERSION} from './version';
