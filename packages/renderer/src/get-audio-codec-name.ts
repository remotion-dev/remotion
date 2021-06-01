import {Codec, Internals} from 'remotion';

export const getAudioCodecName = (codec: Codec): string | null => {
	if (!Internals.isAudioCodec(codec)) {
		return 'aac';
	}

	if (codec === 'aac') {
		return 'aac';
	}

	if (codec === 'mp3') {
		return 'libmp3lame';
	}

	return null;
};
