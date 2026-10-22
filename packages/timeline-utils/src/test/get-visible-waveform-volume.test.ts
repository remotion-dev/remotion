import {expect, test} from 'bun:test';
import {getVisibleWaveformVolume} from '../audio-waveform/get-visible-waveform-volume';

test('passes a constant volume through', () => {
	expect(
		getVisibleWaveformVolume({
			displayDurationInFrames: 108_000,
			displayOffsetInFrames: 0,
			volume: 1,
		}),
	).toBe(1);
});

test('slices composition-sampled curves without restarting them at media loop boundaries', () => {
	for (const volume of [
		[0, 0.2, 0.4, 0.6, 0.8, 1],
		[0, 0.2, 0.4, 0.1, 0.3, 0.5],
	]) {
		expect(
			getVisibleWaveformVolume({
				displayDurationInFrames: 3,
				displayOffsetInFrames: 2,
				volume,
			}),
		).toEqual(volume.slice(2, 5));
	}
});

test('clips fractional and empty display windows to the registered curve', () => {
	const volume = [0.1, 0.2, 0.3, 0.4, 0.5];
	expect(
		getVisibleWaveformVolume({
			displayDurationInFrames: 4.5,
			displayOffsetInFrames: 2.25,
			volume,
		}),
	).toEqual([0.3, 0.4, 0.5]);
	expect(
		getVisibleWaveformVolume({
			displayDurationInFrames: 0,
			displayOffsetInFrames: 2,
			volume,
		}),
	).toEqual([]);
});
