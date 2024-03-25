import type {AudioCodec} from '@remotion/renderer';

// Cannot do WAV yet, because currently assumes AAC in+outpoint
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const canConcatAudioSeamlessly = (
	audioCodec: AudioCodec | null,
	chunkDurationInFrames: number,
) => {
	// Rendering a chunk that is too small generates too much overhead
	// and is currently buggy
	if (chunkDurationInFrames <= 4) {
		return false;
	}

	return audioCodec === 'aac';
};

export const canConcatVideoSeamlessly = (codec: string) => {
	return codec === 'h264';
};
