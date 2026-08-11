import type {
	MediaParserAudioSample,
	MediaParserVideoSample,
} from '../../webcodec-sample-types';

export const lastEmittedSampleState = () => {
	let lastEmittedSample:
		| MediaParserAudioSample
		| MediaParserVideoSample
		| null = null;

	return {
		setLastEmittedSample: (
			sample: MediaParserAudioSample | MediaParserVideoSample,
		) => {
			lastEmittedSample = sample;
		},
		getLastEmittedSample: () => lastEmittedSample,
		resetLastEmittedSample: () => {
			lastEmittedSample = null;
		},
	};
};
