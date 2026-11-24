// Adapted from node-fft project by Joshua Wong and Ben Bryan
// https://github.com/vail-systems/node-fft

import {fftAccurate} from './fft-accurate';
import {fftFast} from './fft-fast';
import {fftMag} from './mag';
import {smoothen} from './smoothing';
import {toInt16} from './to-int-16';

export type OptimizeFor = 'accuracy' | 'speed';

export const getVisualization = ({
	sampleSize,
	data,
	sampleRate,
	frame,
	fps,
	maxInt,
	optimizeFor,
	dataOffsetInSeconds,
}: {
	sampleSize: number;
	data: Float32Array;
	frame: number;
	sampleRate: number;
	fps: number;
	maxInt: number;
	optimizeFor: OptimizeFor;
	dataOffsetInSeconds: number;
}): number[] => {
	const isPowerOfTwo = sampleSize > 0 && (sampleSize & (sampleSize - 1)) === 0;
	if (!isPowerOfTwo) {
		throw new TypeError(
			`The argument "bars" must be a power of two. For example: 64, 128. Got instead: ${sampleSize}`,
		);
	}

	if (!fps) {
		throw new TypeError('The argument "fps" was not provided');
	}

	if (data.length < sampleSize) {
		throw new TypeError(
			'Audio data is not big enough to provide ' + sampleSize + ' bars.',
		);
	}

	const centerSample = Math.floor(
		(frame / fps - dataOffsetInSeconds) * sampleRate,
	);
	const windowStart = centerSample - sampleSize / 2;
	const windowEnd = centerSample + sampleSize / 2;

	if (windowEnd <= 0) {
		return new Array(sampleSize / 2).fill(0);
	}

	const dataStart = Math.max(0, windowStart);

	const ints = new Int16Array({
		length: sampleSize,
	});
	ints.set(
		data.subarray(dataStart, windowEnd).map((x) => toInt16(x)),
		dataStart - windowStart,
	);
	const alg = optimizeFor === 'accuracy' ? fftAccurate : fftFast;

	const phasors = alg(ints);
	const magnitudes = fftMag(phasors).map((p) => p);

	return smoothen(magnitudes).map((m) => m / (sampleSize / 2) / maxInt);
};
