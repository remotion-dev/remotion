import {cachedSamplePositionsState} from './cached-sample-positions';

export const isoBaseMediaState = () => {
	let shouldReturnToVideoSectionAfterEnd = false;

	return {
		getShouldReturnToVideoSectionAfterEnd: () =>
			shouldReturnToVideoSectionAfterEnd,
		setShouldReturnToVideoSectionAfterEnd: (value: boolean) => {
			shouldReturnToVideoSectionAfterEnd = value;
		},
		flatSamples: cachedSamplePositionsState(),
	};
};
