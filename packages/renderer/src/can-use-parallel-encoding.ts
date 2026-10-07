import type {Codec} from './codec';
import {isAudioCodec} from './is-audio-codec';

export const canUseParallelEncoding = (codec: Codec) => {
	if (isAudioCodec(codec)) {
		return false;
	}

	// GIF encoding uses a palette generated from the entire video.
	return (
		codec === 'h264' ||
		codec === 'h264-mkv' ||
		codec === 'h264-ts' ||
		codec === 'h265' ||
		codec === 'vp8' ||
		codec === 'vp9' ||
		codec === 'av1' ||
		codec === 'prores'
	);
};
