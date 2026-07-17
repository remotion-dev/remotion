import {TARGET_SAMPLE_RATE} from './constants';

export const sliceWaveformPeaks = ({
	durationInFrames,
	fps,
	peaks,
	playbackRate,
	startFrom,
}: {
	readonly peaks: Float32Array;
	readonly startFrom: number;
	readonly durationInFrames: number;
	readonly fps: number;
	readonly playbackRate: number;
}) => {
	if (peaks.length === 0) {
		return peaks;
	}

	const startTimeInSeconds = startFrom / fps;
	const durationInSeconds = (durationInFrames / fps) * playbackRate;

	const startPeakIndex = Math.floor(startTimeInSeconds * TARGET_SAMPLE_RATE);
	const endPeakIndex = Math.ceil(
		(startTimeInSeconds + durationInSeconds) * TARGET_SAMPLE_RATE,
	);

	const startIndex = Math.max(0, startPeakIndex);
	const availableEnd = Math.min(
		peaks.length,
		Math.max(startIndex, endPeakIndex),
	);
	const available = peaks.subarray(startIndex, availableEnd);

	// Peak slots that represent this timeline window after clamping a negative
	// start (same as before). When playbackRate > 1 asks for media past EOF,
	// pad with silence so drawBars compresses the real peaks instead of
	// stretching them across the full sequence width.
	const expectedLength = Math.max(0, endPeakIndex - startIndex);
	if (available.length === expectedLength) {
		return available;
	}

	const padded = new Float32Array(expectedLength);
	padded.set(available);
	return padded;
};
