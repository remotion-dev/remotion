import {createAacCodecPrivate} from './aac-codecprivate';
import {getArrayBufferIterator} from './buffer-iterator';
import {parseFtyp} from './containers/iso-base-media/ftyp';
import {parseMvhd} from './containers/iso-base-media/mvhd';
import {processIsoFormatBox} from './containers/iso-base-media/stsd/samples';
import {parseStsd} from './containers/iso-base-media/stsd/stsd';
import {parseTkhd} from './containers/iso-base-media/tkhd';
import {parseEbml} from './containers/webm/parse-ebml';
import {
	ebmlMap,
	matroskaElements,
} from './containers/webm/segments/all-segments';
import type {LogLevel} from './log';
import {Log} from './log';
import {makeParserState} from './state/parser-state';
export {MatroskaSegment} from './containers/webm/segments';
export {MatroskaElement} from './containers/webm/segments/all-segments';
export {
	IsAGifError,
	IsAnImageError,
	IsAnUnsupportedAudioTypeError,
	IsAnUnsupportedFileTypeError,
	IsAPdfError,
} from './errors';
export type {SamplePosition} from './get-sample-positions';
export {MetadataEntry} from './metadata/get-metadata';
export {MediaParserKeyframe, ParseMediaSrc} from './options';
export type {MediaParserEmbeddedImage} from './state/images';

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
	MediaParserContainer,
	Options,
	ParseMediaCallbacks,
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

export type {CreateContent, Writer, WriterInterface} from './writers/writer';

export const MediaParserInternals = {
	Log,
	createAacCodecPrivate,
	matroskaElements,
	ebmlMap,
	parseTkhd,
	getArrayBufferIterator,
	parseStsd,
	makeParserState,
	processSample: processIsoFormatBox,
	parseFtyp,
	parseEbml,
	parseMvhd,
};

export type {Prettify} from './containers/webm/parse-ebml';
export type {
	Ebml,
	EbmlValue,
	FloatWithSize,
	MainSegment,
	PossibleEbml,
	TrackEntry,
	UintWithSize,
} from './containers/webm/segments/all-segments';
export type {LogLevel};

export {VERSION} from './version';
