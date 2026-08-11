type Progress = {
	readonly peaks: Float32Array;
	readonly completedPeaks: number;
	readonly totalPeaks: number;
	readonly final: boolean;
};

type WaveformPeakProcessorOptions = {
	readonly totalPeaks: number;
	readonly samplesPerPeak: number;
	readonly onProgress?: (progress: Progress) => void;
	readonly progressIntervalInMs: number;
	readonly now: () => number;
};

type WaveformPeakProcessor = {
	readonly peaks: Float32Array;
	processSampleChunk: (floats: Float32Array, channels: number) => void;
	finalize: () => void;
};

export const emitWaveformProgress = ({
	completedPeaks,
	final,
	onProgress,
	peaks,
	totalPeaks,
}: Progress & {
	readonly onProgress?: (progress: Progress) => void;
}) => {
	onProgress?.({
		peaks,
		completedPeaks,
		totalPeaks,
		final,
	});
};

export const createWaveformPeakProcessor = ({
	totalPeaks,
	samplesPerPeak,
	onProgress,
	progressIntervalInMs,
	now,
}: WaveformPeakProcessorOptions): WaveformPeakProcessor => {
	const peaks = new Float32Array(totalPeaks);
	let peakIndex = 0;
	let peakMax = 0;
	let sampleInPeak = 0;
	let lastProgressAt = 0;
	let lastProgressPeak = 0;

	const emitProgress = (force: boolean) => {
		const timestamp = now();
		if (!force && peakIndex === lastProgressPeak && sampleInPeak === 0) {
			return;
		}

		if (!force && timestamp - lastProgressAt < progressIntervalInMs) {
			return;
		}

		lastProgressAt = timestamp;
		lastProgressPeak = peakIndex;
		emitWaveformProgress({
			peaks,
			completedPeaks: peakIndex,
			totalPeaks,
			final: force,
			onProgress,
		});
	};

	return {
		peaks,
		processSampleChunk: (floats, channels) => {
			const frameCount = Math.floor(floats.length / Math.max(1, channels));

			for (let frame = 0; frame < frameCount; frame++) {
				// `f32` copies are interleaved, so timing advances per frame.
				let framePeak = 0;
				for (let channel = 0; channel < channels; channel++) {
					const sampleIndex = frame * channels + channel;
					const abs = Math.abs(floats[sampleIndex] ?? 0);
					if (abs > framePeak) {
						framePeak = abs;
					}
				}

				if (framePeak > peakMax) {
					peakMax = framePeak;
				}

				sampleInPeak++;

				if (sampleInPeak >= samplesPerPeak) {
					if (peakIndex < totalPeaks) {
						peaks[peakIndex] = peakMax;
					}

					peakIndex++;
					peakMax = 0;
					sampleInPeak = 0;
				}
			}

			emitProgress(false);
		},
		finalize: () => {
			if (sampleInPeak > 0 && peakIndex < totalPeaks) {
				peaks[peakIndex] = peakMax;
				peakIndex++;
			}

			emitProgress(true);
		},
	};
};
