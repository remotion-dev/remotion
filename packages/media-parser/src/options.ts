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
};

export type Options<Fields extends ParseMediaFields> = {
	dimensions?: Fields['dimensions'];
	durationInSeconds?: Fields['durationInSeconds'];
	structure?: Fields['structure'];
	fps?: Fields['fps'];
	videoCodec?: Fields['videoCodec'];
	audioCodec?: Fields['audioCodec'];
	tracks?: Fields['tracks'];
	rotation?: Fields['rotation'];
	unrotatedDimensions?: Fields['unrotatedDimensions'];
	internalStats?: Fields['internalStats'];
	size?: Fields['size'];
	name?: Fields['name'];
	container?: Fields['container'];
	isHdr?: Fields['isHdr'];
	metadata?: Fields['metadata'];
	location?: Fields['location'];
	mimeType?: Fields['mimeType'];
};

export type TracksField = {
	videoTracks: VideoTrack[];
	audioTracks: AudioTrack[];
};

export type ParseMediaContainer = 'mp4' | 'webm' | 'avi' | 'transport-stream';

export type ParseMediaCallbacks<Fields extends Options<ParseMediaFields>> =
	(Fields['dimensions'] extends true
		? {onDimensions?: (dimensions: Dimensions) => void}
		: {}) &
		(Fields['durationInSeconds'] extends true
			? {onDurationInSeconds?: (durationInSeconds: number | null) => void}
			: {}) &
		(Fields['structure'] extends true
			? {onStructure?: (structure: Structure) => void}
			: {}) &
		(Fields['fps'] extends true ? {onFps?: (fps: number | null) => void} : {}) &
		(Fields['videoCodec'] extends true
			? {onVideoCodec?: (codec: MediaParserVideoCodec | null) => void}
			: {}) &
		(Fields['audioCodec'] extends true
			? {onAudioCodec?: (codec: MediaParserAudioCodec | null) => void}
			: {}) &
		(Fields['tracks'] extends true
			? {onTracks?: (tracks: TracksField) => void}
			: {}) &
		(Fields['rotation'] extends true
			? {onRotation?: (rotation: number | null) => void}
			: {}) &
		(Fields['metadata'] extends true
			? {onMetadata?: (metadata: MetadataEntry[]) => void}
			: {}) &
		(Fields['location'] extends true
			? {onLocation?: (location: MediaParserLocation | null) => void}
			: {}) &
		(Fields['unrotatedDimensions'] extends true
			? {onUnrotatedDimensions?: (dimensions: Dimensions) => void}
			: {}) &
		(Fields['isHdr'] extends true ? {onIsHdr?: (isHdr: boolean) => void} : {}) &
		(Fields['size'] extends true
			? {onSize?: (size: number | null) => void}
			: {}) &
		(Fields['name'] extends true ? {onName?: (name: string) => void} : {}) &
		(Fields['container'] extends true
			? {onContainer?: (container: ParseMediaContainer) => void}
			: {}) &
		(Fields['mimeType'] extends true
			? {onMimeType?: (mimeType: string | null) => void}
			: {});

export type ParseMediaResult<Fields extends Options<ParseMediaFields>> =
	(Fields['dimensions'] extends true ? {dimensions: Dimensions} : {}) &
		(Fields['durationInSeconds'] extends true
			? {durationInSeconds: number | null}
			: {}) &
		(Fields['structure'] extends true ? {structure: Structure} : {}) &
		(Fields['fps'] extends true ? {fps: number | null} : {}) &
		(Fields['videoCodec'] extends true
			? {videoCodec: MediaParserVideoCodec | null}
			: {}) &
		(Fields['audioCodec'] extends true
			? {audioCodec: MediaParserAudioCodec | null}
			: {}) &
		(Fields['tracks'] extends true ? TracksField : {}) &
		(Fields['rotation'] extends true ? {rotation: number | null} : {}) &
		(Fields['unrotatedDimensions'] extends true
			? {unrotatedDimensions: Dimensions}
			: {}) &
		(Fields['isHdr'] extends true ? {isHdr: boolean} : {}) &
		(Fields['internalStats'] extends true
			? {internalStats: InternalStats}
			: {}) &
		(Fields['size'] extends true ? {size: number | null} : {}) &
		(Fields['name'] extends true ? {name: string} : {}) &
		(Fields['metadata'] extends true ? {metadata: MetadataEntry[]} : {}) &
		(Fields['location'] extends true
			? {location: MediaParserLocation | null}
			: {}) &
		(Fields['container'] extends true ? {container: ParseMediaContainer} : {}) &
		(Fields['mimeType'] extends true ? {mimeType: string | null} : {});

export type ParseMediaDynamicOptions<F extends Options<ParseMediaFields>> = {
	fields?: F;
} & ParseMediaCallbacks<F>;

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
