import type {VideoSample, VideoSampleSink} from 'mediabunny';
import {expect, test} from 'vitest';
import {makeKeyframeBank} from '../video-extraction/keyframe-bank';

type FakeFrame = VideoSample & {
	closed: boolean;
};

const makeFrame = (timestamp: number): FakeFrame => {
	return {
		timestamp,
		duration: 0.001,
		codedWidth: 1,
		codedHeight: 1,
		format: null,
		closed: false,
		allocationSize: () => 4,
		close() {
			this.closed = true;
		},
	} as FakeFrame;
};

const makeVideoSampleSink = (timestamps: number[]): VideoSampleSink => {
	const samples = async function* () {
		for (const timestamp of timestamps) {
			yield makeFrame(timestamp);
		}
	};

	return {
		samples,
	} as unknown as VideoSampleSink;
};

const makeReorderedTimestamps = (frames: number) => {
	const timestamps = [0];
	for (let base = 0; timestamps.length < frames; base += 4) {
		for (const offset of [3, 2, 4, 1]) {
			timestamps.push((base + offset) / 1000);
			if (timestamps.length === frames) {
				break;
			}
		}
	}

	return timestamps;
};

test('keyframe bank handles samples with non-monotonic timestamps', async () => {
	const bank = await makeKeyframeBank({
		logLevel: 'error',
		src: 'test-src',
		videoSampleSink: makeVideoSampleSink(makeReorderedTimestamps(120)),
		initialTimestampRequest: 0,
	});

	const frame = await bank.getFrameFromTimestamp(0.0018, 1000);

	expect(frame?.timestamp).toBe(0.002);

	const {timestamps} = bank.getOpenFrameCount();
	expect(timestamps).toEqual([...timestamps].sort((a, b) => a - b));
});

test('keyframe bank evicts old frames despite non-monotonic timestamps', async () => {
	const bank = await makeKeyframeBank({
		logLevel: 'error',
		src: 'test-src',
		videoSampleSink: makeVideoSampleSink(makeReorderedTimestamps(160)),
		initialTimestampRequest: 0,
	});

	await bank.getFrameFromTimestamp(0.1, 1000);

	const {timestamps} = bank.getOpenFrameCount();
	expect(timestamps.length).toBeLessThan(25);
	expect(timestamps[0]).toBeGreaterThanOrEqual(0.093);
});
