import {expect, test} from 'vitest';
import {copyAudioDataToInterleavedS16} from '../convert-audiodata/convert-audiodata';
import {resampleAudioData} from '../convert-audiodata/resample-audiodata';
import {generateSine, toInt16Array} from './sine';

test('resamples with playback rate', () => {
	const sampleRate = 48000;
	const sine = generateSine({
		length: 100,
		amplitude: 4095,
		frequency: 1000,
		sampleRate,
		phase: 0,
	});
	const expectedAudio = generateSine({
		length: 50,
		amplitude: 4095,
		frequency: 2000,
		sampleRate,
		phase: 0,
	});
	const source = copyAudioDataToInterleavedS16({
		audioData: sine,
		frameOffset: 0,
		frameCount: sine.numberOfFrames,
	});
	const destination = new Int16Array(50 * 2);

	resampleAudioData({
		srcNumberOfChannels: 2,
		sourceChannels: source,
		destination,
		targetFrames: 50,
		sourceStart: 0,
		sourceStep: 2,
	});

	const expected = toInt16Array(expectedAudio);
	sine.close();
	expectedAudio.close();
	for (let index = 0; index < destination.length; index++) {
		expect(Math.abs(destination[index] - expected[index])).toBeLessThan(20);
	}
});

test('uses linear interpolation between source samples', () => {
	const destination = new Int16Array(4);
	resampleAudioData({
		srcNumberOfChannels: 2,
		sourceChannels: new Int16Array([0, 0, 1000, 1000, 2000, 2000]),
		destination,
		targetFrames: 2,
		sourceStart: 0.5,
		sourceStep: 1,
	});

	expect(destination).toEqual(new Int16Array([500, 500, 1500, 1500]));
});
