import {getVisualization} from './fft/get-visualization';
import {getMaxPossibleMagnitude} from './fft/max-value-cached';
import {AudioData} from './types';

const cache: {[key: string]: number[]} = {};

export const visualizeAudio = ({
	metadata,
	frame,
	fps,
	numberOfSamples,
}: {
	metadata: AudioData;
	frame: number;
	fps: number;
	numberOfSamples: number;
}) => {
	const cacheKey = metadata.resultId + frame + fps + numberOfSamples;
	if (cache[cacheKey]) {
		return cache[cacheKey];
	}

	const maxInt = getMaxPossibleMagnitude(metadata);

	return getVisualization({
		sampleSize: numberOfSamples * 2,
		data: metadata.channelWaveforms[0],
		frame,
		fps,
		sampleRate: metadata.sampleRate,
		maxInt,
	});
};
