// Remotion exports all videos with 2 channels.
export const TARGET_NUMBER_OF_CHANNELS = 2;

// Remotion exports all videos with 48kHz sample rate.
export const TARGET_SAMPLE_RATE = 48000;

const fixFloatingPoint = (value: number) => {
	if (value % 1 < 0.0000001) {
		return Math.floor(value);
	}

	if (value % 1 > 0.9999999) {
		return Math.ceil(value);
	}

	return value;
};

export const resampleAudioData = ({
	srcNumberOfChannels,
	sourceChannels,
	destination,
	targetFrames,
	chunkSize,
	volume,
}: {
	srcNumberOfChannels: number;
	sourceChannels: Int16Array;
	destination: Int16Array;
	targetFrames: number;
	chunkSize: number;
	volume: number;
}) => {
	const getSourceValues = (
		startUnfixed: number,
		endUnfixed: number,
		channelIndex: number,
	) => {
		const start = fixFloatingPoint(startUnfixed);
		const end = fixFloatingPoint(endUnfixed);
		const startFloor = Math.floor(start);
		const startCeil = Math.ceil(start);
		const startFraction = start - startFloor;
		const endFraction = end - Math.floor(end);
		const endFloor = Math.floor(end);

		let weightedSum = 0;
		let totalWeight = 0;

		// Handle first fractional sample
		if (startFraction > 0) {
			const firstSample =
				sourceChannels[startFloor * srcNumberOfChannels + channelIndex];
			weightedSum += firstSample * (1 - startFraction);
			totalWeight += 1 - startFraction;
		}

		// Handle full samples
		for (let k = startCeil; k < endFloor; k++) {
			const num = sourceChannels[k * srcNumberOfChannels + channelIndex];
			weightedSum += num;
			totalWeight += 1;
		}

		// Handle last fractional sample
		if (endFraction > 0) {
			const lastSample =
				sourceChannels[endFloor * srcNumberOfChannels + channelIndex];
			weightedSum += lastSample * endFraction;
			totalWeight += endFraction;
		}

		const average = weightedSum / totalWeight;
		const averageVolume = average * volume;

		if (averageVolume < -32768) {
			return -32768;
		}

		if (averageVolume > 32767) {
			return 32767;
		}

		return averageVolume;
	};

	for (let newFrameIndex = 0; newFrameIndex < targetFrames; newFrameIndex++) {
		const start = newFrameIndex * chunkSize;
		const end = start + chunkSize;

		if (TARGET_NUMBER_OF_CHANNELS === srcNumberOfChannels) {
			for (let i = 0; i < srcNumberOfChannels; i++) {
				destination[newFrameIndex * srcNumberOfChannels + i] = getSourceValues(
					start,
					end,
					i,
				);
			}
		}

		// The following formulas were taken from Mediabunnys audio resampler:
		// https://github.com/Vanilagy/mediabunny/blob/b9f7ab2fa2b9167784cbded044d466185308999f/src/conversion.ts

		// Mono to Stereo: M -> L, M -> R
		if (srcNumberOfChannels === 1) {
			const m = getSourceValues(start, end, 0);

			destination[newFrameIndex * 2 + 0] = m;
			destination[newFrameIndex * 2 + 1] = m;
		}

		// Quad to Stereo: 0.5 * (L + SL), 0.5 * (R + SR)
		else if (srcNumberOfChannels === 4) {
			const l = getSourceValues(start, end, 0);
			const r = getSourceValues(start, end, 1);
			const sl = getSourceValues(start, end, 2);
			const sr = getSourceValues(start, end, 3);

			const l2 = 0.5 * (l + sl);
			const r2 = 0.5 * (r + sr);

			destination[newFrameIndex * 2 + 0] = l2;
			destination[newFrameIndex * 2 + 1] = r2;
		}

		// 5.1 to Stereo: L + sqrt(1/2) * (C + SL), R + sqrt(1/2) * (C + SR)
		else if (srcNumberOfChannels === 6) {
			const l = getSourceValues(start, end, 0);
			const r = getSourceValues(start, end, 1);
			const c = getSourceValues(start, end, 2);
			const sl = getSourceValues(start, end, 3);
			const sr = getSourceValues(start, end, 4);

			const sq = Math.sqrt(1 / 2);
			const l2 = l + sq * (c + sl);
			const r2 = r + sq * (c + sr);

			destination[newFrameIndex * 2 + 0] = l2;
			destination[newFrameIndex * 2 + 1] = r2;
		}

		// Discrete fallback: direct mapping with zero-fill or drop
		else {
			for (let i = 0; i < srcNumberOfChannels; i++) {
				destination[newFrameIndex * TARGET_NUMBER_OF_CHANNELS + i] =
					getSourceValues(start, end, i);
			}
		}
	}
};
