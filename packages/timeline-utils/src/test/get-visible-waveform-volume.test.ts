import {expect, test} from 'bun:test';
import {getVisibleWaveformVolume} from '../audio-waveform/get-visible-waveform-volume';

test('passes a constant volume through', () => {
	expect(
		getVisibleWaveformVolume({
			displayDurationInFrames: 108_000,
			displayOffsetInFrames: 0,
			loopDisplay: {
				durationInFrames: 1_800,
				numberOfTimes: 60,
				startOffset: 0,
			},
			volume: 1,
		}),
	).toBe(1);
});

test('slices a non-looped volume curve', () => {
	expect(
		getVisibleWaveformVolume({
			displayDurationInFrames: 3,
			displayOffsetInFrames: 2,
			loopDisplay: undefined,
			volume: [0.1, 0.2, 0.3, 0.4, 0.5],
		}),
	).toEqual([0.3, 0.4, 0.5]);
});

test('tiles a looped volume curve across a loop boundary', () => {
	expect(
		getVisibleWaveformVolume({
			displayDurationInFrames: 4,
			displayOffsetInFrames: 3,
			loopDisplay: {
				durationInFrames: 5,
				numberOfTimes: 3,
				startOffset: 0,
			},
			volume: [1, 2, 3, 4, 5],
		}),
	).toEqual([4, 5, 1, 2]);
});

test('tiles a long looped volume curve', () => {
	const loopDurationInFrames = 80_000;
	const volume = Array.from({length: loopDurationInFrames}, (_, index) =>
		index % 2 === 0 ? 1 : 0.5,
	);

	const visible = getVisibleWaveformVolume({
		displayDurationInFrames: loopDurationInFrames,
		displayOffsetInFrames: 0,
		loopDisplay: {
			durationInFrames: loopDurationInFrames,
			numberOfTimes: 2,
			startOffset: 0,
		},
		volume,
	});

	expect(Array.isArray(visible)).toBe(true);
	expect((visible as number[]).length).toBe(loopDurationInFrames);
	expect((visible as number[])[0]).toBe(1);
	expect((visible as number[])[1]).toBe(0.5);
	expect((visible as number[])[loopDurationInFrames - 1]).toBe(0.5);
});

test('terminates with fractional display windows from timeline virtualization', () => {
	const volume = Array.from({length: 100}, (_, index) => index / 100);
	const visible = getVisibleWaveformVolume({
		displayDurationInFrames: 33426.30571428571,
		displayOffsetInFrames: 11256.685714285799,
		loopDisplay: {
			durationInFrames: 100,
			numberOfTimes: 600,
			startOffset: 0,
		},
		volume,
	});

	expect(Array.isArray(visible)).toBe(true);
	const values = visible as number[];
	expect(values.length).toBeGreaterThan(33426);
	// Bounded by display duration plus per-segment rounding
	expect(values.length).toBeLessThan(34000);
});

test('stops tiling if a loop segment would not advance', () => {
	expect(
		getVisibleWaveformVolume({
			displayDurationInFrames: 100,
			displayOffsetInFrames: 0,
			loopDisplay: {
				durationInFrames: 0,
				numberOfTimes: 10,
				startOffset: 0,
			},
			volume: [1, 2, 3],
		}),
	).toEqual([1, 2, 3]);
});
