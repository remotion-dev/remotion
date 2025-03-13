import type {AudioOrVideoSample} from '../webcodec-sample-types';

export const slowDurationAndFpsState = () => {
	let smallestVideoSample: number | undefined;
	let largestVideoSample: number | undefined;
	let smallestAudioSample: number | undefined;
	let largestAudioSample: number | undefined;
	let audioSizesInBytes = 0;
	let videoSizeInBytes = 0;
	let videoSamples = 0;
	let audioSamples = 0;

	const getSlowVideoDurationInSeconds = () => {
		let videoDuration: number | null = null;

		if (smallestVideoSample !== undefined && largestVideoSample !== undefined) {
			const startingTimestampDifference =
				largestVideoSample - smallestVideoSample;
			const timeBetweenSamples =
				startingTimestampDifference / (videoSamples - 1);
			videoDuration = timeBetweenSamples * videoSamples;
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
				startingTimestampDifferenceAudio / (audioSamples - 1);
			audioDuration = timeBetweenSamplesAudio * audioSamples;
		}

		if (videoDuration === null && audioDuration === null) {
			throw new Error('No samples');
		}

		return Math.max(videoDuration ?? 0, audioDuration ?? 0);
	};

	return {
		addVideoSample: (videoSample: AudioOrVideoSample) => {
			videoSamples++;
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

			videoSizeInBytes += videoSample.data.byteLength;
		},
		addAudioSample: (audioSample: AudioOrVideoSample) => {
			audioSamples++;
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

			audioSizesInBytes += audioSample.data.byteLength;
		},
		getSlowDurationInSeconds,
		getFps: () => {
			const videoDuration = getSlowVideoDurationInSeconds() ?? 0;
			if (videoDuration === 0) {
				return 0;
			}

			return videoSamples / videoDuration;
		},
		getSlowNumberOfFrames: () => videoSamples,
		getAudioBitrate: () => {
			const audioDuration = getSlowDurationInSeconds();
			if (audioDuration === 0 || audioSizesInBytes === 0) {
				return null;
			}

			return (audioSizesInBytes * 8) / audioDuration;
		},
		getVideoBitrate: () => {
			const videoDuration = getSlowDurationInSeconds();
			if (videoDuration === 0 || videoSizeInBytes === 0) {
				return null;
			}

			return (videoSizeInBytes * 8) / videoDuration;
		},
	};
};

export type SlowDurationAndFpsState = ReturnType<
	typeof slowDurationAndFpsState
>;
