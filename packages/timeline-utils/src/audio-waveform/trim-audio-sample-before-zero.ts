export type AudioSampleTiming = {
	readonly timestamp: number;
	readonly numberOfFrames: number;
	readonly duration: number;
	readonly sampleRate: number;
};

/**
 * Returns the first frame index to include when building a timeline-aligned waveform.
 * Returns null when the entire sample ends before timeline t=0.
 */
export const getAudioSampleStartFrameAtTimelineZero = (
	sample: AudioSampleTiming,
): number | null => {
	if (sample.timestamp + sample.duration <= 0) {
		return null;
	}

	if (sample.timestamp >= 0) {
		return 0;
	}

	return Math.min(
		sample.numberOfFrames,
		Math.ceil(-sample.timestamp * sample.sampleRate),
	);
};
