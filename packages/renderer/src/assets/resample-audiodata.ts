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
}: {
	srcNumberOfChannels: number;
	sourceChannels: Int16Array;
	destination: Int16Array;
	targetFrames: number;
	chunkSize: number;
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

		return average;
	};

	for (let newFrameIndex = 0; newFrameIndex < targetFrames; newFrameIndex++) {
		const start = newFrameIndex * chunkSize;
		const end = start + chunkSize;

		if (TARGET_NUMBER_OF_CHANNELS !== srcNumberOfChannels) {
			throw new Error('srcNumberOfChannels must be 2');
		}

		for (let i = 0; i < srcNumberOfChannels; i++) {
			destination[newFrameIndex * srcNumberOfChannels + i] = getSourceValues(
				start,
				end,
				i,
			);
		}
	}
};
