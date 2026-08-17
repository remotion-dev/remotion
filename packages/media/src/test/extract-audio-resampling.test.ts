import {assert, expect, test} from 'vitest';
import {extractAudio} from '../audio-extraction/extract-audio';
import {getMaxVideoCacheSize, globalMediaCache} from '../caches';
import {resampleAudioData} from '../convert-audiodata/resample-audiodata';

const FPS = 30;
const SOURCE_SAMPLE_RATE = 44100;
const TARGET_SAMPLE_RATE = 48000;
const NUMBER_OF_CHANNELS = 2;
const TRIM_BEFORE = 4;

test('resamples decoded chunks as one continuous frame', async () => {
	const src = new URL('../../../remotion-media/ding.wav', import.meta.url).href;
	const wav = await fetch(src).then((response) => response.arrayBuffer());
	const view = new DataView(wav);
	let dataOffset = 12;
	while (view.getUint32(dataOffset, false) !== 0x64617461) {
		dataOffset += 8 + view.getUint32(dataOffset + 4, true);
	}

	const source = new Int16Array(wav, dataOffset + 8);
	const extracted = await extractAudio({
		audioStreamIndex: 0,
		timeInSeconds: 0,
		durationInSeconds: 1 / FPS,
		playbackRate: 1,
		fps: FPS,
		logLevel: 'info',
		loop: false,
		src,
		trimBefore: TRIM_BEFORE,
		trimAfter: undefined,
		maxCacheSize: getMaxVideoCacheSize('info'),
		credentials: undefined,
		mediaCache: globalMediaCache,
	});

	assert(extracted && typeof extracted === 'object');
	assert(extracted.data);

	const targetFrames = TARGET_SAMPLE_RATE / FPS;
	const expected = new Int16Array(targetFrames * NUMBER_OF_CHANNELS);
	resampleAudioData({
		srcNumberOfChannels: NUMBER_OF_CHANNELS,
		sourceChannels: source.subarray(
			((TRIM_BEFORE * SOURCE_SAMPLE_RATE) / FPS) * NUMBER_OF_CHANNELS,
		),
		destination: expected,
		targetFrames,
		sourceStart: 0,
		chunkSize: SOURCE_SAMPLE_RATE / TARGET_SAMPLE_RATE,
	});

	expect(extracted.data.data.length).toBe(expected.length);
	let maximumError = 0;
	for (let i = 0; i < expected.length; i++) {
		maximumError = Math.max(
			maximumError,
			Math.abs(extracted.data.data[i] - expected[i]),
		);
	}

	expect(maximumError).toBeLessThanOrEqual(2);
});
