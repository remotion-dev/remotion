import {expect, test} from 'bun:test';
import {getAudioSampleStartFrameAtTimelineZero} from '../audio-waveform/trim-audio-sample-before-zero';

test('Should skip audio samples that end before timeline zero', () => {
	expect(
		getAudioSampleStartFrameAtTimelineZero({
			timestamp: -0.05,
			duration: 0.02,
			numberOfFrames: 1024,
			sampleRate: 44100,
		}),
	).toBe(null);
});

test('Should trim frames before timeline zero in a straddling sample', () => {
	expect(
		getAudioSampleStartFrameAtTimelineZero({
			timestamp: -0.0014512471655328798,
			duration: 0.023219954648526078,
			numberOfFrames: 1024,
			sampleRate: 44100,
		}),
	).toBe(64);
});

test('Should keep samples that start at or after timeline zero', () => {
	expect(
		getAudioSampleStartFrameAtTimelineZero({
			timestamp: 0,
			duration: 0.02,
			numberOfFrames: 1024,
			sampleRate: 44100,
		}),
	).toBe(0);
});
