import {fft} from './fft';
import {fftMag} from './mag';
import {smoothen} from './smoothing';

const toInt16 = (x: number) => (x > 0 ? x * 0x7fff : x * 0x8000);

const getMax = (array: Float32Array) => {
	let max = 0;
	for (let i = 0; i < array.length; i++) {
		const val = array[i];
		if (val > max) {
			max = val;
		}
	}
	return max;
};

export const getVisualization = ({
	bars,
	data,
	sampleRate,
	frame,
	fps,
}: {
	bars: number;
	data: Float32Array;
	frame: number;
	sampleRate: number;
	fps: number;
}): number[] => {
	const isPowerOfTwo = bars > 0 && (bars & (bars - 1)) === 0;
	if (!isPowerOfTwo) {
		throw new TypeError(
			`The argument "bars" must be a power of two. For example: 256, 512. Got instead: ${bars}`
		);
	}
	const start = Math.floor((frame / fps) * sampleRate);

	const actualStart = Math.max(0, start - bars / 2);
	const ints = Int16Array.from(
		data.subarray(actualStart, actualStart + bars).map((x) => toInt16(x))
	);
	const maxInt = toInt16(getMax(data));
	const phasors = fft(ints);
	const magnitudes = fftMag(phasors).map((p) => p);

	return smoothen(magnitudes).map((m) => m / (bars / 2) / maxInt);
};
