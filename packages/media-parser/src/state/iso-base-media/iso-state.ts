import {cachedSamplePositionsState} from './cached-sample-positions';
import {moovState} from './moov-box';

export const isoBaseMediaState = () => {
	return {
		flatSamples: cachedSamplePositionsState(),
		moov: moovState(),
	};
};
