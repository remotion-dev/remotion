import type {AudioOrVideoSample} from '../../webcodec-sample-types';

export const lastEmittedSampleState = () => {
	let lastEmittedSample: AudioOrVideoSample | null = null;

	return {
		setLastEmittedSample: (sample: AudioOrVideoSample) => {
			lastEmittedSample = sample;
		},
		getLastEmittedSample: () => lastEmittedSample,
		resetLastEmittedSample: () => {
			lastEmittedSample = null;
		},
	};
};
