import type {
	OnAudioSample,
	OnVideoSample,
} from './boxes/iso-base-media/mdat/mdat';
import type {Dimensions} from './get-dimensions';
import type {AudioTrack, VideoTrack} from './get-tracks';
import type {AnySegment} from './parse-result';
import type {ReaderInterface} from './reader';

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
		? {unrotatedDimension: Dimensions | null}
		: {});

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
>(options: {
	src: string | File;
	fields: Options<
		EnableDimensions,
		EnableDuration,
		EnableBoxes,
		EnableFps,
		EnableVideoCodec,
		EnableAudioCodec,
		EnableTracks,
		EnableRotation,
		EnableUnrotatedDimensions
	>;
	reader?: ReaderInterface;
	onAudioSample?: OnAudioSample;
	onVideoSample?: OnVideoSample;
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
		EnableUnrotatedDimensions
	>
>;
