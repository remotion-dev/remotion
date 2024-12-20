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
import type {InternalStats} from './state/parser-state';
import type {OnAudioTrack, OnVideoTrack} from './webcodec-sample-types';

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
	structure: boolean;
	fps: boolean;
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
};

export type AllParseMediaFields = {
	dimensions: true;
	durationInSeconds: true;
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
};

export type AllOptions<Fields extends ParseMediaFields> = {
	dimensions: Fields['dimensions'];
	durationInSeconds: Fields['durationInSeconds'];
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
};

export type Options<Fields extends ParseMediaFields> = Partial<
	AllOptions<Fields>
>;

export type TracksField = {
	videoTracks: VideoTrack[];
	audioTracks: AudioTrack[];
};

export type ParseMediaContainer = 'mp4' | 'webm' | 'avi' | 'transport-stream';

export type MediaParserKeyframe = {
	positionInBytes: number;
	sizeInBytes: number;
	presentationTimeInSeconds: number;
	decodingTimeInSeconds: number;
	trackId: number;
};

export interface ParseMediaCallbacks {
	onDimensions?: (dimensions: Dimensions) => void;
	onDurationInSeconds?: (durationInSeconds: number | null) => void;
	onStructure?: (structure: Structure) => void;
	onFps?: (fps: number | null) => void;
	onVideoCodec?: (codec: MediaParserVideoCodec | null) => void;
	onAudioCodec?: (codec: MediaParserAudioCodec | null) => void;
	onTracks?: (tracks: TracksField) => void;
	onRotation?: (rotation: number | null) => void;
	onUnrotatedDimensions?: (dimensions: Dimensions) => void;
	onInternalStats?: (internalStats: InternalStats) => void;
	onSize?: (size: number | null) => void;
	onName?: (name: string) => void;
	onContainer?: (container: ParseMediaContainer) => void;
	onIsHdr?: (isHdr: boolean) => void;
	onMetadata?: (metadata: MetadataEntry[]) => void;
	onLocation?: (location: MediaParserLocation | null) => void;
	onMimeType?: (mimeType: string | null) => void;
	onKeyframes?: (keyframes: Keyframe[]) => void;
}

export interface ParseMediaData {
	dimensions: Dimensions;
	durationInSeconds: number | null;
	structure: Structure;
	fps: number | null;
	videoCodec: MediaParserVideoCodec | null;
	audioCodec: MediaParserAudioCodec | null;
	tracks: TracksField;
	rotation: number | null;
	unrotatedDimensions: Dimensions;
	isHdr: boolean;
	internalStats: InternalStats;
	size: number | null;
	name: string;
	metadata: MetadataEntry[];
	location: MediaParserLocation | null;
	container: ParseMediaContainer;
	mimeType: string | null;
	keyframes: Keyframe[];
}

export type ParseMediaResult<T extends Partial<ParseMediaFields>> = {
	[K in keyof T]: T[K] extends true
		? K extends keyof ParseMediaData
			? ParseMediaData[K]
			: never
		: never;
};
export type ParseMediaDynamicOptions<F extends Options<ParseMediaFields>> = {
	fields?: F;
} & ParseMediaCallbacks;

export type ParseMediaProgress = {
	bytes: number;
	percentage: number | null;
	totalBytes: number | null;
};

export type ParseMediaOnProgress = (
	progress: ParseMediaProgress,
) => void | Promise<void>;

export type ParseMediaOptions<F extends Options<ParseMediaFields>> = {
	src: string | Blob;
	reader?: ReaderInterface;
	onAudioTrack?: OnAudioTrack;
	onVideoTrack?: OnVideoTrack;
	signal?: AbortSignal;
	logLevel?: LogLevel;
	onParseProgress?: ParseMediaOnProgress;
} & ParseMediaDynamicOptions<F>;

export type ParseMedia = <F extends Options<ParseMediaFields>>(
	options: ParseMediaOptions<F>,
) => Promise<ParseMediaResult<F>>;
