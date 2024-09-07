import type {} from './boxes/iso-base-media/mdat/mdat';
import type {Dimensions} from './get-dimensions';
import type {
	AudioTrack,
	MediaParserAudioCodec,
	MediaParserVideoCodec,
	VideoTrack,
} from './get-tracks';
import type {AnySegment} from './parse-result';
import type {InternalStats} from './parser-state';
import type {ReaderInterface} from './readers/reader';
import type {OnAudioTrack, OnVideoTrack} from './webcodec-sample-types';

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
	EnableSize extends boolean,
	EnableName extends boolean,
> = {
	dimensions?: EnableDimensions;
	durationInSeconds?: EnableDuration;
	boxes?: EnableBoxes;
	fps?: EnableFps;
	videoCodec?: EnableVideoCodec;
	audioCodec?: EnableAudioCodec;
	tracks?: EnableTracks;
	rotation?: EnableRotation;
	unrotatedDimensions?: EnableUnrotatedDimensions;
	internalStats?: EnableInternalStats;
	size?: EnableSize;
	name?: EnableName;
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
	EnableSize extends boolean,
	EnableName extends boolean,
> = (EnableDimensions extends true ? {dimensions: Dimensions} : {}) &
	(EnableDuration extends true ? {durationInSeconds: number | null} : {}) &
	(EnableBoxes extends true ? {boxes: AnySegment[]} : {}) &
	(EnableFps extends true ? {fps: number | null} : {}) &
	(EnableVideoCodec extends true
		? {videoCodec: MediaParserVideoCodec | null}
		: {}) &
	(EnableAudioCodec extends true
		? {audioCodec: MediaParserAudioCodec | null}
		: {}) &
	(EnableTracks extends true
		? {videoTracks: VideoTrack[]; audioTracks: AudioTrack[]}
		: {}) &
	(EnableRotation extends true ? {rotation: number | null} : {}) &
	(EnableUnrotatedDimensions extends true
		? {unrotatedDimensions: Dimensions}
		: {}) &
	(EnableInternalStats extends true ? {internalStats: InternalStats} : {}) &
	(EnableSize extends true ? {size: number | null} : {}) &
	(EnableName extends true ? {name: string} : {});

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
	EnableSize extends boolean,
	EnableName extends boolean,
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
		EnableInternalStats,
		EnableSize,
		EnableName
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
		EnableInternalStats,
		EnableSize,
		EnableName
	>
>;
