import type {AudioOrVideoSample} from '../webcodec-sample-types';

export const slowDurationAndFpsState = () => {
	let smallestSample: number | undefined;
	let largestSample: number | undefined;
	let samples = 0;

	const getSlowDurationInSeconds = () => {
		if (smallestSample !== undefined && largestSample !== undefined) {
			const startingTimestampDifference = largestSample - smallestSample;
			const timeBetweenSamples = startingTimestampDifference / (samples - 1);
			return timeBetweenSamples * samples;
		}

		throw new Error('No samples');
	};

	return {
		addSample: (videoSample: AudioOrVideoSample) => {
			samples++;
			const presentationTimeInSeconds = videoSample.cts / videoSample.timescale;
			if (
				largestSample === undefined ||
				presentationTimeInSeconds > largestSample
			) {
				largestSample = presentationTimeInSeconds;
			}

			if (
				smallestSample === undefined ||
				presentationTimeInSeconds < smallestSample
			) {
				smallestSample = presentationTimeInSeconds;
			}
		},
		getSlowDurationInSeconds,
		getFps: () => {
			return samples / getSlowDurationInSeconds();
		},
		getSlowNumberOfFrames: () => samples,
	};
};

export type SlowDurationAndFpsState = ReturnType<
	typeof slowDurationAndFpsState
>;
