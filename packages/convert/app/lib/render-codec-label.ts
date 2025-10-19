import type {InputAudioTrack, InputVideoTrack} from 'mediabunny';
import type {InputContainer, OutputContainer} from '~/seo';

export const renderHumanReadableAudioCodec = (
	codec: InputAudioTrack['codec'],
) => {
	if (codec === 'opus') {
		return 'Opus';
	}

	if (codec === 'aac') {
		return 'AAC';
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

	if (codec === 'flac') {
		return 'FLAC';
	}

	if (codec === 'alaw') {
		return 'A-law';
	}

	if (codec === 'ulaw') {
		return 'μ-law';
	}

	if (codec === 'pcm-s8') {
		return 'PCM 8-bit signed integer';
	}

	if (codec === 'pcm-s16be') {
		return 'PCM 16-bit big-endian signed integer';
	}

	if (codec === 'pcm-s24be') {
		return 'PCM 24-bit big-endian signed integer';
	}

	if (codec === 'pcm-s32be') {
		return 'PCM 32-bit big-endian signed integer';
	}

	if (codec === 'pcm-f32be') {
		return 'PCM 32-bit big-endian float';
	}

	if (codec === 'pcm-f64be') {
		return 'PCM 64-bit big-endian float';
	}

	if (codec === 'pcm-f64') {
		return 'PCM 64-bit little-endian float';
	}

	if (codec === 'ac3') {
		return 'AC3';
	}

	if (codec === 'aiff') {
		return 'AIFF';
	}

	if (codec === null) {
		return 'Unknown';
	}

	throw new Error(`Unknown audio codec ${codec satisfies never}`);
};

export const renderHumanReadableVideoCodec = (
	codec: InputVideoTrack['codec'],
) => {
	if (codec === 'vp8') {
		return 'VP8';
	}

	if (codec === 'vp9') {
		return 'VP9';
	}

	if (codec === 'av1') {
		return 'AV1';
	}

	if (codec === 'avc') {
		return 'H.264';
	}

	if (codec === 'hevc') {
		return 'H.265';
	}

	if (codec === 'prores') {
		return 'ProRes';
	}

	if (codec === 'h264') {
		return 'H.264';
	}

	if (codec === 'h265') {
		return 'H.265';
	}

	if (codec === null) {
		return 'Unknown';
	}

	throw new Error(`Unknown video codec ${codec satisfies never}`);
};

export const renderHumanReadableContainer = (
	container: InputContainer | OutputContainer,
) => {
	if (container === 'webm') {
		return '.webm';
	}

	if (container === 'mp4') {
		return '.mp4';
	}

	if (container === 'wav') {
		return '.wav';
	}

	if (container === 'mov') {
		return '.mov';
	}

	if (container === 'mkv') {
		return '.mkv';
	}

	throw new Error(`Unknown container ${container satisfies never}`);
};
