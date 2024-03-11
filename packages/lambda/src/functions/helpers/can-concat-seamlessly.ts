import type {AudioCodec} from '@remotion/renderer';

// Temporarily disable seamless audio concat
// Cannot do WAV yet, because currently assumes AAC in+outpoint
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const canConcatAudioSeamlessly = (audioCodec: AudioCodec | null) => {
	return audioCodec === 'aac';
};

export const canConcatVideoSeamlessly = (codec: string) => {
	return codec === 'h264';
};
