import type {AudioCodec, Quality} from 'mediabunny';
import {
	AdtsOutputFormat,
	MkvOutputFormat,
	MovOutputFormat,
	Mp3OutputFormat,
	Mp4OutputFormat,
	OggOutputFormat,
	QUALITY_HIGH,
	QUALITY_LOW,
	QUALITY_MEDIUM,
	QUALITY_VERY_HIGH,
	QUALITY_VERY_LOW,
	WavOutputFormat,
	WebMOutputFormat,
	type OutputFormat,
	type VideoCodec,
} from 'mediabunny';

export type WebRendererVideoCodec = 'h264' | 'h265' | 'vp8' | 'vp9' | 'av1';
export type WebRendererContainer =
	| 'mp4'
	| 'webm'
	| 'mkv'
	| 'mov'
	| 'wav'
	| 'mp3'
	| 'aac'
	| 'ogg';
export type WebRendererAudioCodec =
	| 'aac'
	| 'opus'
	| 'mp3'
	| 'vorbis'
	| 'pcm-s16';
export type WebRendererQuality =
	| 'very-low'
	| 'low'
	| 'medium'
	| 'high'
	| 'very-high';

export const isAudioOnlyContainer = (
	container: WebRendererContainer,
): boolean => {
	return (
		container === 'wav' ||
		container === 'mp3' ||
		container === 'aac' ||
		container === 'ogg'
	);
};

export const codecToMediabunnyCodec = (
	codec: WebRendererVideoCodec,
): VideoCodec => {
	switch (codec) {
		case 'h264':
			return 'avc';
		case 'h265':
			return 'hevc';
		case 'vp8':
			return 'vp8';
		case 'vp9':
			return 'vp9';
		case 'av1':
			return 'av1';
		default:
			throw new Error(`Unsupported codec: ${codec satisfies never}`);
	}
};

export const containerToMediabunnyContainer = (
	container: WebRendererContainer,
): OutputFormat => {
	switch (container) {
		case 'mp4':
			return new Mp4OutputFormat({fastStart: 'reserve'});
		case 'webm':
			return new WebMOutputFormat();
		case 'mkv':
			return new MkvOutputFormat();
		case 'wav':
			return new WavOutputFormat();
		case 'mp3':
			return new Mp3OutputFormat();
		case 'aac':
			return new AdtsOutputFormat();
		case 'ogg':
			return new OggOutputFormat();
		case 'mov':
			return new MovOutputFormat({fastStart: 'reserve'});
		default:
			throw new Error(`Unsupported container: ${container satisfies never}`);
	}
};

export const getDefaultVideoCodecForContainer = (
	container: WebRendererContainer,
): WebRendererVideoCodec | null => {
	switch (container) {
		case 'mp4':
			return 'h264';
		case 'webm':
			return 'vp8';
		case 'mkv':
		case 'mov':
			return 'h264';
		case 'wav':
		case 'mp3':
		case 'aac':
		case 'ogg':
			return null;
		default:
			throw new Error(`Unsupported container: ${container satisfies never}`);
	}
};

export const getDefaultContainerForCodec = (
	codec: WebRendererVideoCodec,
): WebRendererContainer => {
	switch (codec) {
		case 'h264':
		case 'h265':
		case 'av1':
			return 'mp4';
		case 'vp8':
		case 'vp9':
			return 'webm';
		default:
			throw new Error(`Unsupported codec: ${codec satisfies never}`);
	}
};

export const getQualityForWebRendererQuality = (
	quality: WebRendererQuality,
): Quality => {
	switch (quality) {
		case 'very-low':
			return QUALITY_VERY_LOW;
		case 'low':
			return QUALITY_LOW;
		case 'medium':
			return QUALITY_MEDIUM;
		case 'high':
			return QUALITY_HIGH;
		case 'very-high':
			return QUALITY_VERY_HIGH;
		default:
			throw new Error(`Unsupported quality: ${quality satisfies never}`);
	}
};

export const getMimeType = (container: WebRendererContainer): string => {
	switch (container) {
		case 'mp4':
			return 'video/mp4';
		case 'webm':
			return 'video/webm';
		case 'mkv':
			return 'video/x-matroska';
		case 'wav':
			return 'audio/wav';
		case 'mp3':
			return 'audio/mpeg';
		case 'aac':
			return 'audio/aac';
		case 'ogg':
			return 'audio/ogg';
		case 'mov':
			return 'video/quicktime';
		default:
			throw new Error(`Unsupported container: ${container satisfies never}`);
	}
};

export const getDefaultAudioCodecForContainer = (
	container: WebRendererContainer,
): WebRendererAudioCodec => {
	switch (container) {
		case 'mp4':
			return 'aac';
		case 'webm':
			return 'opus';
		case 'mkv':
			return 'aac';
		case 'wav':
			return 'pcm-s16';
		case 'mp3':
			return 'mp3';
		case 'aac':
			return 'aac';
		case 'ogg':
			return 'opus';
		case 'mov':
			return 'aac';
		default:
			throw new Error(`Unsupported container: ${container satisfies never}`);
	}
};

const WEB_RENDERER_VIDEO_CODECS: WebRendererVideoCodec[] = [
	'h264',
	'h265',
	'vp8',
	'vp9',
	'av1',
];

export const getSupportedVideoCodecsForContainer = (
	container: WebRendererContainer,
): WebRendererVideoCodec[] => {
	if (isAudioOnlyContainer(container)) {
		return [];
	}

	const format = containerToMediabunnyContainer(container);
	const allSupported = format.getSupportedVideoCodecs();

	return WEB_RENDERER_VIDEO_CODECS.filter((codec) =>
		allSupported.includes(codecToMediabunnyCodec(codec)),
	);
};

const WEB_RENDERER_AUDIO_CODECS: WebRendererAudioCodec[] = [
	'aac',
	'opus',
	'mp3',
	'vorbis',
	'pcm-s16',
];

export const audioCodecToMediabunnyAudioCodec = (
	audioCodec: WebRendererAudioCodec,
): AudioCodec => {
	switch (audioCodec) {
		case 'aac':
			return 'aac';
		case 'opus':
			return 'opus';
		case 'mp3':
			return 'mp3';
		case 'vorbis':
			return 'vorbis';
		case 'pcm-s16':
			return 'pcm-s16';
		default:
			throw new Error(`Unsupported audio codec: ${audioCodec satisfies never}`);
	}
};

export const getSupportedAudioCodecsForContainer = (
	container: WebRendererContainer,
): WebRendererAudioCodec[] => {
	const format = containerToMediabunnyContainer(container);
	const allSupported = format.getSupportedAudioCodecs();

	return WEB_RENDERER_AUDIO_CODECS.filter((codec) =>
		allSupported.includes(audioCodecToMediabunnyAudioCodec(codec)),
	);
};
