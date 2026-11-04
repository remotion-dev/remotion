// Peaks are drawn on a decibel scale and can be boosted by the volume, so a
// linear 8-bit encoding would flatten quiet passages. Encoding in 1/3 dB steps
// keeps 0 dB exactly representable, from -72 dB (1) up to +12.67 dB (255).
// 0 is reserved for silence.
const MIN_DECIBELS = -72;
const STEPS_PER_DECIBEL = 3;
const FULL_SCALE_CODE = -MIN_DECIBELS * STEPS_PER_DECIBEL + 1;

const decodeTable = new Float32Array(256);
for (let code = 1; code < 256; code++) {
	decodeTable[code] =
		10 ** ((MIN_DECIBELS + (code - 1) / STEPS_PER_DECIBEL) / 20);
}

export const quantizeWaveformPeaks = (peaks: Float32Array): Uint8Array => {
	const quantized = new Uint8Array(peaks.length);
	for (let i = 0; i < peaks.length; i++) {
		const peak = peaks[i];
		if (!(peak > 0)) {
			continue;
		}

		const code =
			Math.round((20 * Math.log10(peak) - MIN_DECIBELS) * STEPS_PER_DECIBEL) +
			1;
		if (code < 1) {
			continue;
		}

		// Never round a peak across full scale, so clipping is still detected.
		quantized[i] =
			peak > 1
				? Math.min(255, Math.max(FULL_SCALE_CODE + 1, code))
				: Math.min(FULL_SCALE_CODE, code);
	}

	return quantized;
};

export const dequantizeWaveformPeaks = (
	quantized: Uint8Array,
): Float32Array => {
	const peaks = new Float32Array(quantized.length);
	for (let i = 0; i < quantized.length; i++) {
		peaks[i] = decodeTable[quantized[i]];
	}

	return peaks;
};
