import type {AudioCodec, Codec} from '@remotion/renderer';

export const canConcatSeamlessly = (
	audioCodec: AudioCodec | null,
	codec: Codec,
) => {
	return audioCodec === 'aac' && codec === 'h264';
};
