import {createAacCodecPrivate} from './aac-codecprivate';
import {parseFtyp} from './boxes/iso-base-media/ftyp';
import {parseMvhd} from './boxes/iso-base-media/mvhd';
import {processSample} from './boxes/iso-base-media/stsd/samples';
import {parseStsd} from './boxes/iso-base-media/stsd/stsd';
import {parseTkhd} from './boxes/iso-base-media/tkhd';
import {parseEbml} from './boxes/webm/parse-ebml';
import {ebmlMap, matroskaElements} from './boxes/webm/segments/all-segments';
import {getArrayBufferIterator} from './buffer-iterator';
import type {LogLevel} from './log';
import {Log} from './log';
import {makeParserState} from './state/parser-state';
export {MatroskaSegment} from './boxes/webm/segments';
export {MatroskaElement} from './boxes/webm/segments/all-segments';
export {
	IsAGifError,
	IsAnImageError,
	IsAnUnsupportedAudioTypeError,
	IsAnUnsupportedFileTypeError,
	IsAPdfError,
} from './errors';
export type {SamplePosition} from './get-sample-positions';
export {MetadataEntry} from './metadata/get-metadata';
export {MediaParserKeyframe} from './options';

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

export {Dimensions} from './get-dimensions';
export {MediaParserLocation} from './get-location';
export type {ReaderInterface} from './readers/reader';

export const MediaParserInternals = {
	Log,
	createAacCodecPrivate,
	matroskaElements,
	ebmlMap,
	parseTkhd,
	getArrayBufferIterator,
	parseStsd,
	makeParserState,
	processSample,
	parseFtyp,
	parseEbml,
	parseMvhd,
};

export type {Prettify} from './boxes/webm/parse-ebml';
export type {
	Ebml,
	EbmlValue,
	FloatWithSize,
	MainSegment,
	PossibleEbml,
	TrackEntry,
	UintWithSize,
} from './boxes/webm/segments/all-segments';
export type {LogLevel};

export {VERSION} from './version';
