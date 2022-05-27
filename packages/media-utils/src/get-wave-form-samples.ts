export type SampleOutputRange = 'minus-one-to-one' | 'zero-to-one';

const filterData = (
	audioBuffer: Float32Array,
	samples: number,
	outputRange: SampleOutputRange
) => {
	const blockSize = Math.floor(audioBuffer.length / samples); // the number of samples in each subdivision
	if (blockSize === 0) {
		return [];
	}

	const filteredData = [];
	for (let i = 0; i < samples; i++) {
		const blockStart = blockSize * i; // the location of the first sample in the block
		let sum = 0;
		for (let j = 0; j < blockSize; j++) {
			sum +=
				outputRange === 'minus-one-to-one'
					? audioBuffer[blockStart + j]
					: Math.abs(audioBuffer[blockStart + j]); // find the sum of all the samples in the block
		}

		filteredData.push(sum / blockSize); // divide the sum by the block size to get the average
	}

	return filteredData;
};

export const getWaveformSamples = (
	waveform: Float32Array,
	sampleAmount: number,
	outputRange: SampleOutputRange
) => {
	return filterData(waveform, sampleAmount, outputRange);
};
