// Adapted from node-fft project by Joshua Wong and Ben Bryan
// https://github.com/vail-systems/node-fft

import {complexMagnitude} from './complex';

export const fftMag = function (fftBins: [number, number][]) {
	const ret = fftBins.map((f) => complexMagnitude(f));
	return ret.slice(0, ret.length / 2);
};
