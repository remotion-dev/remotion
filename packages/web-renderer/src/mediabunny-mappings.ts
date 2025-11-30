import type {Quality} from 'mediabunny';
import {
	Mp4OutputFormat,
	QUALITY_HIGH,
	QUALITY_LOW,
	QUALITY_MEDIUM,
	QUALITY_VERY_HIGH,
	QUALITY_VERY_LOW,
	WebMOutputFormat,
	type OutputFormat,
	type VideoCodec,
} from 'mediabunny';

export type WebRendererCodec = 'h264' | 'h265' | 'vp8' | 'vp9' | 'av1';
export type WebRendererContainer = 'mp4' | 'webm';
export type WebRendererQuality =
	| 'very-low'
	| 'low'
	| 'medium'
	| 'high'
	| 'very-high';

export const codecToMediabunnyCodec = (codec: WebRendererCodec): VideoCodec => {
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
			return new Mp4OutputFormat();
		case 'webm':
			return new WebMOutputFormat();
		default:
			throw new Error(`Unsupported container: ${container satisfies never}`);
	}
};

export const getDefaultVideoCodecForContainer = (
	container: WebRendererContainer,
): WebRendererCodec => {
	switch (container) {
		case 'mp4':
			return 'h264';
		case 'webm':
			return 'vp8';
		default:
			throw new Error(`Unsupported container: ${container satisfies never}`);
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
