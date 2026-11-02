// Cannot do WAV yet, because currently assumes AAC in+outpoint

import type {Codec} from './codec';
import type {AudioCodec} from './options/audio-codec';

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
