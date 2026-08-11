import type {
	MediaParserAudioSample,
	MediaParserVideoSample,
} from '../../webcodec-sample-types';
import {WEBCODECS_TIMESCALE} from '../../webcodecs-timescale';

export const samplesObservedState = () => {
	let smallestVideoSample: number | undefined;
	let largestVideoSample: number | undefined;
	let smallestAudioSample: number | undefined;
	let largestAudioSample: number | undefined;
	let lastSampleObserved = false;

	const videoSamples: Map<number, number> = new Map();
	const audioSamples: Map<number, number> = new Map();

	const getSlowVideoDurationInSeconds = () => {
		return (largestVideoSample ?? 0) - (smallestVideoSample ?? 0);
	};

	const getSlowAudioDurationInSeconds = () => {
		return (largestAudioSample ?? 0) - (smallestAudioSample ?? 0);
	};

	const getSlowDurationInSeconds = () => {
		const smallestSample = Math.min(
			smallestAudioSample ?? Infinity,
			smallestVideoSample ?? Infinity,
		);
		const largestSample = Math.max(
			largestAudioSample ?? 0,
			largestVideoSample ?? 0,
		);

		if (smallestSample === Infinity || largestSample === Infinity) {
			return 0;
		}

		return largestSample - smallestSample;
	};

	const addVideoSample = (videoSample: MediaParserVideoSample) => {
		videoSamples.set(videoSample.timestamp, videoSample.data.byteLength);
		const presentationTimeInSeconds =
			videoSample.timestamp / WEBCODECS_TIMESCALE;
		const duration = (videoSample.duration ?? 0) / WEBCODECS_TIMESCALE;
		if (
			largestVideoSample === undefined ||
			presentationTimeInSeconds > largestVideoSample
		) {
			largestVideoSample = presentationTimeInSeconds + duration;
		}

		if (
			smallestVideoSample === undefined ||
			presentationTimeInSeconds < smallestVideoSample
		) {
			smallestVideoSample = presentationTimeInSeconds;
		}
	};

	const addAudioSample = (audioSample: MediaParserAudioSample) => {
		audioSamples.set(audioSample.timestamp, audioSample.data.byteLength);
		const presentationTimeInSeconds =
			audioSample.timestamp / WEBCODECS_TIMESCALE;
		const duration = (audioSample.duration ?? 0) / WEBCODECS_TIMESCALE;
		if (
			largestAudioSample === undefined ||
			presentationTimeInSeconds > largestAudioSample
		) {
			largestAudioSample = presentationTimeInSeconds + duration;
		}

		if (
			smallestAudioSample === undefined ||
			presentationTimeInSeconds < smallestAudioSample
		) {
			smallestAudioSample = presentationTimeInSeconds;
		}
	};

	const getFps = () => {
		const videoDuration =
			(largestVideoSample ?? 0) - (smallestVideoSample ?? 0);
		if (videoDuration === 0) {
			return 0;
		}

		return (videoSamples.size - 1) / videoDuration;
	};

	const getSlowNumberOfFrames = () => videoSamples.size;

	const getAudioBitrate = () => {
		const audioDuration = getSlowAudioDurationInSeconds();
		if (audioDuration === 0 || audioSamples.size === 0) {
			return null;
		}

		const audioSizesInBytes = Array.from(audioSamples.values()).reduce(
			(acc, size) => acc + size,
			0,
		);
		return (audioSizesInBytes * 8) / audioDuration;
	};

	const getVideoBitrate = () => {
		const videoDuration = getSlowVideoDurationInSeconds();
		if (videoDuration === 0 || videoSamples.size === 0) {
			return null;
		}

		const videoSizesInBytes = Array.from(videoSamples.values()).reduce(
			(acc, size) => acc + size,
			0,
		);
		return (videoSizesInBytes * 8) / videoDuration;
	};

	const getLastSampleObserved = () => lastSampleObserved;

	const setLastSampleObserved = () => {
		lastSampleObserved = true;
	};

	return {
		addVideoSample,
		addAudioSample,
		getSlowDurationInSeconds,
		getFps,
		getSlowNumberOfFrames,
		getAudioBitrate,
		getVideoBitrate,
		getLastSampleObserved,
		setLastSampleObserved,
		getAmountOfSamplesObserved: () => videoSamples.size + audioSamples.size,
	};
};

export type SamplesObservedState = ReturnType<typeof samplesObservedState>;
