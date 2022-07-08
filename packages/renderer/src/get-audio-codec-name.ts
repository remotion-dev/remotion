import type {Codec} from 'remotion';
import {Internals} from 'remotion';

export const getAudioCodecName = (codec: Codec): string | null => {
	if (!Internals.isAudioCodec(codec)) {
		// The mkv container supports WAV, but MP4 does only support
		// AAC. Choose MKV codec for better quality because we can put in lossless audio
		if (codec === 'h264-mkv') {
			return 'pcm_s16le';
		}

		if (codec === 'vp8' || codec === 'vp9') {
			return 'libopus';
		}

		return 'aac';
	}

	if (codec === 'aac') {
		return 'aac';
	}

	if (codec === 'mp3') {
		return 'libmp3lame';
	}

	if (codec === 'wav') {
		return 'pcm_s16le';
	}

	return null;
};
