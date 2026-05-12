import {TARGET_SAMPLE_RATE} from './load-waveform-peaks';

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

	return peaks.subarray(
		Math.max(0, startPeakIndex),
		Math.min(peaks.length, endPeakIndex),
	);
};
