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

test('Should stretch waveform peaks when playbackRate is below 1', () => {
	const peaks = Float32Array.from({length: 1000}, (_, i) => i);

	const sliced = sliceWaveformPeaks({
		peaks,
		startFrom: 0,
		durationInFrames: 300,
		fps: 30,
		playbackRate: 0.5,
	});

	// 5s of media at 100 peaks/s
	expect(sliced.length).toBe(500);
	expect(sliced[0]).toBe(0);
	expect(sliced[499]).toBe(499);
});

test('Should compress waveform peaks when playbackRate is above 1', () => {
	const peaks = Float32Array.from({length: 2000}, (_, i) => i);

	const sliced = sliceWaveformPeaks({
		peaks,
		startFrom: 0,
		durationInFrames: 300,
		fps: 30,
		playbackRate: 2,
	});

	// 20s of media at 100 peaks/s, media is long enough
	expect(sliced.length).toBe(2000);
	expect(sliced[0]).toBe(0);
	expect(sliced[1999]).toBe(1999);
});

test('Should pad silence past EOF so playbackRate above 1 still compresses', () => {
	// Timeline is 10s of composition; media is only 10s. At rate 2 we need 20s
	// of source peaks; without padding the slice would clamp to rate-1 length.
	const peaks = Float32Array.from({length: 1000}, (_, i) => i + 1);

	const sliced = sliceWaveformPeaks({
		peaks,
		startFrom: 0,
		durationInFrames: 300,
		fps: 30,
		playbackRate: 2,
	});

	expect(sliced.length).toBe(2000);
	expect(sliced[0]).toBe(1);
	expect(sliced[999]).toBe(1000);
	expect(sliced[1000]).toBe(0);
	expect(sliced[1999]).toBe(0);
});

test('Should pad silence when a mid-media window runs past EOF', () => {
	const peaks = Float32Array.from({length: 1000}, (_, i) => i + 1);

	const sliced = sliceWaveformPeaks({
		peaks,
		startFrom: 150,
		durationInFrames: 300,
		fps: 30,
		playbackRate: 2,
	});

	// start at 5s -> peak 500; need 20s -> 2000 peaks; only 500 remain
	expect(sliced.length).toBe(2000);
	expect(sliced[0]).toBe(501);
	expect(sliced[499]).toBe(1000);
	expect(sliced[500]).toBe(0);
	expect(sliced[1999]).toBe(0);
});
