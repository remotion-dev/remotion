import type {M3uStream} from './containers/m3u/get-streams';
import type {
	SelectM3uAssociatedPlaylistsFn,
	SelectM3uStreamFn,
} from './containers/m3u/select-stream';
import type {MediaParserController} from './controller/media-parser-controller';
import type {Options, ParseMediaFields} from './fields';
import type {Dimensions} from './get-dimensions';
import type {MediaParserLocation} from './get-location';
import type {
	AudioTrack,
	MediaParserAudioCodec,
	MediaParserVideoCodec,
	VideoTrack,
} from './get-tracks';
import type {LogLevel} from './log';
import type {MediaParserMetadataEntry} from './metadata/get-metadata';
import type {
	IsoBaseMediaStructure,
	MediaParserStructureUnstable,
} from './parse-result';
import type {ReaderInterface} from './readers/reader';
import type {MediaParserEmbeddedImage} from './state/images';
import type {InternalStats} from './state/parser-state';
import type {OnAudioTrack, OnVideoTrack} from './webcodec-sample-types';
import type {WriterInterface} from './writers/writer';

export type KnownAudioCodecs =
	| 'aac'
	| 'mp3'
	| 'aiff'
	| 'opus'
	| 'pcm'
	| 'vorbis'
	| 'unknown';

export type AllParseMediaFields = {
	dimensions: true;
	durationInSeconds: true;
	slowDurationInSeconds: true;
	slowNumberOfFrames: true;
	slowFps: true;
	structure: true;
	fps: true;
	videoCodec: true;
	audioCodec: true;
	tracks: true;
	rotation: true;
	unrotatedDimensions: true;
	internalStats: true;
	size: true;
	name: true;
	container: true;
	isHdr: true;
	metadata: true;
	location: true;
	mimeType: true;
	keyframes: true;
	slowKeyframes: true;
	images: true;
	sampleRate: true;
	numberOfAudioChannels: true;
	slowVideoBitrate: true;
	slowAudioBitrate: true;
	m3uStreams: true;
};

export type MediaParserTracks = {
	videoTracks: VideoTrack[];
	audioTracks: AudioTrack[];
};

export type MediaParserContainer =
	| 'mp4'
	| 'webm'
	| 'avi'
	| 'transport-stream'
	| 'mp3'
	| 'aac'
	| 'flac'
	| 'm3u8'
	| 'wav';

export type MediaParserKeyframe = {
	positionInBytes: number;
	sizeInBytes: number;
	presentationTimeInSeconds: number;
	decodingTimeInSeconds: number;
	trackId: number;
};

export type ParseMediaCallbacksMandatory = {
	onDimensions:
		| null
		| ((dimensions: Dimensions | null) => unknown | Promise<unknown>);
	onDurationInSeconds:
		| null
		| ((durationInSeconds: number | null) => unknown | Promise<unknown>);
	onSlowDurationInSeconds:
		| null
		| ((durationInSeconds: number) => unknown | Promise<unknown>);
	onSlowFps: null | ((fps: number) => unknown | Promise<unknown>);
	onStructure:
		| null
		| ((structure: MediaParserStructureUnstable) => unknown | Promise<unknown>);
	onFps: null | ((fps: number | null) => unknown | Promise<unknown>);
	onVideoCodec:
		| null
		| ((codec: MediaParserVideoCodec | null) => unknown | Promise<unknown>);
	onAudioCodec:
		| null
		| ((codec: MediaParserAudioCodec | null) => unknown | Promise<unknown>);
	onTracks: null | ((tracks: MediaParserTracks) => unknown | Promise<unknown>);
	onRotation: null | ((rotation: number | null) => unknown | Promise<unknown>);
	onUnrotatedDimensions:
		| null
		| ((dimensions: Dimensions | null) => unknown | Promise<unknown>);
	onInternalStats:
		| null
		| ((internalStats: InternalStats) => unknown | Promise<unknown>);
	onSize: null | ((size: number | null) => unknown | Promise<unknown>);
	onName: null | ((name: string) => unknown | Promise<unknown>);
	onContainer:
		| null
		| ((container: MediaParserContainer) => unknown | Promise<unknown>);
	onIsHdr: null | ((isHdr: boolean) => unknown | Promise<unknown>);
	onMetadata:
		| null
		| ((metadata: MediaParserMetadataEntry[]) => unknown | Promise<unknown>);
	onLocation:
		| null
		| ((location: MediaParserLocation | null) => unknown | Promise<unknown>);
	onMimeType: null | ((mimeType: string | null) => unknown | Promise<unknown>);
	onKeyframes:
		| null
		| ((keyframes: MediaParserKeyframe[] | null) => unknown | Promise<unknown>);
	onSlowKeyframes:
		| null
		| ((keyframes: MediaParserKeyframe[]) => unknown | Promise<unknown>);
	onSlowNumberOfFrames:
		| null
		| ((samples: number) => unknown | Promise<unknown>);
	onImages:
		| null
		| ((images: MediaParserEmbeddedImage[]) => unknown | Promise<unknown>);
	onSampleRate:
		| null
		| ((sampleRate: number | null) => unknown | Promise<unknown>);
	onNumberOfAudioChannels:
		| null
		| ((numberOfChannels: number | null) => unknown | Promise<unknown>);
	onSlowVideoBitrate:
		| null
		| ((videoBitrate: number | null) => unknown | Promise<unknown>);
	onSlowAudioBitrate:
		| null
		| ((audioBitrate: number | null) => unknown | Promise<unknown>);
	onM3uStreams:
		| null
		| ((streams: M3uStream[] | null) => unknown | Promise<unknown>);
};

export type ParseMediaCallbacks = Partial<ParseMediaCallbacksMandatory>;

export interface ParseMediaData {
	dimensions: Dimensions | null;
	durationInSeconds: number | null;
	slowDurationInSeconds: number;
	slowFps: number;
	structure: MediaParserStructureUnstable;
	fps: number | null;
	videoCodec: MediaParserVideoCodec | null;
	audioCodec: MediaParserAudioCodec | null;
	tracks: MediaParserTracks;
	rotation: number | null;
	unrotatedDimensions: Dimensions | null;
	isHdr: boolean;
	internalStats: InternalStats;
	size: number | null;
	name: string;
	metadata: MediaParserMetadataEntry[];
	location: MediaParserLocation | null;
	container: MediaParserContainer;
	mimeType: string | null;
	keyframes: MediaParserKeyframe[] | null;
	slowKeyframes: MediaParserKeyframe[];
	slowNumberOfFrames: number;
	images: MediaParserEmbeddedImage[];
	sampleRate: number | null;
	numberOfAudioChannels: number | null;
	slowVideoBitrate: number | null;
	slowAudioBitrate: number | null;
	m3uStreams: M3uStream[] | null;
}

export type ParseMediaResult<T extends Partial<ParseMediaFields>> = {
	[K in keyof T]: T[K] extends true
		? K extends keyof ParseMediaData
			? ParseMediaData[K]
			: never
		: never;
};

export type ParseMediaProgress = {
	bytes: number;
	percentage: number | null;
	totalBytes: number | null;
};

export type ParseMediaOnProgress = (
	progress: ParseMediaProgress,
) => void | Promise<void>;

type ReaderParams = {
	reader: ReaderInterface;
};

export type SerializeableOptionalParseMediaParams<
	F extends Options<ParseMediaFields>,
> = {
	logLevel: LogLevel;
	progressIntervalInMs: number | null;
	fields: F | null;
	acknowledgeRemotionLicense: boolean;
	mp4HeaderSegment: IsoBaseMediaStructure | null;
};

type OptionalParseMediaParams<F extends Options<ParseMediaFields>> =
	SerializeableOptionalParseMediaParams<F> & {
		controller: MediaParserController | undefined;
		onParseProgress: ParseMediaOnProgress | null;
		selectM3uStream: SelectM3uStreamFn;
		selectM3uAssociatedPlaylists: SelectM3uAssociatedPlaylistsFn;
	};

type ParseMediaSampleCallbacks = {
	onAudioTrack: OnAudioTrack | null;
	onVideoTrack: OnVideoTrack | null;
};

export type ParseMediaMode = 'query' | 'download';

export type ParseMediaSrc = string | Blob | URL;

export type OnDiscardedData = (data: Uint8Array) => Promise<void>;

export type ContinueAfterError =
	| {
			action: 'fail';
	  }
	| {
			action: 'download';
	  };

export type ParseMediaOnError = (
	error: Error,
) => ContinueAfterError | Promise<ContinueAfterError>;

type InternalOptions = {
	onDiscardedData: OnDiscardedData | null;
	mode: ParseMediaMode;
	onError: ParseMediaOnError;
	apiName: string;
};

export type ParseMediaMandatoryOptions = {
	src: ParseMediaSrc;
};

type DownloadOptions = {
	writer: WriterInterface;
	onError?: ParseMediaOnError;
};

export type InternalParseMediaOptions<F extends Options<ParseMediaFields>> =
	ParseMediaMandatoryOptions &
		OptionalParseMediaParams<F> &
		ReaderParams &
		ParseMediaCallbacks &
		ParseMediaSampleCallbacks &
		InternalOptions;

export type ParseMediaOnWorkerOptions<F extends Options<ParseMediaFields>> =
	ParseMediaMandatoryOptions &
		Partial<OptionalParseMediaParams<F>> &
		Partial<ParseMediaCallbacks> &
		Partial<ParseMediaSampleCallbacks>;

export type ParseMediaOptions<F extends Options<ParseMediaFields>> =
	ParseMediaOnWorkerOptions<F> & Partial<ReaderParams>;

export type DownloadAndParseMediaOptions<F extends Options<ParseMediaFields>> =
	ParseMediaMandatoryOptions &
		DownloadOptions &
		Partial<OptionalParseMediaParams<F>> &
		Partial<ReaderParams> &
		Partial<ParseMediaCallbacks> &
		Partial<ParseMediaSampleCallbacks>;

export type InternalParseMedia = <F extends Options<ParseMediaFields>>(
	options: InternalParseMediaOptions<F>,
) => Promise<ParseMediaResult<F>>;

export type ParseMedia = <F extends Options<ParseMediaFields>>(
	options: ParseMediaOptions<F>,
) => Promise<ParseMediaResult<F>>;

export type ParseMediaOnWorker = <F extends Options<ParseMediaFields>>(
	options: ParseMediaOnWorkerOptions<F>,
) => Promise<ParseMediaResult<F>>;

export type DownloadAndParseMedia = <F extends Options<ParseMediaFields>>(
	options: DownloadAndParseMediaOptions<F>,
) => Promise<ParseMediaResult<F>>;
