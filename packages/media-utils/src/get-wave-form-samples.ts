const filterData = (audioBuffer: Float32Array, samples: number) => {
	const blockSize = Math.floor(audioBuffer.length / samples); // the number of samples in each subdivision
	if (blockSize === 0) {
		return [];
	}

	const filteredData = [];
	for (let i = 0; i < samples; i++) {
		const blockStart = blockSize * i; // the location of the first sample in the block
		let sum = 0;
		for (let j = 0; j < blockSize; j++) {
			sum += Math.abs(audioBuffer[blockStart + j]); // find the sum of all the samples in the block
		}

		filteredData.push(sum / blockSize); // divide the sum by the block size to get the average
	}

	return filteredData;
};

const normalizeData = (filteredData) => {
    const max = Math.max(...filteredData);
    
    // If the maximum amplitude is below this threshold, treat it as silence
    const MINIMUM_AMPLITUDE_THRESHOLD = 0.001;
    
    if (max < MINIMUM_AMPLITUDE_THRESHOLD) {
        return new Array(filteredData.length).fill(0);
    }
    
    const multiplier = max ** -1;
    return filteredData.map((n) => n * multiplier);
};

export const getWaveformSamples = (
	waveform: Float32Array,
	sampleAmount: number,
) => {
	return normalizeData(filterData(waveform, sampleAmount));
};
