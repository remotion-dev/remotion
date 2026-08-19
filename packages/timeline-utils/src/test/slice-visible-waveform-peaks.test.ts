import {expect, test} from 'bun:test';
import {sliceVisibleWaveformPeaks} from '../audio-waveform/slice-visible-waveform-peaks';

test('slices only the visible part of a waveform', () => {
	const peaks = Float32Array.from({length: 300}, (_, index) => index);
	const visible = sliceVisibleWaveformPeaks({
		displayDurationInFrames: 10,
		displayOffsetInFrames: 10,
		durationInFrames: 30,
		fps: 10,
		loopDisplay: undefined,
		peaks,
		playbackRate: 1,
		startFrom: 0,
	});

	expect(Array.from(visible)).toEqual(
		Array.from({length: 100}, (_, index) => index + 100),
	);
});

test('joins waveform portions across a loop boundary', () => {
	const peaks = Float32Array.from({length: 100}, (_, index) => index);
	const visible = sliceVisibleWaveformPeaks({
		displayDurationInFrames: 5,
		displayOffsetInFrames: 8,
		durationInFrames: 10,
		fps: 10,
		loopDisplay: {
			durationInFrames: 10,
			numberOfTimes: 3,
			startOffset: 0,
		},
		peaks,
		playbackRate: 1,
		startFrom: 0,
	});

	expect(Array.from(visible)).toEqual([
		...Array.from({length: 20}, (_, index) => index + 80),
		...Array.from({length: 30}, (_, index) => index),
	]);
});
