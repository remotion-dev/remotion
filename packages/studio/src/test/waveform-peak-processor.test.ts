import {expect, test} from 'bun:test';
import {createWaveformPeakProcessor} from '../components/waveform-peak-processor';

const expectPeaksToBeClose = (actual: number[], expected: number[]) => {
	expect(actual).toHaveLength(expected.length);
	for (const [index, value] of expected.entries()) {
		expect(actual[index]).toBeCloseTo(value);
	}
};

test('Should emit incremental progress for completed peaks', () => {
	const progressCalls: Array<{
		completedPeaks: number;
		final: boolean;
		peaks: number[];
	}> = [];

	const processor = createWaveformPeakProcessor({
		totalPeaks: 3,
		samplesPerPeak: 2,
		progressIntervalInMs: 0,
		now: () => 100,
		onProgress: ({completedPeaks, final, peaks}) => {
			progressCalls.push({
				completedPeaks,
				final,
				peaks: Array.from(peaks),
			});
		},
	});

	processor.processSampleChunk(
		new Float32Array([0.1, 0.7, 0.5, 0.2, 0.3, 0.8, 0.4, 0.1]),
		2,
	);

	expect(progressCalls).toHaveLength(1);
	expect(progressCalls[0]).toMatchObject({
		completedPeaks: 2,
		final: false,
	});
	expectPeaksToBeClose(progressCalls[0].peaks, [0.7, 0.8, 0]);
});

test('Should flush the last partial peak during finalize', () => {
	const progressCalls: Array<{
		completedPeaks: number;
		final: boolean;
		peaks: number[];
	}> = [];

	const processor = createWaveformPeakProcessor({
		totalPeaks: 2,
		samplesPerPeak: 2,
		progressIntervalInMs: 0,
		now: () => 100,
		onProgress: ({completedPeaks, final, peaks}) => {
			progressCalls.push({
				completedPeaks,
				final,
				peaks: Array.from(peaks),
			});
		},
	});

	processor.processSampleChunk(new Float32Array([0.2, 0.6, 0.4]), 1);
	processor.finalize();

	expect(progressCalls).toHaveLength(2);
	expect(progressCalls[0]).toMatchObject({
		completedPeaks: 1,
		final: false,
	});
	expectPeaksToBeClose(progressCalls[0].peaks, [0.6, 0]);
	expect(progressCalls[1]).toMatchObject({
		completedPeaks: 2,
		final: true,
	});
	expectPeaksToBeClose(progressCalls[1].peaks, [0.6, 0.4]);
});

test('Should throttle intermediate progress but always emit the final update', () => {
	let now = 0;
	const progressCalls: Array<{completedPeaks: number; final: boolean}> = [];

	const processor = createWaveformPeakProcessor({
		totalPeaks: 3,
		samplesPerPeak: 1,
		progressIntervalInMs: 50,
		now: () => now,
		onProgress: ({completedPeaks, final}) => {
			progressCalls.push({completedPeaks, final});
		},
	});

	now = 100;
	processor.processSampleChunk(new Float32Array([0.2]), 1);
	now = 120;
	processor.processSampleChunk(new Float32Array([0.4]), 1);
	now = 130;
	processor.finalize();

	expect(progressCalls).toEqual([
		{completedPeaks: 1, final: false},
		{completedPeaks: 2, final: true},
	]);
});
