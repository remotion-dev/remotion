import {interpolate} from 'remotion';
import {
	WAVEFORM_BAR_LENGTH,
	WAVEFORM_BAR_MARGIN,
} from '../components/AudioWaveformBar';
import {AudioContextMetadata} from './get-audio-metadata';
import {getWaveformSamples} from './reduce-waveform';

type Bar = {
	index: number;
	amplitude: number;
};

export const getWaveformPortion = ({
	metadata,
	startFrom,
	fps,
	durationInFrames,
	visualizationWidth,
}: {
	metadata: AudioContextMetadata;
	startFrom: number;
	fps: number;
	durationInFrames: number;
	visualizationWidth: number;
}): Bar[] => {
	const startSample = Math.floor(
		interpolate(
			startFrom,
			[0, metadata.duration * fps],
			[0, metadata.channelWaveforms[0].length]
		)
	);
	const endSample = Math.floor(
		interpolate(
			startFrom + durationInFrames,
			[0, metadata.duration * fps],
			[0, metadata.channelWaveforms[0].length]
		)
	);
	const numberOfSamples = Math.floor(
		visualizationWidth / (WAVEFORM_BAR_LENGTH + WAVEFORM_BAR_MARGIN)
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
