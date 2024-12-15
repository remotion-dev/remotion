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

type DimensionsCallback<F extends Options<ParseMediaFields>> =
	F['dimensions'] extends true
		? {onDimensions?: (dimensions: Dimensions) => void}
		: {};
type DurationCallback<F extends Options<ParseMediaFields>> =
	F['durationInSeconds'] extends true
		? {onDurationInSeconds?: (durationInSeconds: number | null) => void}
		: {};
type StructureCallback<F extends Options<ParseMediaFields>> =
	F['structure'] extends true
		? {onStructure?: (structure: Structure) => void}
		: {};
type FpsCallback<F extends Options<ParseMediaFields>> = F['fps'] extends true
	? {onFps?: (fps: number | null) => void}
	: {};
type VideoCodecCallback<F extends Options<ParseMediaFields>> =
	F['videoCodec'] extends true
		? {onVideoCodec?: (codec: MediaParserVideoCodec | null) => void}
		: {};
type AudioCodecCallback<F extends Options<ParseMediaFields>> =
	F['audioCodec'] extends true
		? {onAudioCodec?: (codec: MediaParserAudioCodec | null) => void}
		: {};
type TracksCallback<F extends Options<ParseMediaFields>> =
	F['tracks'] extends true ? {onTracks?: (tracks: TracksField) => void} : {};
type RotationCallback<F extends Options<ParseMediaFields>> =
	F['rotation'] extends true
		? {onRotation?: (rotation: number | null) => void}
		: {};
type MetadataCallback<F extends Options<ParseMediaFields>> =
	F['metadata'] extends true
		? {onMetadata?: (metadata: MetadataEntry[]) => void}
		: {};
type LocationCallback<F extends Options<ParseMediaFields>> =
	F['location'] extends true
		? {onLocation?: (location: MediaParserLocation | null) => void}
		: {};
type UnrotatedDimensionsCallback<F extends Options<ParseMediaFields>> =
	F['unrotatedDimensions'] extends true
		? {onUnrotatedDimensions?: (dimensions: Dimensions) => void}
		: {};
type IsHdrCallback<F extends Options<ParseMediaFields>> =
	F['isHdr'] extends true ? {onIsHdr?: (isHdr: boolean) => void} : {};
type SizeCallback<F extends Options<ParseMediaFields>> = F['size'] extends true
	? {onSize?: (size: number | null) => void}
	: {};
type NameCallback<F extends Options<ParseMediaFields>> = F['name'] extends true
	? {onName?: (name: string) => void}
	: {};
type ContainerCallback<F extends Options<ParseMediaFields>> =
	F['container'] extends true
		? {onContainer?: (container: ParseMediaContainer) => void}
		: {};
type MimeTypeCallback<F extends Options<ParseMediaFields>> =
	F['mimeType'] extends true
		? {onMimeType?: (mimeType: string | null) => void}
		: {};

export type ParseMediaCallbacks<Fields extends Options<ParseMediaFields>> =
	DimensionsCallback<Fields> &
		DurationCallback<Fields> &
		StructureCallback<Fields> &
		FpsCallback<Fields> &
		VideoCodecCallback<Fields> &
		AudioCodecCallback<Fields> &
		TracksCallback<Fields> &
		RotationCallback<Fields> &
		MetadataCallback<Fields> &
		LocationCallback<Fields> &
		UnrotatedDimensionsCallback<Fields> &
		IsHdrCallback<Fields> &
		SizeCallback<Fields> &
		NameCallback<Fields> &
		ContainerCallback<Fields> &
		MimeTypeCallback<Fields>;

type DimensionsField<F extends Options<ParseMediaFields>> =
	F['dimensions'] extends true ? {dimensions: Dimensions} : {};
type DurationField<F extends Options<ParseMediaFields>> =
	F['durationInSeconds'] extends true ? {durationInSeconds: number | null} : {};
type StructureField<F extends Options<ParseMediaFields>> =
	F['structure'] extends true ? {structure: Structure} : {};
type FpsField<F extends Options<ParseMediaFields>> = F['fps'] extends true
	? {fps: number | null}
	: {};
type VideoCodecField<F extends Options<ParseMediaFields>> =
	F['videoCodec'] extends true
		? {videoCodec: MediaParserVideoCodec | null}
		: {};
type AudioCodecField<F extends Options<ParseMediaFields>> =
	F['audioCodec'] extends true
		? {audioCodec: MediaParserAudioCodec | null}
		: {};
type TracksTypeField<F extends Options<ParseMediaFields>> =
	F['tracks'] extends true ? TracksField : {};
type RotationField<F extends Options<ParseMediaFields>> =
	F['rotation'] extends true ? {rotation: number | null} : {};
type UnrotatedDimensionsField<F extends Options<ParseMediaFields>> =
	F['unrotatedDimensions'] extends true
		? {unrotatedDimensions: Dimensions}
		: {};
type IsHdrField<F extends Options<ParseMediaFields>> = F['isHdr'] extends true
	? {isHdr: boolean}
	: {};
type InternalStatsField<F extends Options<ParseMediaFields>> =
	F['internalStats'] extends true ? {internalStats: InternalStats} : {};
type SizeField<F extends Options<ParseMediaFields>> = F['size'] extends true
	? {size: number | null}
	: {};
type NameField<F extends Options<ParseMediaFields>> = F['name'] extends true
	? {name: string}
	: {};
type MetadataField<F extends Options<ParseMediaFields>> =
	F['metadata'] extends true ? {metadata: MetadataEntry[]} : {};
type LocationField<F extends Options<ParseMediaFields>> =
	F['location'] extends true ? {location: MediaParserLocation | null} : {};
type ContainerField<F extends Options<ParseMediaFields>> =
	F['container'] extends true ? {container: ParseMediaContainer} : {};
type MimeTypeField<F extends Options<ParseMediaFields>> =
	F['mimeType'] extends true ? {mimeType: string | null} : {};

export type ParseMediaResult<Fields extends Options<ParseMediaFields>> =
	DimensionsField<Fields> &
		DurationField<Fields> &
		StructureField<Fields> &
		FpsField<Fields> &
		VideoCodecField<Fields> &
		AudioCodecField<Fields> &
		TracksTypeField<Fields> &
		RotationField<Fields> &
		UnrotatedDimensionsField<Fields> &
		IsHdrField<Fields> &
		InternalStatsField<Fields> &
		SizeField<Fields> &
		NameField<Fields> &
		MetadataField<Fields> &
		LocationField<Fields> &
		ContainerField<Fields> &
		MimeTypeField<Fields>;

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
