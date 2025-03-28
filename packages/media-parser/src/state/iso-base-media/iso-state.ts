import {cachedSamplePositionsState} from './cached-sample-positions';
import {moovState} from './moov-box';

export const isoBaseMediaState = () => {
	return {
		flatSamples: cachedSamplePositionsState(),
		moov: moovState(),
	};
};

export type IsoBaseMediaState = ReturnType<typeof isoBaseMediaState>;
