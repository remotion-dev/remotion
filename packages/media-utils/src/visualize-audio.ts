import {getVisualization} from './fft/get-visualization';
import {getMaxPossibleMagnitude} from './fft/max-value-cached';
import type {AudioData} from './types';

const cache: {[key: string]: number[]} = {};

type FnParameters = {
	audioData: AudioData;
	frame: number;
	fps: number;
	numberOfSamples: number;
};

const visualizeAudioFrame = ({
	audioData: metadata,
	frame,
	fps,
	numberOfSamples,
}: FnParameters) => {
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

export const visualizeAudio = ({
	smoothing = true,
	...parameters
}: FnParameters & {
	smoothing?: boolean;
}) => {
	if (!smoothing) {
		return visualizeAudioFrame(parameters);
	}

	const toSmooth = [
		parameters.frame - 1,
		parameters.frame,
		parameters.frame + 1,
	];
	const all = toSmooth.map((s) => {
		return visualizeAudioFrame({...parameters, frame: s});
	});
	return new Array(parameters.numberOfSamples).fill(true).map((_x, i) => {
		return (
			new Array(toSmooth.length)
				.fill(true)
				.map((_, j) => {
					return all[j][i];
				})
				.reduce((a, b) => a + b, 0) / toSmooth.length
		);
	});
};
