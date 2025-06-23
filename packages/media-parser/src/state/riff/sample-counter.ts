import type {
	MediaParserAudioSample,
	MediaParserVideoSample,
} from '../../webcodec-sample-types';
import {WEBCODECS_TIMESCALE} from '../../webcodecs-timescale';
import type {QueuedVideoSample} from './queued-frames';
import {riffKeyframesState} from './riff-keyframes';

export const riffSampleCounter = () => {
	const samplesForTrack: Record<number, number> = {};

	// keyframe offset -> poc[]
	const pocsAtKeyframeOffset: Record<number, number[]> = {};

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

	const onVideoSample = ({
		trackId,
		videoSample,
	}: {
		videoSample: MediaParserVideoSample;
		trackId: number;
	}) => {
		if (typeof samplesForTrack[trackId] === 'undefined') {
			samplesForTrack[trackId] = 0;
		}

		if (videoSample.type === 'key') {
			riffKeys.addKeyframe({
				trackId,
				decodingTimeInSeconds:
					videoSample.decodingTimestamp / WEBCODECS_TIMESCALE,
				positionInBytes: videoSample.offset,
				presentationTimeInSeconds: videoSample.timestamp / WEBCODECS_TIMESCALE,
				sizeInBytes: videoSample.data.length,
				sampleCounts: {...samplesForTrack},
			});
		}

		if (videoSample.data.length > 0) {
			samplesForTrack[trackId]++;
		}
	};

	const getSampleCountForTrack = ({trackId}: {trackId: number}) => {
		return samplesForTrack[trackId] ?? 0;
	};

	const setSamplesFromSeek = (samples: Record<number, number>) => {
		for (const trackId in samples) {
			samplesForTrack[trackId] = samples[trackId];
		}
	};

	const setPocAtKeyframeOffset = ({
		keyframeOffset,
		poc,
	}: {
		keyframeOffset: number;
		poc: number;
	}) => {
		if (typeof pocsAtKeyframeOffset[keyframeOffset] === 'undefined') {
			pocsAtKeyframeOffset[keyframeOffset] = [];
		}

		if (pocsAtKeyframeOffset[keyframeOffset].includes(poc)) {
			return;
		}

		pocsAtKeyframeOffset[keyframeOffset].push(poc);
		pocsAtKeyframeOffset[keyframeOffset].sort((a, b) => a - b);
	};

	const getPocAtKeyframeOffset = ({
		keyframeOffset,
	}: {
		keyframeOffset: number;
	}) => {
		return pocsAtKeyframeOffset[keyframeOffset];
	};

	const getKeyframeAtOffset = (sample: QueuedVideoSample): number | null => {
		if (sample.type === 'key') {
			return sample.offset;
		}

		return (
			riffKeys
				.getKeyframes()
				.findLast((k) => k.positionInBytes <= sample.offset)?.positionInBytes ??
			null
		);
	};

	return {
		onAudioSample,
		onVideoSample,
		getSampleCountForTrack,
		setSamplesFromSeek,
		riffKeys,
		setPocAtKeyframeOffset,
		getPocAtKeyframeOffset,
		getKeyframeAtOffset,
	};
};
