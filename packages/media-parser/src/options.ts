import type {} from './boxes/iso-base-media/mdat/mdat';
import type {Dimensions} from './get-dimensions';
import type {AudioTrack, VideoTrack} from './get-tracks';
import type {AnySegment} from './parse-result';
import type {InternalStats} from './parser-state';
import type {ReaderInterface} from './reader';
import type {OnAudioTrack, OnVideoTrack} from './webcodec-sample-types';

export type KnownVideoCodecs =
	| 'h264'
	| 'h265'
	| 'vp8'
	| 'vp9'
	| 'av1'
	| 'prores';

export type KnownAudioCodecs =
	| 'aac'
	| 'mp3'
	| 'aiff'
	| 'opus'
	| 'pcm'
	| 'vorbis'
	| 'unknown';

export type Options<
	EnableDimensions extends boolean,
	EnableDuration extends boolean,
	EnableBoxes extends boolean,
	EnableFps extends boolean,
	EnableVideoCodec extends boolean,
	EnableAudioCodec extends boolean,
	EnableTracks extends boolean,
	EnableRotation extends boolean,
	EnableUnrotatedDimensions extends boolean,
	EnableInternalStats extends boolean,
> = {
	dimensions?: EnableDimensions;
	durationInSeconds?: EnableDuration;
	boxes?: EnableBoxes;
	fps?: EnableFps;
	videoCodec?: EnableVideoCodec;
	audioCodec?: EnableAudioCodec;
	tracks?: EnableTracks;
	rotation?: EnableRotation;
	unrotatedDimension?: EnableUnrotatedDimensions;
	internalStats?: EnableInternalStats;
};

export type Metadata<
	EnableDimensions extends boolean,
	EnableDuration extends boolean,
	EnableBoxes extends boolean,
	EnableFps extends boolean,
	EnableVideoCodec extends boolean,
	EnableAudioCodec extends boolean,
	EnableTracks extends boolean,
	EnableRotation extends boolean,
	EnableUnrotatedDimensions extends boolean,
	EnableInternalStats extends boolean,
> = (EnableDimensions extends true ? {dimensions: Dimensions} : {}) &
	(EnableDuration extends true ? {durationInSeconds: number | null} : {}) &
	(EnableBoxes extends true ? {boxes: AnySegment[]} : {}) &
	(EnableFps extends true ? {fps: number | null} : {}) &
	(EnableVideoCodec extends true ? {videoCodec: KnownVideoCodecs | null} : {}) &
	(EnableAudioCodec extends true ? {audioCodec: KnownAudioCodecs | null} : {}) &
	(EnableTracks extends true
		? {videoTracks: VideoTrack[]; audioTracks: AudioTrack[]}
		: {}) &
	(EnableRotation extends true ? {rotation: number | null} : {}) &
	(EnableUnrotatedDimensions extends true
		? {unrotatedDimension: Dimensions}
		: {}) &
	(EnableInternalStats extends true ? {internalStats: InternalStats} : {});

export type ParseMedia = <
	EnableDimensions extends boolean,
	EnableDuration extends boolean,
	EnableBoxes extends boolean,
	EnableFps extends boolean,
	EnableVideoCodec extends boolean,
	EnableAudioCodec extends boolean,
	EnableTracks extends boolean,
	EnableRotation extends boolean,
	EnableUnrotatedDimensions extends boolean,
	EnableInternalStats extends boolean,
>(options: {
	src: string | File;
	fields?: Options<
		EnableDimensions,
		EnableDuration,
		EnableBoxes,
		EnableFps,
		EnableVideoCodec,
		EnableAudioCodec,
		EnableTracks,
		EnableRotation,
		EnableUnrotatedDimensions,
		EnableInternalStats
	>;
	reader?: ReaderInterface;
	onAudioTrack?: OnAudioTrack;
	onVideoTrack?: OnVideoTrack;
	signal?: AbortSignal;
}) => Promise<
	Metadata<
		EnableDimensions,
		EnableDuration,
		EnableBoxes,
		EnableFps,
		EnableVideoCodec,
		EnableAudioCodec,
		EnableTracks,
		EnableRotation,
		EnableUnrotatedDimensions,
		EnableInternalStats
	>
>;
