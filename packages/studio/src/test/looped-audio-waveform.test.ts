import {expect, test} from 'bun:test';
import {
	getAudioWaveformLoopWidth,
	shouldRepeatAudioWaveform,
} from '../components/looped-audio-waveform';

test('Should only repeat waveforms if more than one loop is visible', () => {
	expect(shouldRepeatAudioWaveform(undefined)).toBe(false);
	expect(
		shouldRepeatAudioWaveform({
			durationInFrames: 100,
			numberOfTimes: 0.5,
			startOffset: 0,
		}),
	).toBe(false);
	expect(
		shouldRepeatAudioWaveform({
			durationInFrames: 100,
			numberOfTimes: 1,
			startOffset: 0,
		}),
	).toBe(false);
	expect(
		shouldRepeatAudioWaveform({
			durationInFrames: 100,
			numberOfTimes: 2,
			startOffset: 0,
		}),
	).toBe(true);
});

test('Should calculate loop width from visible repeats', () => {
	expect(
		getAudioWaveformLoopWidth({
			visualizationWidth: 300,
			loopDisplay: {
				durationInFrames: 100,
				numberOfTimes: 3,
				startOffset: 0,
			},
		}),
	).toBe(100);
	expect(
		getAudioWaveformLoopWidth({
			visualizationWidth: 300,
			loopDisplay: {
				durationInFrames: 100,
				numberOfTimes: 0.5,
				startOffset: 0,
			},
		}),
	).toBe(300);
});
