import {expect, test} from 'bun:test';
import {getWaveformPortion} from '../get-waveform-portion';
import type {MediaUtilsAudioData} from '../types';

// 10 seconds of constant 0.5 amplitude at 1000 Hz
const audioData: MediaUtilsAudioData = {
	channelWaveforms: [new Float32Array(10000).fill(0.5)],
	sampleRate: 1000,
	durationInSeconds: 10,
	numberOfChannels: 1,
	resultId: 'test',
	isRemote: false,
};

const amplitudes = (startTimeInSeconds: number) =>
	getWaveformPortion({
		audioData,
		startTimeInSeconds,
		durationInSeconds: 0.5,
		numberOfSamples: 5,
		normalize: false,
	}).map((bar) => bar.amplitude);

test('window inside the audio returns real samples', () => {
	expect(amplitudes(1)).toEqual([0.5, 0.5, 0.5, 0.5, 0.5]);
});

test('window entirely before the audio is silence only', () => {
	expect(amplitudes(-2)).toEqual([0, 0, 0, 0, 0]);
});

test('window partially before the audio pads the start with silence', () => {
	expect(amplitudes(-0.2)).toEqual([0, 0, 0.5, 0.5, 0.5]);
});

test('window past the end of the audio pads the end with silence', () => {
	expect(amplitudes(9.8)).toEqual([0.5, 0.5, 0, 0, 0]);
});

test('window entirely after the audio is silence only', () => {
	expect(amplitudes(12)).toEqual([0, 0, 0, 0, 0]);
});
