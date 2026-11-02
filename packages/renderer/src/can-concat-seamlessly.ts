// Cannot do WAV yet, because currently assumes AAC in+outpoint

import type {Codec} from './codec';
import type {AudioCodec} from './options/audio-codec';

// How the audio of a chunked render is joined. "seamless-if-possible" encodes
// each chunk to AAC with padding on both sides (which costs extra frames per
// chunk) and joins the packets without re-encoding. "encode-at-merge" keeps each
// chunk's audio uncompressed and encodes it once when the chunks are merged.
const audioConcatenationModes = [
	'seamless-if-possible',
	'encode-at-merge',
] as const;

export type AudioConcatenation = (typeof audioConcatenationModes)[number];

export const validateAudioConcatenation = (
	value: unknown,
): AudioConcatenation => {
	if (!audioConcatenationModes.includes(value as AudioConcatenation)) {
		throw new TypeError(
			`'audioConcatenation' must be one of ${audioConcatenationModes
				.map((m) => JSON.stringify(m))
				.join(', ')}, but got ${JSON.stringify(value)}`,
		);
	}

	return value as AudioConcatenation;
};

export const canConcatAudioSeamlessly = (
	audioCodec: AudioCodec | null,
	chunkDurationInFrames: number,
	audioConcatenation: AudioConcatenation,
) => {
	if (audioConcatenation === 'encode-at-merge') {
		return false;
	}

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
