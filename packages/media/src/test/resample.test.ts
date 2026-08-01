import {expect, test} from 'vitest';
import {createAudioResampler} from '../convert-audiodata/audio-resampler';
import {convertAudioData} from '../convert-audiodata/convert-audiodata';
import {generateSine} from './sine';

test('Should be able to convert audio that is on the verge', () => {
	const sine = generateSine({
		length: 2048,
		amplitude: 4095,
		frequency: 1000,
		sampleRate: 44100,
		phase: 0,
	});

	const rawChunk = convertAudioData({
		audioData: sine,
		trimStartInSeconds: 0.041666666666666664,
		trimEndInSeconds: 0,
		audioDataTimestamp: sine.timestamp / 1_000_000,
		isLast: true,
	});

	const resampler = createAudioResampler();
	const spedUp = resampler.resample({
		sourceChannels: rawChunk.data,
		srcNumberOfChannels: rawChunk.numberOfChannels,
		sourceSampleRate: rawChunk.sampleRate,
		frameCount: rawChunk.numberOfFrames,
		playbackRate: 2,
		timestamp: rawChunk.timestamp,
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

	const rawChunk = convertAudioData({
		audioData: sine,
		trimStartInSeconds: 0,
		trimEndInSeconds: 0,
		audioDataTimestamp: sine.timestamp / 1_000_000,
		isLast: true,
	});

	const resampler = createAudioResampler();
	const spedUp = resampler.resample({
		sourceChannels: rawChunk.data,
		srcNumberOfChannels: rawChunk.numberOfChannels,
		sourceSampleRate: rawChunk.sampleRate,
		frameCount: rawChunk.numberOfFrames,
		playbackRate: 2,
		timestamp: rawChunk.timestamp,
		isLast: true,
	});

	// At 2x playback rate, output should be half the frames
	expect(spedUp.numberOfFrames).toBe(50);

	// Verify the output is a valid sped-up sine:
	// The resampled data should oscillate at the effective frequency (2x higher
	// from the listener's perspective). We check that the waveform doesn't clip
	// or produce extreme artifacts.
	for (let i = 0; i < spedUp.numberOfFrames * 2; i++) {
		expect(Math.abs(spedUp.data[i])).toBeLessThanOrEqual(4095);
	}

	// Verify the waveform has the right shape by checking it crosses zero
	let zeroCrossings = 0;
	for (let i = 1; i < spedUp.numberOfFrames; i++) {
		// Check left channel (every other sample in interleaved s16)
		const prev = spedUp.data[(i - 1) * 2];
		const curr = spedUp.data[i * 2];
		if ((prev >= 0 && curr < 0) || (prev < 0 && curr >= 0)) {
			zeroCrossings++;
		}
	}

	// A 1000 Hz sine at 48000 Hz for 50 frames = ~1.04 ms
	// At effective 2000 Hz, ~2 full cycles = ~4 zero crossings
	expect(zeroCrossings).toBeGreaterThanOrEqual(2);
	expect(zeroCrossings).toBeLessThanOrEqual(6);
});

test('stateful resampler produces same output as single chunk', () => {
	const sampleRate = 44100;
	const totalLength = 1000;

	// Generate a full sine wave
	const fullSine = generateSine({
		length: totalLength,
		amplitude: 4095,
		frequency: 440,
		sampleRate,
		phase: 0,
	});

	// Resample as one chunk
	const fullRaw = convertAudioData({
		audioData: fullSine,
		trimStartInSeconds: 0,
		trimEndInSeconds: 0,
		audioDataTimestamp: 0,
		isLast: true,
	});

	const singleResampler = createAudioResampler();
	const singleResult = singleResampler.resample({
		sourceChannels: fullRaw.data,
		srcNumberOfChannels: fullRaw.numberOfChannels,
		sourceSampleRate: fullRaw.sampleRate,
		frameCount: fullRaw.numberOfFrames,
		playbackRate: 1,
		timestamp: 0,
		isLast: true,
	});

	// Resample as two chunks with stateful resampler
	const halfLength = Math.floor(totalLength / 2);

	const sine1 = generateSine({
		length: halfLength,
		amplitude: 4095,
		frequency: 440,
		sampleRate,
		phase: 0,
	});

	const twoPiFOverFs = (2 * Math.PI * 440) / sampleRate;
	const sine2 = generateSine({
		length: totalLength - halfLength,
		amplitude: 4095,
		frequency: 440,
		sampleRate,
		phase: twoPiFOverFs * halfLength,
	});

	const raw1 = convertAudioData({
		audioData: sine1,
		trimStartInSeconds: 0,
		trimEndInSeconds: 0,
		audioDataTimestamp: 0,
		isLast: false,
	});
	const raw2 = convertAudioData({
		audioData: sine2,
		trimStartInSeconds: 0,
		trimEndInSeconds: 0,
		audioDataTimestamp: halfLength / sampleRate,
		isLast: true,
	});

	const multiResampler = createAudioResampler();
	const result1 = multiResampler.resample({
		sourceChannels: raw1.data,
		srcNumberOfChannels: raw1.numberOfChannels,
		sourceSampleRate: raw1.sampleRate,
		frameCount: raw1.numberOfFrames,
		playbackRate: 1,
		timestamp: raw1.timestamp,
		isLast: false,
	});
	const result2 = multiResampler.resample({
		sourceChannels: raw2.data,
		srcNumberOfChannels: raw2.numberOfChannels,
		sourceSampleRate: raw2.sampleRate,
		frameCount: raw2.numberOfFrames,
		playbackRate: 1,
		timestamp: raw2.timestamp,
		isLast: true,
	});

	// Combined output should have same total frames
	const totalMultiFrames = result1.numberOfFrames + result2.numberOfFrames;
	expect(totalMultiFrames).toBe(singleResult.numberOfFrames);

	// Check that the boundary is smooth — compare samples around the split point
	// The multi-chunk result should closely match the single-chunk result
	const multiData = new Int16Array(totalMultiFrames * 2);
	multiData.set(result1.data, 0);
	multiData.set(result2.data, result1.data.length);

	for (let i = 0; i < singleResult.data.length; i++) {
		const diff = Math.abs(singleResult.data[i] - multiData[i]);
		expect(diff).toBeLessThan(2); // Allow tiny rounding differences
	}
});

test('fractional drift: many small chunks match single large chunk', () => {
	const sampleRate = 44100;
	const chunkLength = 50;
	const numChunks = 20;
	const totalLength = chunkLength * numChunks;

	// Generate full sine and resample as one chunk
	const fullSine = generateSine({
		length: totalLength,
		amplitude: 4095,
		frequency: 440,
		sampleRate,
		phase: 0,
	});

	const fullRaw = convertAudioData({
		audioData: fullSine,
		trimStartInSeconds: 0,
		trimEndInSeconds: 0,
		audioDataTimestamp: 0,
		isLast: true,
	});

	const singleResampler = createAudioResampler();
	const singleResult = singleResampler.resample({
		sourceChannels: fullRaw.data,
		srcNumberOfChannels: fullRaw.numberOfChannels,
		sourceSampleRate: fullRaw.sampleRate,
		frameCount: fullRaw.numberOfFrames,
		playbackRate: 1,
		timestamp: 0,
		isLast: true,
	});

	// Resample as many small chunks
	const multiResampler = createAudioResampler();
	const twoPiFOverFs = (2 * Math.PI * 440) / sampleRate;
	let totalMultiFrames = 0;
	const allMultiData: Int16Array[] = [];

	for (let c = 0; c < numChunks; c++) {
		const offset = c * chunkLength;
		const isLast = c === numChunks - 1;

		const chunk = generateSine({
			length: chunkLength,
			amplitude: 4095,
			frequency: 440,
			sampleRate,
			phase: twoPiFOverFs * offset,
		});

		const rawChunk = convertAudioData({
			audioData: chunk,
			trimStartInSeconds: 0,
			trimEndInSeconds: 0,
			audioDataTimestamp: offset / sampleRate,
			isLast,
		});

		const resampled = multiResampler.resample({
			sourceChannels: rawChunk.data,
			srcNumberOfChannels: rawChunk.numberOfChannels,
			sourceSampleRate: rawChunk.sampleRate,
			frameCount: rawChunk.numberOfFrames,
			playbackRate: 1,
			timestamp: rawChunk.timestamp,
			isLast,
		});

		totalMultiFrames += resampled.numberOfFrames;
		allMultiData.push(resampled.data);
	}

	// Total frame count should match single-chunk result
	expect(totalMultiFrames).toBe(singleResult.numberOfFrames);

	// Concatenate all multi-chunk data
	const multiData = new Int16Array(totalMultiFrames * 2);
	let offset = 0;
	for (const chunk of allMultiData) {
		multiData.set(chunk, offset);
		offset += chunk.length;
	}

	// All samples should closely match.
	// At chunk boundaries, the multi-chunk resampler uses the last sample from
	// the previous chunk for interpolation, which may differ slightly from the
	// single-chunk case due to the discrete int16 boundary sample.
	// With 20 boundaries, this can compound to ~18 int16 units at worst,
	// which is 18/32768 = 0.05% (-65 dB) — far below audibility.
	for (let i = 0; i < singleResult.data.length; i++) {
		const diff = Math.abs(singleResult.data[i] - multiData[i]);
		expect(diff).toBeLessThan(20);
	}
});

test('preserves a short non-final chunk until it can produce output', () => {
	const source = new Int16Array([
		1000, 1000, 2000, 2000, 3000, 3000, 4000, 4000, 5000, 5000,
	]);

	const singleChunkResampler = createAudioResampler();
	const expected = singleChunkResampler.resample({
		sourceChannels: source,
		srcNumberOfChannels: 2,
		sourceSampleRate: 48_000,
		frameCount: 5,
		playbackRate: 2,
		timestamp: 0,
		isLast: true,
	});

	const chunkedResampler = createAudioResampler();
	const first = chunkedResampler.resample({
		sourceChannels: source.slice(0, 2),
		srcNumberOfChannels: 2,
		sourceSampleRate: 48_000,
		frameCount: 1,
		playbackRate: 2,
		timestamp: 0,
		isLast: false,
	});
	const second = chunkedResampler.resample({
		sourceChannels: source.slice(2),
		srcNumberOfChannels: 2,
		sourceSampleRate: 48_000,
		frameCount: 4,
		playbackRate: 2,
		timestamp: 1 / 48_000,
		isLast: true,
	});

	expect(first.numberOfFrames).toBe(0);
	expect([...second.data]).toEqual([...expected.data]);
});

test('retains every source frame needed across a chunk boundary', () => {
	const source = new Int16Array(
		Array.from({length: 11 * 2}, (_, index) => Math.floor(index / 2) * 1000),
	);

	const singleChunkResampler = createAudioResampler();
	const expected = singleChunkResampler.resample({
		sourceChannels: source,
		srcNumberOfChannels: 2,
		sourceSampleRate: 48_000,
		frameCount: 11,
		playbackRate: 4,
		timestamp: 0,
		isLast: true,
	});

	const chunkedResampler = createAudioResampler();
	const first = chunkedResampler.resample({
		sourceChannels: source.slice(0, 7 * 2),
		srcNumberOfChannels: 2,
		sourceSampleRate: 48_000,
		frameCount: 7,
		playbackRate: 4,
		timestamp: 0,
		isLast: false,
	});
	const second = chunkedResampler.resample({
		sourceChannels: source.slice(7 * 2),
		srcNumberOfChannels: 2,
		sourceSampleRate: 48_000,
		frameCount: 4,
		playbackRate: 4,
		timestamp: 7 / 48_000,
		isLast: true,
	});

	const combined = new Int16Array(first.data.length + second.data.length);
	combined.set(first.data);
	combined.set(second.data, first.data.length);
	expect([...combined]).toEqual([...expected.data]);
});

test('downmixes standard 5.1 channel order to stereo', () => {
	const resampler = createAudioResampler();
	const result = resampler.resample({
		// L, R, C, LFE, SL, SR
		sourceChannels: new Int16Array([100, 200, 300, 4000, 500, 600]),
		srcNumberOfChannels: 6,
		sourceSampleRate: 48_000,
		frameCount: 1,
		playbackRate: 1,
		timestamp: 0,
		isLast: true,
	});

	expect([...result.data]).toEqual([665, 836]);
});
