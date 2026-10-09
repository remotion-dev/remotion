import {VideoSample, type VideoSampleSink} from 'mediabunny';
import {expect, test, vi} from 'vitest';
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

test('releases old frames before requesting more decoder output', async () => {
	let openFrames = 0;
	const sink: VideoSampleSink = {
		getSample() {
			return Promise.reject(new Error('Not implemented'));
		},
		async *samples() {
			for (let i = 0; i < 20; i++) {
				if (openFrames >= 8) {
					throw new Error('Decoder ran out of output surfaces');
				}

				openFrames++;
				const sample = makeSample({timestamp: i / 30, duration: 1 / 30});
				const originalClose = sample.close.bind(sample);
				let closed = false;
				sample.close = () => {
					if (!closed) {
						closed = true;
						openFrames--;
					}

					originalClose();
				};

				yield sample;
			}
		},
		async *samplesAtTimestamps() {
			yield* [];
		},
	};

	const bank = await makeKeyframeBank({
		logLevel: 'error',
		src: 'limited-decoder-surfaces.mp4',
		videoSampleSink: sink,
		initialTimestampRequest: 0,
	});

	for (let i = 0; i < 12; i++) {
		expect((await bank.getFrameFromTimestamp(i / 30, 30))?.timestamp).toBe(
			i / 30,
		);
	}

	bank.prepareForDeletion('error', 'test');
	expect(openFrames).toBe(0);
});

test('uses next sample timestamp instead of reported duration while rendering', async () => {
	const samples = [
		makeSample({timestamp: 0, duration: 10}),
		makeSample({timestamp: 1, duration: 0.1}),
	];

	const bank = await makeKeyframeBank({
		logLevel: 'error',
		src: 'wrong-duration-frame.mp4',
		videoSampleSink: makeVideoSampleSink(samples),
		initialTimestampRequest: 0,
	});

	const frame = await bank.getFrameFromTimestamp(1.5, 30);

	expect(frame?.timestamp).toBe(1);

	bank.prepareForDeletion('error', 'test');
});

test('starts at a fractional keyframe without reading the preceding frame', async () => {
	// At 30000/1001 fps, rounding frame 61 to milliseconds moves the seek
	// before its keyframe and can make the decoder process the previous GOP.
	const keyframe = 61061 / 30000;
	const duration = 1001 / 30000;
	const timestamps = [keyframe - duration, keyframe, keyframe + duration];
	const emitted: VideoSample[] = [];
	const closes: ReturnType<typeof vi.spyOn>[] = [];
	const sink = makeVideoSampleSink([]);
	sink.samples = async function* (start = 0) {
		const firstIndex = timestamps.findLastIndex((time) => time <= start);
		for (const timestamp of timestamps.slice(firstIndex)) {
			const sample = makeSample({timestamp, duration});
			closes.push(vi.spyOn(sample, 'close'));
			emitted.push(sample);
			yield sample;
		}
	};

	const bank = await makeKeyframeBank({
		logLevel: 'error',
		src: 'fractional-keyframe.mp4',
		videoSampleSink: sink,
		initialTimestampRequest: keyframe,
	});
	try {
		const frame = await bank.getFrameFromTimestamp(keyframe, 30000 / 1001);
		expect(frame?.timestamp).toBe(keyframe);
		expect(emitted.map((sample) => sample.timestamp)).toEqual([keyframe]);
	} finally {
		bank.prepareForDeletion('error', 'test');
	}

	for (const close of closes) {
		expect(close).toHaveBeenCalledTimes(1);
	}
});
