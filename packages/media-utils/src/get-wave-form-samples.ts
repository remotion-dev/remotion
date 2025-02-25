export type SampleOutputRange = 'minus-one-to-one' | 'zero-to-one';

export const getWaveformSamples = ({
	audioBuffer,
	numberOfSamples,
	outputRange,
}: {
	audioBuffer: Float32Array;
	numberOfSamples: number;
	outputRange: SampleOutputRange;
}) => {
	const blockSize = Math.floor(audioBuffer.length / numberOfSamples); // the number of samples in each subdivision
	if (blockSize === 0) {
		return [];
	}

	const filteredData = [];
	for (let i = 0; i < numberOfSamples; i++) {
		const blockStart = blockSize * i; // the location of the first sample in the block
		let sum = 0;
		for (let j = 0; j < blockSize; j++) {
			sum += Math.abs(audioBuffer[blockStart + j]); // find the sum of all the samples in the block
		}

		filteredData.push(
			(sum / blockSize) *
				(i % 2 === 0 && outputRange === 'minus-one-to-one' ? -1 : 1),
		); // divide the sum by the block size to get the average
	}

	return filteredData;
};
