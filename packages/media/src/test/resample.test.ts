import {expect, test} from 'vitest';
import {combineAudioDataAndClosePrevious} from '../convert-audiodata/combine-audiodata';
import {
	convertAudioData,
	convertAudioDataToS16,
	resamplePcmS16AudioData,
} from '../convert-audiodata/convert-audiodata';
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
		audioDataTimestamp: sine.timestamp / 1_000_000,
		isLast: true,
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
		audioDataTimestamp: sine.timestamp / 1_000_000,
		isLast: true,
	});

	const sineSpedupArray = toInt16Array(sineSpedup);

	for (let i = 0; i < 100; i++) {
		expect(Math.abs(spedUp.data[i] - sineSpedupArray[i])).toBeLessThan(20);
	}
});

test('packet boundaries do not affect resampling', () => {
	const sampleRate = 44100;
	const numberOfFrames = 511;
	const splitAtFrame = 257;
	const source = generateSine({
		length: numberOfFrames,
		amplitude: 4095,
		frequency: 1000,
		sampleRate,
		phase: 0,
	});
	const sourceData = toInt16Array(source);
	const first = new AudioData({
		data: sourceData.slice(0, splitAtFrame * 2),
		format: 's16',
		numberOfChannels: 2,
		numberOfFrames: splitAtFrame,
		sampleRate,
		timestamp: 0,
	});
	const second = new AudioData({
		data: sourceData.slice(splitAtFrame * 2),
		format: 's16',
		numberOfChannels: 2,
		numberOfFrames: numberOfFrames - splitAtFrame,
		sampleRate,
		timestamp: (splitAtFrame / sampleRate) * 1_000_000,
	});
	const playbackRate = 1.75;
	const expected = convertAudioData({
		audioData: source,
		trimStartInSeconds: 0,
		trimEndInSeconds: 0,
		playbackRate,
		audioDataTimestamp: 0,
		isLast: true,
	});
	const combined = combineAudioDataAndClosePrevious([
		convertAudioDataToS16({
			audioData: first,
			trimStartInSeconds: 0,
			trimEndInSeconds: 0,
			audioDataTimestamp: 0,
			isLast: false,
		}),
		convertAudioDataToS16({
			audioData: second,
			trimStartInSeconds: 0,
			trimEndInSeconds: 0,
			audioDataTimestamp: second.timestamp / 1_000_000,
			isLast: true,
		}),
	]);
	const actual = resamplePcmS16AudioData({
		audioData: combined,
		playbackRate,
		isLast: true,
	});

	expect(actual.numberOfFrames).toBe(expected.numberOfFrames);
	expect(actual.data).toEqual(expected.data);

	first.close();
	second.close();
	source.close();
});
