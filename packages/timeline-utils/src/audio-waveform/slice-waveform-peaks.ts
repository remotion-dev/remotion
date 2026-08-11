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

	if (!Number.isFinite(startPeakIndex) || !Number.isFinite(endPeakIndex)) {
		return peaks.subarray(
			Math.max(0, startPeakIndex),
			Math.min(peaks.length, endPeakIndex),
		);
	}

	if (startPeakIndex >= 0 && endPeakIndex <= peaks.length) {
		return peaks.subarray(startPeakIndex, endPeakIndex);
	}

	const portion = new Float32Array(Math.max(0, endPeakIndex - startPeakIndex));
	const sourceStart = Math.max(0, startPeakIndex);
	const sourceEnd = Math.min(peaks.length, endPeakIndex);

	if (sourceStart < sourceEnd) {
		portion.set(
			peaks.subarray(sourceStart, sourceEnd),
			sourceStart - startPeakIndex,
		);
	}

	return portion;
};
