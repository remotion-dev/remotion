// Short enough to be imperceptible to the ear, long enough to avoid a click.
// See https://github.com/remotion-dev/remotion/issues/7140.
const RAMP_DURATION_SECONDS = 0.02;

export const resumeAudioContextWithRamp = (
	audioContext: AudioContext,
	masterGain: GainNode,
): Promise<void> => {
	const now = audioContext.currentTime;
	masterGain.gain.cancelScheduledValues(now);
	masterGain.gain.setValueAtTime(0, now);
	masterGain.gain.linearRampToValueAtTime(1, now + RAMP_DURATION_SECONDS);
	return audioContext.resume();
};
