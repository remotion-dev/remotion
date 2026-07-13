// Computes the pure pitch-shift ratio `P` that must be applied on top of the
// tempo change that each pipeline already performs natively (preview: native
// `AudioBufferSourceNode.playbackRate`; render: `convert-audiodata` resample).
//
// Let `R = playbackRate * globalPlaybackRate` be the combined playback rate.
// After the native tempo handling, the base pitch is already `×R` on both
// sides. To reach the desired net pitch we apply a duration-preserving pitch
// shift by `P`:
//
// - preservePitch === true  → net pitch should be `×toneFrequency`
//   ⇒ `×R · P = ×toneFrequency` ⇒ `P = toneFrequency / R`
// - preservePitch === false → net pitch should be `×(R · toneFrequency)`
//   ⇒ `×R · P = ×(R · toneFrequency)` ⇒ `P = toneFrequency`
//
// `P === 1` means the pitch shift is a no-op and can be skipped entirely.
export const computePitchRatio = ({
	preservePitch,
	toneFrequency,
	combinedPlaybackRate,
}: {
	preservePitch: boolean;
	toneFrequency: number;
	combinedPlaybackRate: number;
}): number => {
	if (preservePitch) {
		if (combinedPlaybackRate === 0) {
			return 1;
		}

		return toneFrequency / combinedPlaybackRate;
	}

	return toneFrequency;
};
