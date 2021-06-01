import {Codec, Internals} from 'remotion';

export const getCodecName = (codec: Codec): string | null => {
	if (Internals.isAudioCodec(codec)) {
		return null;
	}

	if (codec === 'h264') {
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

	throw new TypeError(`Cannot find FFMPEG codec for ${codec}`);
};
