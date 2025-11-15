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

	if (audioCodec === 'pcm-24') {
		return 'PCM 24-bit';
	}

	if (audioCodec === 'opus') {
		return 'Opus';
	}

	throw new Error('unknown audio codec: ' + (audioCodec satisfies never));
};
