import type {Codec} from './codec';

export const validAudioCodecs = ['pcm-16', 'aac', 'mp3', 'opus'] as const;

export type AudioCodec = typeof validAudioCodecs[number];

export const supportedAudioCodecs = {
	h264: ['aac', 'pcm-16'] as const,
	'h264-mkv': ['pcm-16'] as const,
	aac: ['aac', 'pcm-16'] as const,
	gif: [] as const,
	h265: ['aac', 'pcm-16'] as const,
	mp3: ['mp3', 'pcm-16'] as const,
	prores: ['aac', 'pcm-16'] as const,
	vp8: ['opus', 'pcm-16'] as const,
	vp9: ['opus', 'pcm-16'] as const,
	wav: ['pcm-16'] as const,
} as const;

const _satisfies: {[key in Codec]: readonly AudioCodec[]} =
	supportedAudioCodecs;
if (_satisfies) {
	// Just for type checking
}

export const audioCodecNames = [
	'pcm_s16le',
	'aac',
	'libmp3lame',
	'libopus',
] as const;

export type FfmpegAudioCodecName = typeof audioCodecNames[number];

export const mapAudioCodecToFfmpegAudioCodecName = (
	audioCodec: AudioCodec
): FfmpegAudioCodecName => {
	if (audioCodec === 'aac') {
		return 'aac';
	}

	if (audioCodec === 'mp3') {
		return 'libmp3lame';
	}

	if (audioCodec === 'opus') {
		return 'libopus';
	}

	if (audioCodec === 'pcm-16') {
		return 'pcm_s16le';
	}

	throw new Error('unknown audio codec: ' + audioCodec);
};

export const defaultAudioCodecs: {
	[key in Codec]: {
		[k in 'compressed' | 'lossless']:
			| typeof supportedAudioCodecs[key][number]
			| null;
	};
} = {
	'h264-mkv': {
		lossless: 'pcm-16',
		compressed: 'pcm-16',
	},
	aac: {
		lossless: 'pcm-16',
		compressed: 'aac',
	},
	gif: {
		lossless: null,
		compressed: null,
	},
	h264: {
		lossless: 'pcm-16',
		compressed: 'aac',
	},
	h265: {
		lossless: 'pcm-16',
		compressed: 'aac',
	},
	mp3: {
		lossless: 'pcm-16',
		compressed: 'mp3',
	},
	prores: {
		lossless: 'pcm-16',
		// V4.0: Make pcm the default
		compressed: 'aac',
	},
	vp8: {
		lossless: 'pcm-16',
		compressed: 'opus',
	},
	vp9: {
		lossless: 'pcm-16',
		compressed: 'opus',
	},
	wav: {
		lossless: 'pcm-16',
		compressed: 'pcm-16',
	},
};

export const getDefaultAudioCodec = ({
	codec,
	preferLossless,
}: {
	codec: Codec;
	preferLossless: boolean;
}): AudioCodec | null => {
	return defaultAudioCodecs[codec][preferLossless ? 'lossless' : 'compressed'];
};
