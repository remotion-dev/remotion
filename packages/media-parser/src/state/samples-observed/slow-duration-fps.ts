import type {AudioOrVideoSample} from '../../webcodec-sample-types';

export const samplesObservedState = () => {
	let smallestVideoSample: number | undefined;
	let largestVideoSample: number | undefined;
	let smallestAudioSample: number | undefined;
	let largestAudioSample: number | undefined;
	let lastSampleObserved = false;

	const videoSamples: Map<number, number> = new Map();
	const audioSamples: Map<number, number> = new Map();

	const getSlowVideoDurationInSeconds = () => {
		let videoDuration: number | null = null;

		if (smallestVideoSample !== undefined && largestVideoSample !== undefined) {
			const startingTimestampDifference =
				largestVideoSample - smallestVideoSample;
			const timeBetweenSamples =
				startingTimestampDifference / (videoSamples.size - 1);
			videoDuration = timeBetweenSamples * videoSamples.size;
		}

		return videoDuration;
	};

	const getSlowDurationInSeconds = () => {
		const videoDuration = getSlowVideoDurationInSeconds();
		let audioDuration: number | null = null;

		if (smallestAudioSample !== undefined && largestAudioSample !== undefined) {
			const startingTimestampDifferenceAudio =
				largestAudioSample - smallestAudioSample;
			const timeBetweenSamplesAudio =
				startingTimestampDifferenceAudio / (audioSamples.size - 1);
			audioDuration = timeBetweenSamplesAudio * audioSamples.size;
		}

		return Math.max(videoDuration ?? 0, audioDuration ?? 0);
	};

	const addVideoSample = (videoSample: AudioOrVideoSample) => {
		videoSamples.set(videoSample.cts, videoSample.data.byteLength);
		const presentationTimeInSeconds = videoSample.cts / videoSample.timescale;
		if (
			largestVideoSample === undefined ||
			presentationTimeInSeconds > largestVideoSample
		) {
			largestVideoSample = presentationTimeInSeconds;
		}

		if (
			smallestVideoSample === undefined ||
			presentationTimeInSeconds < smallestVideoSample
		) {
			smallestVideoSample = presentationTimeInSeconds;
		}
	};

	const addAudioSample = (audioSample: AudioOrVideoSample) => {
		audioSamples.set(audioSample.cts, audioSample.data.byteLength);
		const presentationTimeInSeconds = audioSample.cts / audioSample.timescale;
		if (
			largestAudioSample === undefined ||
			presentationTimeInSeconds > largestAudioSample
		) {
			largestAudioSample = presentationTimeInSeconds;
		}

		if (
			smallestAudioSample === undefined ||
			presentationTimeInSeconds < smallestAudioSample
		) {
			smallestAudioSample = presentationTimeInSeconds;
		}
	};

	const getFps = () => {
		const videoDuration = getSlowVideoDurationInSeconds() ?? 0;
		if (videoDuration === 0) {
			return 0;
		}

		return videoSamples.size / videoDuration;
	};

	const getSlowNumberOfFrames = () => videoSamples.size;

	const getAudioBitrate = () => {
		const audioDuration = getSlowDurationInSeconds();
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
		const videoDuration = getSlowDurationInSeconds();
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
	};
};

export type SamplesObservedState = ReturnType<typeof samplesObservedState>;
