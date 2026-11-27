import {expect, test} from 'bun:test';
import {getVisualization} from '../fft/get-visualization';

const sampleRate = 8000;
const sampleSize = 32;
const fps = 30;

const makeSineWave = (): Float32Array => {
	const data = new Float32Array(sampleRate * 2);
	for (let i = 0; i < data.length; i++) {
		data[i] = Math.sin((2 * Math.PI * 440 * i) / sampleRate);
	}

	return data;
};

test('getVisualization() should return silence before the audio starts', () => {
	const data = makeSineWave();
	const zeros = new Array(sampleSize / 2).fill(0);

	expect(
		getVisualization({
			sampleSize,
			data,
			sampleRate,
			frame: -30,
			fps,
			maxInt: 32768,
			optimizeFor: 'accuracy',
			dataOffsetInSeconds: 0,
		}),
	).toEqual(zeros);

	expect(
		getVisualization({
			sampleSize,
			data,
			sampleRate,
			frame: 0,
			fps,
			maxInt: 32768,
			optimizeFor: 'accuracy',
			dataOffsetInSeconds: 1,
		}),
	).toEqual(zeros);
});

test('getVisualization() should return non-zero values in the middle of the audio', () => {
	const data = makeSineWave();

	const values = getVisualization({
		sampleSize,
		data,
		sampleRate,
		frame: 30,
		fps,
		maxInt: 32768,
		optimizeFor: 'accuracy',
		dataOffsetInSeconds: 0,
	});

	expect(values.length).toBe(sampleSize / 2);
	expect(values.some((value) => value !== 0)).toBe(true);
});
