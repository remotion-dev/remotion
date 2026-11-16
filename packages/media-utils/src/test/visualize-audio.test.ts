import {expect, test} from 'bun:test';
import type {MediaUtilsAudioData} from '../types';
import {visualizeAudio} from '../visualize-audio';

const sampleRate = 8000;
const samples = new Float32Array(sampleRate * 2);
for (let i = 0; i < samples.length; i++) {
	samples[i] = Math.sin((2 * Math.PI * 440 * i) / sampleRate);
}

const audioData: MediaUtilsAudioData = {
	channelWaveforms: [samples],
	sampleRate,
	durationInSeconds: 2,
	numberOfChannels: 1,
	resultId: 'visualize-audio-offset-test',
	isRemote: false,
};

test('returns silence before the audio starts for both FFT modes', () => {
	for (const optimizeFor of ['accuracy', 'speed'] as const) {
		expect(
			visualizeAudio({
				audioData,
				frame: -30,
				fps: 30,
				numberOfSamples: 16,
				optimizeFor,
			}),
		).toEqual(new Array(16).fill(0));

		expect(
			visualizeAudio({
				audioData,
				frame: 0,
				fps: 30,
				numberOfSamples: 16,
				dataOffsetInSeconds: 1,
				optimizeFor,
			}),
		).toEqual(new Array(16).fill(0));
	}
});

test('returns non-zero spectrum inside the audio and silence after it ends', () => {
	for (const optimizeFor of ['accuracy', 'speed'] as const) {
		const during = visualizeAudio({
			audioData,
			frame: 15,
			fps: 30,
			numberOfSamples: 16,
			optimizeFor,
		});
		expect(during.some((value) => value > 0)).toBe(true);

		expect(
			visualizeAudio({
				audioData,
				frame: 90,
				fps: 30,
				numberOfSamples: 16,
				optimizeFor,
			}),
		).toEqual(new Array(16).fill(0));
	}
});
