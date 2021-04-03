import {getWaveformSamples} from './get-wave-form-samples';
import {AudioData} from './types';

type Bar = {
	index: number;
	amplitude: number;
};

export const getWaveformPortion = ({
	metadata,
	startFrom,
	fps,
	durationInFrames,
	numberOfSamples,
}: {
	metadata: AudioData;
	startFrom: number;
	fps: number;
	durationInFrames: number;
	numberOfSamples: number;
}): Bar[] => {
	const startSample = Math.floor(
		(startFrom / (metadata.duration / fps)) *
			metadata.channelWaveforms[0].length
	);
	const endSample = Math.floor(
		((startFrom + durationInFrames) / (metadata.duration * fps)) *
			metadata.channelWaveforms[0].length
	);

	return getWaveformSamples(
		metadata.channelWaveforms[0].slice(startSample, endSample),
		numberOfSamples
	).map((w, i) => {
		return {
			index: i,
			amplitude: w,
		};
	});
};
