import {getWaveformPortion} from './get-waveform-portion';
import {AudioData} from './types';

const cache: {[key: string]: number[]} = {};

type FnParameters = {
	audioData: AudioData;
	frame: number;
	fps: number;
	numberOfSamples: number;
};

const visualizeAudioWaveformFrame = ({
	audioData,
	frame,
	fps,
	numberOfSamples,
}: FnParameters) => {
	// const cacheKey =
	// 	audioData.resultId + frame + fps + numberOfSamples + 'waveform';
	// if (cache[cacheKey]) {
	// 	return cache[cacheKey];
	// }

	const startTimeInSeconds =
		frame / fps < 0.25
			? 0
			: frame / fps + 0.25 >= audioData.durationInSeconds
			? audioData.durationInSeconds - 0.5
			: frame / fps - 0.25;
	return getWaveformPortion({
		audioData,
		startTimeInSeconds,
		durationInSeconds: 0.5,
		numberOfSamples,
	});
};

export const visualizeAudioWaveform = ({
	smoothing = true,
	...parameters
}: FnParameters & {
	smoothing?: boolean;
}) => {
	if (smoothing) {
		console.log('nice');
	}

	const data = visualizeAudioWaveformFrame(parameters);
	return data.map((value) => value.amplitude);
};
