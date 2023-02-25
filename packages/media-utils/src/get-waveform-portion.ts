import {getWaveformSamples} from './get-wave-form-samples';
import type {AudioData} from './types';

type Bar = {
	index: number;
	amplitude: number;
};

/**
 * @description Takes bulky waveform data (for example fetched by getAudioData()) and returns a trimmed and simplified version of it, for simpler visualization
 * @see [Documentation](https://www.remotion.dev/docs/get-waveform-portion)
 */
export const getWaveformPortion = ({
	audioData,
	startTimeInSeconds,
	durationInSeconds,
	numberOfSamples,
}: {
	audioData: AudioData;
	startTimeInSeconds: number;
	durationInSeconds: number;
	numberOfSamples: number;
}): Bar[] => {
	const startSample = Math.floor(
		(startTimeInSeconds / audioData.durationInSeconds) *
			audioData.channelWaveforms[0].length
	);
	const endSample = Math.floor(
		((startTimeInSeconds + durationInSeconds) / audioData.durationInSeconds) *
			audioData.channelWaveforms[0].length
	);

	return getWaveformSamples(
		audioData.channelWaveforms[0].slice(startSample, endSample),
		numberOfSamples
	).map((w, i) => {
		return {
			index: i,
			amplitude: w,
		};
	});
};
