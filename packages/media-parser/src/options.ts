import type {Dimensions} from './get-dimensions';
import type {MediaParserLocation} from './get-location';
import type {
	AudioTrack,
	MediaParserAudioCodec,
	MediaParserVideoCodec,
	VideoTrack,
} from './get-tracks';
import type {LogLevel} from './log';
import type {MetadataEntry} from './metadata/get-metadata';
import type {Structure} from './parse-result';
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

export type ParseMediaFields = {
	dimensions: boolean;
	durationInSeconds: boolean;
	slowDurationInSeconds: boolean;
	structure: boolean;
	fps: boolean;
	slowFps: boolean;
	videoCodec: boolean;
	audioCodec: boolean;
	tracks: boolean;
	rotation: boolean;
	unrotatedDimensions: boolean;
	internalStats: boolean;
	size: boolean;
	name: boolean;
	container: boolean;
	isHdr: boolean;
	metadata: boolean;
	location: boolean;
	mimeType: boolean;
	keyframes: boolean;
	slowKeyframes: boolean;
	slowNumberOfFrames: boolean;
	slowVideoBitrate: boolean;
	slowAudioBitrate: boolean;
	images: boolean;
	sampleRate: boolean;
	numberOfAudioChannels: boolean;
};

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
};

export type AllOptions<Fields extends ParseMediaFields> = {
	dimensions: Fields['dimensions'];
	durationInSeconds: Fields['durationInSeconds'];
	slowDurationInSeconds: Fields['slowDurationInSeconds'];
	slowFps: Fields['slowFps'];
	structure: Fields['structure'];
	fps: Fields['fps'];
	videoCodec: Fields['videoCodec'];
	audioCodec: Fields['audioCodec'];
	tracks: Fields['tracks'];
	rotation: Fields['rotation'];
	unrotatedDimensions: Fields['unrotatedDimensions'];
	internalStats: Fields['internalStats'];
	size: Fields['size'];
	name: Fields['name'];
	container: Fields['container'];
	isHdr: Fields['isHdr'];
	metadata: Fields['metadata'];
	location: Fields['location'];
	mimeType: Fields['mimeType'];
	keyframes: Fields['keyframes'];
	slowKeyframes: Fields['slowKeyframes'];
	slowNumberOfFrames: Fields['slowNumberOfFrames'];
	images: Fields['images'];
	sampleRate: Fields['sampleRate'];
	numberOfAudioChannels: Fields['numberOfAudioChannels'];
	slowVideoBitrate: Fields['slowVideoBitrate'];
	slowAudioBitrate: Fields['slowAudioBitrate'];
};

export type Options<Fields extends ParseMediaFields> = Partial<
	AllOptions<Fields>
>;

export type TracksField = {
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
	| 'wav';

export type MediaParserKeyframe = {
	positionInBytes: number;
	sizeInBytes: number;
	presentationTimeInSeconds: number;
	decodingTimeInSeconds: number;
	trackId: number;
};

export type MandatoryParseMediaCallbacks = {
	onDimensions:
		| null
		| ((dimensions: Dimensions | null) => void | Promise<void>);
	onDurationInSeconds:
		| null
		| ((durationInSeconds: number | null) => void | Promise<void>);
	onSlowDurationInSeconds:
		| null
		| ((durationInSeconds: number) => void | Promise<void>);
	onSlowFps: null | ((fps: number) => void | Promise<void>);
	onStructure: null | ((structure: Structure) => void | Promise<void>);
	onFps: null | ((fps: number | null) => void | Promise<void>);
	onVideoCodec:
		| null
		| ((codec: MediaParserVideoCodec | null) => void | Promise<void>);
	onAudioCodec:
		| null
		| ((codec: MediaParserAudioCodec | null) => void | Promise<void>);
	onTracks: null | ((tracks: TracksField) => void | Promise<void>);
	onRotation: null | ((rotation: number | null) => void | Promise<void>);
	onUnrotatedDimensions:
		| null
		| ((dimensions: Dimensions | null) => void | Promise<void>);
	onInternalStats:
		| null
		| ((internalStats: InternalStats) => void | Promise<void>);
	onSize: null | ((size: number | null) => void | Promise<void>);
	onName: null | ((name: string) => void | Promise<void>);
	onContainer:
		| null
		| ((container: MediaParserContainer) => void | Promise<void>);
	onIsHdr: null | ((isHdr: boolean) => void | Promise<void>);
	onMetadata: null | ((metadata: MetadataEntry[]) => void | Promise<void>);
	onLocation:
		| null
		| ((location: MediaParserLocation | null) => void | Promise<void>);
	onMimeType: null | ((mimeType: string | null) => void | Promise<void>);
	onKeyframes:
		| null
		| ((keyframes: MediaParserKeyframe[] | null) => void | Promise<void>);
	onSlowKeyframes:
		| null
		| ((keyframes: MediaParserKeyframe[]) => void | Promise<void>);
	onSlowNumberOfFrames: null | ((samples: number) => void | Promise<void>);
	onImages:
		| null
		| ((images: MediaParserEmbeddedImage[]) => void | Promise<void>);
	onSampleRate: null | ((sampleRate: number | null) => void | Promise<void>);
	onNumberOfAudioChannels:
		| null
		| ((numberOfChannels: number | null) => void | Promise<void>);
	onSlowVideoBitrate:
		| null
		| ((videoBitrate: number | null) => void | Promise<void>);
	onSlowAudioBitrate:
		| null
		| ((audioBitrate: number | null) => void | Promise<void>);
};

export type ParseMediaCallbacks = Partial<MandatoryParseMediaCallbacks>;

export interface ParseMediaData {
	dimensions: Dimensions | null;
	durationInSeconds: number | null;
	slowDurationInSeconds: number;
	slowFps: number;
	structure: Structure;
	fps: number | null;
	videoCodec: MediaParserVideoCodec | null;
	audioCodec: MediaParserAudioCodec | null;
	tracks: TracksField;
	rotation: number | null;
	unrotatedDimensions: Dimensions | null;
	isHdr: boolean;
	internalStats: InternalStats;
	size: number | null;
	name: string;
	metadata: MetadataEntry[];
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

type OptionalParseMediaParams<F extends Options<ParseMediaFields>> = {
	reader: ReaderInterface;
	signal: AbortSignal | undefined;
	logLevel: LogLevel;
	onParseProgress: ParseMediaOnProgress | null;
	progressIntervalInMs: number | null;
	fields: F | null;
} & MandatoryParseMediaCallbacks;

type ParseMediaSampleCallbacks = {
	onAudioTrack: OnAudioTrack | null;
	onVideoTrack: OnVideoTrack | null;
};

export type ParseMediaMode = 'query' | 'download';

export type ParseMediaSrc = string | Blob;

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

export type InternalParseMediaOptions<F extends Options<ParseMediaFields>> = {
	src: ParseMediaSrc;
} & OptionalParseMediaParams<F> &
	ParseMediaSampleCallbacks & {
		onDiscardedData: OnDiscardedData | null;
		mode: ParseMediaMode;
		onError: ParseMediaOnError;
	};

export type ParseMediaOptions<F extends Options<ParseMediaFields>> = {
	src: ParseMediaSrc;
} & Partial<OptionalParseMediaParams<F>> &
	Partial<ParseMediaSampleCallbacks>;

export type DownloadAndParseMediaOptions<F extends Options<ParseMediaFields>> =
	{
		src: ParseMediaSrc;
	} & Partial<OptionalParseMediaParams<F>> & {
			writer: WriterInterface;
			onError?: ParseMediaOnError;
		};

export type InternalParseMedia = <F extends Options<ParseMediaFields>>(
	options: InternalParseMediaOptions<F>,
) => Promise<ParseMediaResult<F>>;

export type ParseMedia = <F extends Options<ParseMediaFields>>(
	options: ParseMediaOptions<F>,
) => Promise<ParseMediaResult<F>>;

export type DownloadAndParseMedia = <F extends Options<ParseMediaFields>>(
	options: DownloadAndParseMediaOptions<F>,
) => Promise<ParseMediaResult<F>>;
