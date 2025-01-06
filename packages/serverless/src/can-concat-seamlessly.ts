import type {AudioCodec, Codec} from '@remotion/renderer';

// Cannot do WAV yet, because currently assumes AAC in+outpoint

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

export const canConcatVideoSeamlessly = (codec: Codec) => {
	return codec === 'h264';
};
