import type {Codec} from './codec';
import {isAudioCodec} from './is-audio-codec';

export const canUseParallelEncoding = (codec: Codec) => {
	if (isAudioCodec(codec)) {
		return false;
	}

	// h264-ts is the chunk codec for seamless H.264 renders on Lambda. Its
	// pre-encoded MPEG-TS file is remuxed with the audio like the others.
	return (
		codec === 'h264' ||
		codec === 'h264-mkv' ||
		codec === 'h264-ts' ||
		codec === 'h265'
	);
};
