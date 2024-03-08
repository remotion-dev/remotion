import type {Codec} from './codec';
import {isAudioCodec} from './options/audio-codec';

export const canUseParallelEncoding = (codec: Codec) => {
	if (isAudioCodec(codec)) {
		return false;
	}

	return codec === 'h264' || codec === 'h264-mkv' || codec === 'h265';
};
