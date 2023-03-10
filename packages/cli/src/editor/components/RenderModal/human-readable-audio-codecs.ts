import type {AudioCodec} from '@remotion/renderer';

export const humanReadableAudioCodec = (audioCodec: AudioCodec) => {
	if (audioCodec === 'aac') {
		return 'AAC';
	}

	if (audioCodec === 'mp3') {
		return 'MP3';
	}

	if (audioCodec === 'pcm-16') {
		return 'Lossless';
	}

	if (audioCodec === 'opus') {
		return 'Opus';
	}
};
