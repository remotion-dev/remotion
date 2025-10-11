import {expect, test} from 'vitest';
import {convertAudioData} from '../convert-audiodata/convert-audiodata';
import {generateSine, toInt16Array} from './sine';

test('Should be able to convert audio that is on the verge', () => {
	const sine = generateSine({
		length: 2048,
		amplitude: 4095,
		frequency: 1000,
		sampleRate: 44100,
		phase: 0,
	});

	const spedUp = convertAudioData({
		audioData: sine,
		trimStartInSeconds: 0.041666666666666664,
		trimEndInSeconds: 0,
		playbackRate: 2,
	});

	expect(spedUp.numberOfFrames).toBe(115);
});

test('convert with playbackrate', () => {
	const sampleRate = 48000;

	const sine = generateSine({
		length: 100,
		amplitude: 4095,
		frequency: 1000,
		sampleRate,
		phase: 0,
	});

	const twoPiFOverFs = (2 * Math.PI * 1000) / sampleRate;

	const sineSpedup = generateSine({
		length: 100,
		amplitude: 4095,
		frequency: 2000,
		sampleRate,
		phase: twoPiFOverFs / 2,
	});

	const spedUp = convertAudioData({
		audioData: sine,
		trimStartInSeconds: 0,
		trimEndInSeconds: 0,
		playbackRate: 2,
	});

	const sineSpedupArray = toInt16Array(sineSpedup);

	for (let i = 0; i < 100; i++) {
		expect(Math.abs(spedUp.data[i] - sineSpedupArray[i])).toBeLessThan(20);
	}
});
