import type {
	MediaParserAudioSample,
	MediaParserVideoSample,
} from '../../webcodec-sample-types';
import {riffKeyframesState} from './riff-keyframes';

export const riffSampleCounter = () => {
	const samplesForTrack: Record<number, number> = {};

	const riffKeys = riffKeyframesState();

	const onAudioSample = (
		trackId: number,
		audioSample: MediaParserAudioSample,
	) => {
		if (typeof samplesForTrack[trackId] === 'undefined') {
			samplesForTrack[trackId] = 0;
		}

		if (audioSample.data.length > 0) {
			samplesForTrack[trackId]++;
		}

		samplesForTrack[trackId]++;
	};

	const onVideoSample = (
		trackId: number,
		videoSample: MediaParserVideoSample,
	) => {
		if (typeof samplesForTrack[trackId] === 'undefined') {
			samplesForTrack[trackId] = 0;
		}

		if (videoSample.type === 'key') {
			riffKeys.addKeyframe({
				trackId,
				decodingTimeInSeconds: videoSample.dts / videoSample.timescale,
				positionInBytes: videoSample.offset,
				presentationTimeInSeconds: videoSample.cts / videoSample.timescale,
				sizeInBytes: videoSample.data.length,
				sampleCounts: {...samplesForTrack},
			});
		}

		if (videoSample.data.length > 0) {
			samplesForTrack[trackId]++;
		}
	};

	const getSamplesForTrack = (trackId: number) => {
		return samplesForTrack[trackId] ?? 0;
	};

	const setSamplesFromSeek = (samples: Record<number, number>) => {
		for (const trackId in samples) {
			samplesForTrack[trackId] = samples[trackId];
		}
	};

	return {
		onAudioSample,
		onVideoSample,
		getSamplesForTrack,
		setSamplesFromSeek,
		riffKeys,
	};
};
