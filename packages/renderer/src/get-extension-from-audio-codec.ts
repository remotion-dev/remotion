import type {AudioCodec} from './audio-codec';

export const getExtensionFromAudioCodec = (audioCodec: AudioCodec) => {
	if (audioCodec === 'aac') {
		return 'aac';
	}

	if (audioCodec === 'opus') {
		return 'opus';
	}

	if (audioCodec === 'mp3') {
		return 'mp3';
	}

	if (audioCodec === 'pcm-16') {
		return 'wav';
	}

	throw new Error(`Unsupported audio codec: ${audioCodec}`);
};
