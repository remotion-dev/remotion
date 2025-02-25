import type {Bar} from './get-waveform-portion';
import {getWaveformPortion} from './get-waveform-portion';
import type {AudioData} from './types';

const cache: {[key: string]: Bar[]} = {};

export type VisualizeAudioWaveformOptions = {
	audioData: AudioData;
	frame: number;
	fps: number;
	windowInSeconds: number;
	numberOfSamples: number;
	channel?: number;
	dataOffsetInSeconds?: number;
};

const visualizeAudioWaveformFrame = ({
	audioData,
	frame,
	fps,
	numberOfSamples,
	windowInSeconds,
	channel,
	dataOffsetInSeconds,
}: VisualizeAudioWaveformOptions) => {
	if (windowInSeconds * audioData.sampleRate < numberOfSamples) {
		throw new TypeError(
			windowInSeconds +
				's audiodata does not have ' +
				numberOfSamples +
				' bars. Increase windowInSeconds or decrease numberOfSamples',
		);
	}

	const cacheKey =
		audioData.resultId +
		frame +
		fps +
		numberOfSamples +
		'waveform' +
		dataOffsetInSeconds;
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
		dataOffsetInSeconds,
	});
};

export const visualizeAudioWaveform = (
	parameters: VisualizeAudioWaveformOptions,
) => {
	const data = visualizeAudioWaveformFrame(parameters);
	return data.map((value) => value.amplitude);
};
