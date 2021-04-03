export const fftFreq = function (
	fftBins: [number, number][],
	sampleRate: number
) {
	const stepFreq = sampleRate / fftBins.length;
	const ret = fftBins.slice(0, fftBins.length / 2);

	return ret.map((__, ix) => {
		return ix * stepFreq;
	});
};
