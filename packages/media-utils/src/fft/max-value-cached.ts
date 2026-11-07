// Adapted from node-fft project by Joshua Wong and Ben Bryan
// https://github.com/vail-systems/node-fft

import type {MediaUtilsAudioData} from '../types';
import {toInt16} from './to-int-16';

const getMax = (array: Float32Array) => {
	let max = 0;
	for (let i = 0; i < array.length; i++) {
		const val = Math.abs(toInt16(array[i]));
		if (val > max) {
			max = val;
		}
	}

	return max;
};

const cache: {
	[key: string]: number;
} = {};

export const getMaxPossibleMagnitude = (metadata: MediaUtilsAudioData) => {
	if (cache[metadata.resultId]) {
		return cache[metadata.resultId];
	}

	// Avoid dividing by zero when the audio is silent.
	const result = getMax(metadata.channelWaveforms[0]) || 1;
	cache[metadata.resultId] = result;
	return result;
};
