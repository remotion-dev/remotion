import {expect, test} from 'bun:test';
import {getAudioSamplePosition} from '../audio/get-audio-sample-position';

test('audio sample positions handle integer and fractional frame rates', () => {
	expect(getAudioSamplePosition({frame: 153, fps: 30, sampleRate: 48000})).toBe(
		244800,
	);
	expect(
		getAudioSamplePosition({frame: 1, fps: 29.97, sampleRate: 48000}),
	).toBe(1601);
});
