import type {Bar} from './get-waveform-portion';
import {getWaveformPortion} from './get-waveform-portion';
import type {MediaUtilsAudioData} from './types';

const cache: {[key: string]: Bar[]} = {};

export type VisualizeAudioWaveformOptions = {
	audioData: MediaUtilsAudioData;
	frame: number;
	fps: number;
	windowInSeconds: number;
	numberOfSamples: number;
	channel?: number;
	dataOffsetInSeconds?: number;
	normalize?: boolean;
};

const visualizeAudioWaveformFrame = ({
	audioData,
	frame,
	fps,
	numberOfSamples,
	windowInSeconds,
	channel,
	dataOffsetInSeconds,
	normalize = false,
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
		normalize,
	});
};

export const visualizeAudioWaveform = (
	parameters: VisualizeAudioWaveformOptions,
) => {
	const data = visualizeAudioWaveformFrame(parameters);
	return data.map((value) => value.amplitude);
};
