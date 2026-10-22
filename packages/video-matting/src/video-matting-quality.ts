import {Quality} from 'mediabunny';

export const VIDEO_MATTING_QUALITIES = [
	'very-low',
	'low',
	'medium',
	'high',
	'very-high',
] as const;

export type VideoMattingQuality = (typeof VIDEO_MATTING_QUALITIES)[number];

export type VideoMattingBitrate = number | VideoMattingQuality;

export const resolveVideoMattingQuality = (
	value: VideoMattingBitrate,
): Quality => {
	if (typeof value === 'number') {
		if (!Number.isInteger(value) || value <= 0) {
			throw new TypeError('A numeric bitrate must be a positive integer.');
		}

		return new Quality({bitrate: value});
	}

	if (!VIDEO_MATTING_QUALITIES.includes(value)) {
		throw new TypeError(
			`The bitrate quality must be one of ${VIDEO_MATTING_QUALITIES.join(', ')}.`,
		);
	}

	return new Quality({quality: value, preferBitrate: true});
};
