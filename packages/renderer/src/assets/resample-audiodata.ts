import {NUMBER_OF_CHANNELS} from './change-tonefrequency';

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
	sourceChannels,
	destination,
	targetFrames,
	chunkSize,
}: {
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
				sourceChannels[startFloor * NUMBER_OF_CHANNELS + channelIndex];
			weightedSum += firstSample * (1 - startFraction);
			totalWeight += 1 - startFraction;
		}

		// Handle full samples
		for (let k = startCeil; k < endFloor; k++) {
			const num = sourceChannels[k * NUMBER_OF_CHANNELS + channelIndex];
			weightedSum += num;
			totalWeight += 1;
		}

		// Handle last fractional sample
		if (endFraction > 0) {
			const lastSample =
				sourceChannels[endFloor * NUMBER_OF_CHANNELS + channelIndex];
			weightedSum += lastSample * endFraction;
			totalWeight += endFraction;
		}

		const average = weightedSum / totalWeight;

		return average;
	};

	for (let newFrameIndex = 0; newFrameIndex < targetFrames; newFrameIndex++) {
		const start = newFrameIndex * chunkSize;
		const end = start + chunkSize;

		for (let i = 0; i < NUMBER_OF_CHANNELS; i++) {
			destination[newFrameIndex * NUMBER_OF_CHANNELS + i] = getSourceValues(
				start,
				end,
				i,
			);
		}
	}
};
