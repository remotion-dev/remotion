const ALLOWED_GLOBAL_TIME_ANCHOR_SHIFT = 0.1;

// The tolerance is measured in AudioContext seconds.
export const getAudioSyncAnchorTolerance = (audioContext: AudioContext) => {
	const {baseLatency, outputLatency} = audioContext;
	const safeOutputLatency = outputLatency === 0 ? 0.3 : outputLatency;
	return ALLOWED_GLOBAL_TIME_ANCHOR_SHIFT + baseLatency + safeOutputLatency;
};
