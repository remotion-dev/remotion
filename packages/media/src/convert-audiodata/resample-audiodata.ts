// Remotion exports all videos with 2 channels.
export const TARGET_NUMBER_OF_CHANNELS = 2;

export const resampleAudioData = ({
	srcNumberOfChannels,
	source: srcChannels,
	destination,
	newNumberOfFrames,
	chunkSize,
}: {
	srcNumberOfChannels: number;
	source: Int16Array;
	destination: Int16Array;
	newNumberOfFrames: number;
	chunkSize: number;
}) => {
	for (
		let newFrameIndex = 0;
		newFrameIndex < newNumberOfFrames;
		newFrameIndex++
	) {
		const start = Math.floor(newFrameIndex * chunkSize);
		const end = Math.max(Math.floor(start + chunkSize), start + 1);

		const sourceValues = new Array(srcNumberOfChannels).fill(0);

		for (
			let channelIndex = 0;
			channelIndex < srcNumberOfChannels;
			channelIndex++
		) {
			const sampleCountAvg = end - start;

			let itemSum = 0;
			let itemCount = 0;
			for (let k = 0; k < sampleCountAvg; k++) {
				const num =
					srcChannels[(start + k) * srcNumberOfChannels + channelIndex];
				itemSum += num;
				itemCount++;
			}

			const average = itemSum / itemCount;

			sourceValues[channelIndex] = average;
		}

		if (TARGET_NUMBER_OF_CHANNELS === srcNumberOfChannels) {
			for (let i = 0; i < srcNumberOfChannels; i++) {
				destination[newFrameIndex * srcNumberOfChannels + i] = sourceValues[i];
			}
		}

		// The following formulas were taken from Mediabunnys audio resampler:
		// https://github.com/Vanilagy/mediabunny/blob/b9f7ab2fa2b9167784cbded044d466185308999f/src/conversion.ts

		// Mono to Stereo: M -> L, M -> R
		if (srcNumberOfChannels === 1) {
			const m = sourceValues[0];
			const l = m;
			const r = m;

			destination[newFrameIndex * 2 + 0] = l;
			destination[newFrameIndex * 2 + 1] = r;
		}

		// Quad to Stereo: 0.5 * (L + SL), 0.5 * (R + SR)
		else if (srcNumberOfChannels === 4) {
			const l = sourceValues[0];
			const r = sourceValues[1];
			const sl = sourceValues[2];
			const sr = sourceValues[3];

			const l2 = 0.5 * (l + sl);
			const r2 = 0.5 * (r + sr);

			destination[newFrameIndex * 2 + 0] = l2;
			destination[newFrameIndex * 2 + 1] = r2;
		}

		// 5.1 to Stereo: L + sqrt(1/2) * (C + SL), R + sqrt(1/2) * (C + SR)
		else if (srcNumberOfChannels === 6) {
			const l = sourceValues[0];
			const r = sourceValues[1];
			const c = sourceValues[2];
			const sl = sourceValues[3];
			const sr = sourceValues[4];

			const l2 = l + Math.sqrt(1 / 2) * (c + sl);
			const r2 = r + Math.sqrt(1 / 2) * (c + sr);

			destination[newFrameIndex * 2 + 0] = l2;
			destination[newFrameIndex * 2 + 1] = r2;
		}

		// Discrete fallback: direct mapping with zero-fill or drop
		else {
			for (let i = 0; i < srcNumberOfChannels; i++) {
				destination[newFrameIndex * TARGET_NUMBER_OF_CHANNELS + i] =
					sourceValues[i];
			}
		}
	}
};
