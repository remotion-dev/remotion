import {
	MediaParserAudioCodec,
	MediaParserVideoCodec,
} from '@remotion/media-parser';

export const renderHumanReadableAudioCodec = (codec: MediaParserAudioCodec) => {
	if (codec === 'opus') {
		return 'Opus';
	}

	if (codec === 'aac') {
		return 'AAC';
	}

	if (codec === 'aiff') {
		return 'AIFF';
	}

	if (codec === 'mp3') {
		return 'MP3';
	}

	if (codec === 'pcm-f32') {
		return 'PCM 32-bit float';
	}

	if (codec === 'pcm-s16') {
		return 'PCM 16-bit signed integer';
	}

	if (codec === 'pcm-s24') {
		return 'PCM 24-bit signed integer';
	}

	if (codec === 'pcm-s32') {
		return 'PCM 32-bit signed integer';
	}

	if (codec === 'pcm-u8') {
		return 'PCM 8-bit unsigned integer';
	}

	if (codec === 'vorbis') {
		return 'Vorbis';
	}

	throw new Error(`Unknown audio codec ${codec satisfies never}`);
};

export const renderHumanReadableVideoCodec = (codec: MediaParserVideoCodec) => {
	if (codec === 'vp8') {
		return 'VP8';
	}

	if (codec === 'vp9') {
		return 'VP9';
	}

	if (codec === 'av1') {
		return 'AV1';
	}

	if (codec === 'h264') {
		return 'H.264';
	}

	if (codec === 'h265') {
		return 'H.265';
	}

	if (codec === 'prores') {
		return 'ProRes';
	}

	throw new Error(`Unknown video codec ${codec satisfies never}`);
};
