import type {AudioOrVideoSample} from '../webcodec-sample-types';

export const slowDurationAndFpsState = () => {
	let smallestSample: number | undefined;
	let largestSample: number | undefined;
	let samples = 0;

	const getSlowDurationInSeconds = () => {
		if (smallestSample && largestSample) {
			return largestSample - smallestSample;
		}

		throw new Error('No samples');
	};

	return {
		addSample: (videoSample: AudioOrVideoSample) => {
			samples++;
			const presentationTimeInSeconds = videoSample.cts / videoSample.timescale;
			if (!largestSample || presentationTimeInSeconds > largestSample) {
				largestSample = presentationTimeInSeconds;
			}

			if (!smallestSample || presentationTimeInSeconds < smallestSample) {
				smallestSample = presentationTimeInSeconds;
			}
		},
		getSlowDurationInSeconds,
		getFps: () => {
			return samples / getSlowDurationInSeconds();
		},
	};
};

export type SlowDurationAndFpsState = ReturnType<
	typeof slowDurationAndFpsState
>;
