import type {Dimensions} from './get-dimensions';
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
	EnableSamples extends boolean,
> = {
	dimensions?: EnableDimensions;
	durationInSeconds?: EnableDuration;
	boxes?: EnableBoxes;
	fps?: EnableFps;
	videoCodec?: EnableVideoCodec;
	audioCodec?: EnableAudioCodec;
	samples?: EnableSamples;
};

export type Metadata<
	EnableDimensions extends boolean,
	EnableDuration extends boolean,
	EnableBoxes extends boolean,
	EnableFps extends boolean,
	EnableVideoCodec extends boolean,
	EnableAudioCodec extends boolean,
	EnableSamples extends boolean,
> = (EnableDimensions extends true ? {dimensions: Dimensions} : {}) &
	(EnableDuration extends true ? {durationInSeconds: number | null} : {}) &
	(EnableBoxes extends true ? {boxes: AnySegment[]} : {}) &
	(EnableFps extends true ? {fps: number | null} : {}) &
	(EnableVideoCodec extends true ? {videoCodec: KnownVideoCodecs | null} : {}) &
	(EnableAudioCodec extends true ? {audioCodec: KnownAudioCodecs | null} : {}) &
	(EnableSamples extends true ? {samples: number | null} : {});

export type ParseMedia = <
	EnableDimensions extends boolean,
	EnableDuration extends boolean,
	EnableBoxes extends boolean,
	EnableFps extends boolean,
	EnableVideoCodec extends boolean,
	EnableAudioCodec extends boolean,
	EnableSamples extends boolean,
>(
	src: string,
	options: Options<
		EnableDimensions,
		EnableDuration,
		EnableBoxes,
		EnableFps,
		EnableVideoCodec,
		EnableAudioCodec,
		EnableSamples
	>,
	readerInterface?: ReaderInterface,
) => Promise<
	Metadata<
		EnableDimensions,
		EnableDuration,
		EnableBoxes,
		EnableFps,
		EnableVideoCodec,
		EnableAudioCodec,
		EnableSamples
	>
>;
