import type {InputAudioTrack, InputVideoTrack} from 'mediabunny';

const audioCodecLabels: Partial<
	Record<NonNullable<InputAudioTrack['codec']>, string>
> = {
	aac: 'AAC',
	ac3: 'AC3',
	alaw: 'A-law',
	eac3: 'E-AC3',
	flac: 'FLAC',
	mp3: 'MP3',
	opus: 'Opus',
	'pcm-f32': 'PCM 32-bit float',
	'pcm-f32be': 'PCM 32-bit big-endian float',
	'pcm-f64': 'PCM 64-bit little-endian float',
	'pcm-f64be': 'PCM 64-bit big-endian float',
	'pcm-s16': 'PCM 16-bit signed integer',
	'pcm-s16be': 'PCM 16-bit big-endian signed integer',
	'pcm-s24': 'PCM 24-bit signed integer',
	'pcm-s24be': 'PCM 24-bit big-endian signed integer',
	'pcm-s32': 'PCM 32-bit signed integer',
	'pcm-s32be': 'PCM 32-bit big-endian signed integer',
	'pcm-s8': 'PCM 8-bit signed integer',
	'pcm-u8': 'PCM 8-bit unsigned integer',
	ulaw: 'u-law',
	vorbis: 'Vorbis',
};

export const renderHumanReadableAudioCodec = (
	codec: InputAudioTrack['codec'] | null,
) => {
	if (codec === null) {
		return 'Unknown';
	}

	return audioCodecLabels[codec] ?? codec;
};

const videoCodecLabels: Partial<
	Record<NonNullable<InputVideoTrack['codec']>, string>
> = {
	av1: 'AV1',
	avc: 'H.264',
	hevc: 'H.265',
	vp8: 'VP8',
	vp9: 'VP9',
};

export const renderHumanReadableVideoCodec = (
	codec: InputVideoTrack['codec'] | null,
) => {
	if (codec === null) {
		return 'Unknown';
	}

	return videoCodecLabels[codec] ?? codec;
};
