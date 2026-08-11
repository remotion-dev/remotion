import {normalizeData} from './normalize-data';

export type SampleOutputRange = 'minus-one-to-one' | 'zero-to-one';

export const getWaveformSamples = ({
	audioBuffer,
	numberOfSamples,
	outputRange,
	normalize,
}: {
	audioBuffer: Float32Array;
	numberOfSamples: number;
	outputRange: SampleOutputRange;
	normalize: boolean;
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

		filteredData.push(sum / blockSize); // divide the sum by the block size to get the average
	}

	if (normalize) {
		if (outputRange === 'minus-one-to-one') {
			return normalizeData(filteredData).map((n, i) => {
				if (i % 2 === 0) {
					return n * -1;
				}

				return n;
			});
		}

		return normalizeData(filteredData);
	}

	if (outputRange === 'minus-one-to-one') {
		return filteredData.map((n, i) => {
			if (i % 2 === 0) {
				return n * -1;
			}

			return n;
		});
	}

	return filteredData;
};
