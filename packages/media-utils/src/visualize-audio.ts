import {NoReactInternals} from 'remotion/no-react';
import type {OptimizeFor} from './fft/get-visualization';
import {getVisualization} from './fft/get-visualization';
import {getMaxPossibleMagnitude} from './fft/max-value-cached';
import type {AudioData} from './types';

const cache: {[key: string]: number[]} = {};

type MandatoryVisualizeAudioOptions = {
	audioData: AudioData;
	frame: number;
	fps: number;
	numberOfSamples: number;
};

type OptionalVisualizeAudioOptions = {
	optimizeFor: OptimizeFor;
	dataOffsetInSeconds: number;
	smoothing: boolean;
};

export type VisualizeAudioOptions = MandatoryVisualizeAudioOptions &
	Partial<OptionalVisualizeAudioOptions>;

/**
 * @description Takes in AudioData (preferably fetched by the useAudioData() hook) and processes it in a way that makes visualizing the audio that is playing at the current frame easy.
 * @description part of @remotion/media-utils
 * @see [Documentation](https://www.remotion.dev/docs/visualize-audio)
 */
const visualizeAudioFrame = ({
	audioData,
	frame,
	fps,
	numberOfSamples,
	optimizeFor,
	dataOffsetInSeconds,
}: MandatoryVisualizeAudioOptions & OptionalVisualizeAudioOptions) => {
	const cacheKey = audioData.resultId + frame + fps + numberOfSamples;
	if (cache[cacheKey]) {
		return cache[cacheKey];
	}

	const maxInt = getMaxPossibleMagnitude(audioData);

	return getVisualization({
		sampleSize: numberOfSamples * 2,
		data: audioData.channelWaveforms[0],
		frame,
		fps,
		sampleRate: audioData.sampleRate,
		maxInt,
		optimizeFor,
		dataOffsetInSeconds,
	});
};

export const visualizeAudio = ({
	smoothing = true,
	optimizeFor = NoReactInternals.ENABLE_V5_BREAKING_CHANGES
		? 'speed'
		: 'accuracy',
	dataOffsetInSeconds = 0,
	...parameters
}: MandatoryVisualizeAudioOptions &
	Partial<OptionalVisualizeAudioOptions> & {}) => {
	if (!smoothing) {
		return visualizeAudioFrame({
			...parameters,
			optimizeFor,
			dataOffsetInSeconds,
			smoothing,
		});
	}

	const toSmooth = [
		parameters.frame - 1,
		parameters.frame,
		parameters.frame + 1,
	];
	const all = toSmooth.map((s) => {
		return visualizeAudioFrame({
			...parameters,
			frame: s,
			dataOffsetInSeconds,
			optimizeFor,
			smoothing,
		});
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
