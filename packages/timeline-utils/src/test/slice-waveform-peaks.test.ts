import {expect, test} from 'bun:test';
import {sliceWaveformPeaks} from '../audio-waveform/slice-waveform-peaks';

test('Should slice waveform peaks based on timeline window', () => {
	const peaks = Float32Array.from({length: 300}, (_, i) => i);

	const sliced = sliceWaveformPeaks({
		peaks,
		startFrom: 30,
		durationInFrames: 30,
		fps: 30,
		playbackRate: 1,
	});

	expect(Array.from(sliced)).toEqual(
		Array.from({length: 100}, (_, i) => i + 100),
	);
});

test('Should return an empty waveform unchanged', () => {
	const peaks = new Float32Array(0);

	const sliced = sliceWaveformPeaks({
		peaks,
		startFrom: 0,
		durationInFrames: 30,
		fps: 30,
		playbackRate: 1,
	});

	expect(sliced).toBe(peaks);
});

test('Should preserve silence after the waveform when playback is faster', () => {
	const peaks = Float32Array.from({length: 100}, (_, i) => i + 1);

	const sliced = sliceWaveformPeaks({
		peaks,
		startFrom: 0,
		durationInFrames: 30,
		fps: 30,
		playbackRate: 2,
	});

	expect(Array.from(sliced)).toEqual([
		...Array.from({length: 100}, (_, i) => i + 1),
		...Array.from({length: 100}, () => 0),
	]);
});

test('Should preserve silence before the waveform', () => {
	const peaks = Float32Array.from({length: 100}, (_, i) => i + 1);

	const sliced = sliceWaveformPeaks({
		peaks,
		startFrom: -15,
		durationInFrames: 30,
		fps: 30,
		playbackRate: 1,
	});

	expect(Array.from(sliced)).toEqual([
		...Array.from({length: 50}, () => 0),
		...Array.from({length: 50}, (_, i) => i + 1),
	]);
});

test('Should handle an infinite timeline duration', () => {
	const peaks = Float32Array.from({length: 100}, (_, i) => i + 1);

	const sliced = sliceWaveformPeaks({
		peaks,
		startFrom: 15,
		durationInFrames: Infinity,
		fps: 30,
		playbackRate: 1,
	});

	expect(Array.from(sliced)).toEqual(
		Array.from({length: 50}, (_, i) => i + 51),
	);
});
