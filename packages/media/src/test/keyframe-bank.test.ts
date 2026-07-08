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
