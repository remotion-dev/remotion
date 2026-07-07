import {VideoSample, type VideoSampleSink} from 'mediabunny';
import {expect, test} from 'vitest';
import {makeKeyframeBank} from '../video-extraction/keyframe-bank';

const makeSample = ({
	timestamp,
	duration,
}: {
	timestamp: number;
	duration: number;
}) => {
	return new VideoSample(new Uint8Array(4), {
		format: 'RGBA',
		codedWidth: 1,
		codedHeight: 1,
		timestamp,
		duration,
	});
};

const makeVideoSampleSink = (samples: VideoSample[]): VideoSampleSink => {
	return {
		getSample() {
			return Promise.reject(new Error('Not implemented'));
		},
		async *samples() {
			for (const sample of samples) {
				yield sample;
			}
		},
		async *samplesAtTimestamps() {
			yield* [];
		},
	};
};

test('does not select a near future frame', async () => {
	const samples = [
		makeSample({timestamp: 0, duration: 0.01}),
		makeSample({timestamp: 0.033, duration: 0.033}),
	];

	const bank = await makeKeyframeBank({
		logLevel: 'error',
		src: 'near-future-frame.mp4',
		videoSampleSink: makeVideoSampleSink(samples),
		initialTimestampRequest: 0.0325,
	});

	const frame = await bank.getFrameFromTimestamp(0.0325, 30);
	expect(frame?.timestamp).toBe(0);

	bank.prepareForDeletion('error', 'test');
	samples[1].close();
});

test('selects the latest timestamp for out-of-order samples', async () => {
	const samples = [
		makeSample({timestamp: 0.08, duration: 0.033}),
		makeSample({timestamp: 0.04, duration: 0.033}),
	];

	const bank = await makeKeyframeBank({
		logLevel: 'error',
		src: 'out-of-order-frames.mp4',
		videoSampleSink: makeVideoSampleSink(samples),
		initialTimestampRequest: 0.09,
	});

	const frame = await bank.getFrameFromTimestamp(0.09, 30);
	expect(frame?.timestamp).toBe(0.08);

	bank.prepareForDeletion('error', 'test');
	samples[1].close();
});

test('can reuse the initial clamp frame', async () => {
	const samples = [
		makeSample({timestamp: 0.02004, duration: 0.033}),
		makeSample({timestamp: 0.053, duration: 0.033}),
	];

	const bank = await makeKeyframeBank({
		logLevel: 'error',
		src: 'initial-clamp.mp4',
		videoSampleSink: makeVideoSampleSink(samples),
		initialTimestampRequest: 0.019,
	});

	expect(bank.canSatisfyTimestamp(0.019)).toBe(true);

	bank.prepareForDeletion('error', 'test');
	samples[1].close();
});

test('a long frame duration can satisfy requests beyond the jump threshold', async () => {
	const samples = [
		makeSample({timestamp: 0.3, duration: 12}),
		makeSample({timestamp: 12.5, duration: 0.03}),
	];

	const bank = await makeKeyframeBank({
		logLevel: 'error',
		src: 'long-duration-frame.mp4',
		videoSampleSink: makeVideoSampleSink(samples),
		initialTimestampRequest: 0,
	});

	expect(bank.canSatisfyTimestamp(12)).toBe(true);
	expect(bank.canSatisfyTimestamp(15.31)).toBe(false);

	bank.prepareForDeletion('error', 'test');
	samples[1].close();
});
