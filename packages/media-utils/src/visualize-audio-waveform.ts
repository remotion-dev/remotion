import {Bar, getWaveformPortion} from './get-waveform-portion';
import {AudioData} from './types';

const cache: {[key: string]: Bar[]} = {};

type FnParameters = {
	audioData: AudioData;
	frame: number;
	fps: number;
	windowInSeconds: number;
	numberOfSamples: number;
	channel: number;
};

const visualizeAudioWaveformFrame = ({
	audioData,
	frame,
	fps,
	numberOfSamples,
	windowInSeconds,
	channel,
}: FnParameters) => {
	if (windowInSeconds * audioData.sampleRate < numberOfSamples) {
		throw new TypeError(
			windowInSeconds +
				's audiodata does not have ' +
				numberOfSamples +
				' bars. Increase windowInSeconds or decrease numberOfSamples'
		);
	}

	const cacheKey =
		audioData.resultId + frame + fps + numberOfSamples + 'waveform';
	if (cache[cacheKey]) {
		return cache[cacheKey];
	}

	const time = frame / fps;

	const startTimeInSeconds = time - windowInSeconds / 2;

	return getWaveformPortion({
		audioData,
		startTimeInSeconds,
		durationInSeconds: windowInSeconds,
		numberOfSamples,
		outputRange: 'minus-one-to-one',
		channel,
	});
};

export const visualizeAudioWaveform = ({...parameters}: FnParameters) => {
	const data = visualizeAudioWaveformFrame(parameters);
	return data.map((value) => value.amplitude);
};
