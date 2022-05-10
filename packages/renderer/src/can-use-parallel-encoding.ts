import {Codec, Internals} from 'remotion';

export const canUseParallelEncoding = (codec: Codec) => {
	if (Internals.isAudioCodec(codec)) {
		return false;
	}

	return codec === 'h264' || codec === 'h264-mkv' || codec === 'h265';
};
