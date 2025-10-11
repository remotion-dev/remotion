import {createAacCodecPrivate} from './aac-codecprivate';
import {parseFtyp} from './containers/iso-base-media/ftyp';
import {parseMvhd} from './containers/iso-base-media/moov/mvhd';
import {processIsoFormatBox} from './containers/iso-base-media/stsd/samples';
import {parseStsd} from './containers/iso-base-media/stsd/stsd';
import {parseTkhd} from './containers/iso-base-media/tkhd';
import {parseEbml} from './containers/webm/parse-ebml';
import type {MatroskaSegment} from './containers/webm/segments';
import type {
	Ebml,
	EbmlValue,
	FloatWithSize,
	MainSegment,
	MatroskaElement,
	PossibleEbml,
	TrackEntry,
	UintWithSize,
} from './containers/webm/segments/all-segments';
import {
	ebmlMap,
	matroskaElements,
} from './containers/webm/segments/all-segments';
import type {SamplePosition} from './get-sample-positions';
import {internalParseMedia} from './internal-parse-media';
import {getArrayBufferIterator} from './iterator/buffer-iterator';
import type {MediaParserLogLevel} from './log';
import {Log} from './log';
import type {ParseMediaCallbacks} from './options';
import {fieldsNeedSamplesMap} from './state/need-samples-for-fields';
import {makeParserState} from './state/parser-state';
export type {ParseMedia, ParseMediaCallbacks} from './options';

export {parseMedia} from './parse-media';

export {
	hasBeenAborted,
	IsAnImageError,
	IsAnUnsupportedFileTypeError,
	IsAPdfError,
	MediaParserAbortError,
} from './errors';
export type {
	MediaParserAdvancedColor,
	MediaParserAudioCodec,
	MediaParserAudioTrack,
	MediaParserOtherTrack,
	MediaParserTrack,
	MediaParserVideoCodec,
	MediaParserVideoTrack,
} from './get-tracks';

export type {
	MediaParserMatrixCoefficients,
	MediaParserPrimaries,
	MediaParserTransferCharacteristics,
} from './containers/avc/color';

export type {MediaParserMetadataEntry} from './metadata/get-metadata';
export type {MediaParserKeyframe, ParseMediaSrc} from './options';
export type {MediaParserEmbeddedImage} from './state/images';

export {downloadAndParseMedia} from './download-and-parse-media';
export type {Options, ParseMediaFields} from './fields';
export type {
	MediaParserContainer,
	ParseMediaOnProgress,
	ParseMediaOptions,
	ParseMediaProgress,
	ParseMediaResult,
} from './options';
export type {
	MediaParserAudioSample,
	MediaParserOnAudioSample,
	MediaParserOnAudioTrack,
	MediaParserOnAudioTrackParams,
	MediaParserOnVideoSample,
	MediaParserOnVideoTrack,
	MediaParserOnVideoTrackParams,
	MediaParserVideoSample,
} from './webcodec-sample-types';

export type {MediaParserCodecData} from './codec-data';
export type {MediaParserDimensions} from './get-dimensions';
export type {MediaParserLocation} from './get-location';
/**
 * @deprecated This type is not stable.
 */
export type {MediaParserReaderInterface} from './readers/reader';

import type {CreateContent, Writer, WriterInterface} from './writers/writer';

/**
 * @deprecated Dont use these yet.
 */
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
	internalParseMedia,
	fieldsNeedSamplesMap,
};

export type {MediaParserLogLevel};

export {M3uAssociatedPlaylist, M3uStream} from './containers/m3u/get-streams';
export {
	defaultSelectM3uAssociatedPlaylists,
	defaultSelectM3uStreamFn,
	SelectM3uAssociatedPlaylistsFn,
	SelectM3uStreamFn,
	SelectM3uStreamFnOptions,
} from './containers/m3u/select-stream';
export {
	mediaParserController,
	MediaParserController,
} from './controller/media-parser-controller';
export {VERSION} from './version';
export {WEBCODECS_TIMESCALE} from './webcodecs-timescale';
export type {SeekResolution} from './work-on-seek-request';

export type {MediaParserSampleAspectRatio} from './get-tracks';

/**
 * @deprecated Dont use these yet.
 */
export type MediaParserInternalTypes = {
	SamplePosition: SamplePosition;
	MatroskaSegment: MatroskaSegment;
	MatroskaElement: MatroskaElement;
	WriterInterface: WriterInterface;
	CreateContent: CreateContent;
	Writer: Writer;
	Ebml: Ebml;
	FloatWithSize: FloatWithSize;
	MainSegment: MainSegment;
	PossibleEbml: PossibleEbml;
	TrackEntry: TrackEntry;
	UintWithSize: UintWithSize;
	ParseMediaCallbacks: ParseMediaCallbacks;
};
/**
 * @deprecated Dont use this yet.
 */
type _InternalEbmlValue<T extends Ebml, Child = PossibleEbml> = EbmlValue<
	T,
	Child
>;

export {_InternalEbmlValue};
