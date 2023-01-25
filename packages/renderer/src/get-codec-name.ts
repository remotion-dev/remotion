import type {Codec} from './codec';
import {isAudioCodec} from './is-audio-codec';

export const getCodecName = (codec: Codec): string | null => {
	if (isAudioCodec(codec)) {
		return null;
	}

	if (codec === 'h264' || codec === 'h264-mkv') {
		return 'libx264';
	}

	if (codec === 'h265') {
		return 'libx265';
	}

	if (codec === 'vp8') {
		return 'libvpx';
	}

	if (codec === 'vp9') {
		return 'libvpx-vp9';
	}

	if (codec === 'prores') {
		return 'prores_ks';
	}

	if (codec === 'gif') {
		return 'gif';
	}

	throw new TypeError(`Cannot find FFMPEG codec for ${codec}`);
};
