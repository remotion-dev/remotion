import type {AudioCodec} from '@remotion/renderer';

// Cannot do WAV yet, because currently assumes AAC in+outpoint
export const canConcatAudioSeamlessly = (audioCodec: AudioCodec | null) => {
	return audioCodec === 'aac';
};

export const canConcatVideoSeamlessly = (codec: string) => {
	return codec === 'h264';
};
