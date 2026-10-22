import {TARGET_SAMPLE_RATE} from './constants';

export const sliceWaveformPeaks = ({
	durationInFrames,
	fps,
	peaks,
	playbackRate,
	startFrom,
	waveformSampleRate = TARGET_SAMPLE_RATE,
}: {
	readonly peaks: Float32Array;
	readonly startFrom: number;
	readonly durationInFrames: number;
	readonly fps: number;
	readonly playbackRate: number;
	readonly waveformSampleRate?: number;
}) => {
	if (peaks.length === 0) {
		return peaks;
	}

	const startTimeInSeconds = startFrom / fps;
	const durationInSeconds = (durationInFrames / fps) * playbackRate;

	const start = startTimeInSeconds * waveformSampleRate;
	const end = (startTimeInSeconds + durationInSeconds) * waveformSampleRate;
	// Fractional loop periods can round an exact trim boundary a few ULPs past
	// the next sample. Do not include a peak from outside the trimmed source.
	const startPeakIndex = Math.floor(
		start +
			(Number.isFinite(start)
				? Number.EPSILON * Math.max(1, Math.abs(start)) * 4
				: 0),
	);
	const endPeakIndex = Math.ceil(
		end -
			(Number.isFinite(end)
				? Number.EPSILON * Math.max(1, Math.abs(end)) * 4
				: 0),
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
