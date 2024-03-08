import type {AudioCodec} from '@remotion/renderer';

// There is seamless concatenation for audio and video.
// Maybe we should separate this.
export const canConcatAudioSeamlessly = (audioCodec: AudioCodec | null) => {
	return audioCodec === 'aac';
};

export const canConcatVideoSeamlessly = (codec: string) => {
	return codec === 'h264';
};
