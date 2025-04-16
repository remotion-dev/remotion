import type {AudioOrVideoSample} from '../../webcodec-sample-types';

export const riffSampleCounter = () => {
	const samplesForTrack: Record<number, number> = {};

	const onAudioSample = (trackId: number, audioSample: AudioOrVideoSample) => {
		if (typeof samplesForTrack[trackId] === 'undefined') {
			samplesForTrack[trackId] = 0;
		}

		if (audioSample.data.length > 0) {
			samplesForTrack[trackId]++;
		}

		samplesForTrack[trackId]++;
	};

	const onVideoSample = (trackId: number, videoSample: AudioOrVideoSample) => {
		if (typeof samplesForTrack[trackId] === 'undefined') {
			samplesForTrack[trackId] = 0;
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
	};
};
