export const setGlobalTimeAnchor = ({
	audioContext,
	audioSyncAnchor,
	absoluteTimeInSeconds,
	globalPlaybackRate,
}: {
	audioContext: AudioContext;
	audioSyncAnchor: {value: number};
	absoluteTimeInSeconds: number;
	globalPlaybackRate: number;
}): void => {
	const newAnchor =
		audioContext.currentTime - absoluteTimeInSeconds / globalPlaybackRate;
	const shift = (newAnchor - audioSyncAnchor.value) * globalPlaybackRate;

	// Skip small shifts to avoid audio glitches from frame-quantized re-anchoring
	if (Math.abs(shift) < 0.1) {
		return;
	}

	console.log('set new anchor', absoluteTimeInSeconds, shift);
	audioSyncAnchor.value = newAnchor;
};
