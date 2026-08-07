import {VideoSample, type VideoSampleSink} from 'mediabunny';
import {expect, test} from 'vitest';
// Importing `keyframe-manager` directly would hit the import cycle with
// `caches.ts`, so use the singleton it exports.
import {keyframeManager} from '../caches';

const FPS = 10;

const makeSample = (timestamp: number) => {
	return new VideoSample(new Uint8Array(4), {
		format: 'RGBA',
		codedWidth: 1,
		codedHeight: 1,
		timestamp,
		duration: 1 / FPS,
	});
};

// Simulates a video with a keyframe every second: a seek to `start` begins
// decoding at floor(start). Records every seek so tests can detect when a
// bank had to be rebuilt.
const makeSeekTrackingSink = () => {
	const seeks: number[] = [];
	const sink: VideoSampleSink = {
		getSample() {
			return Promise.reject(new Error('Not implemented'));
		},
		async *samples(start = 0) {
			seeks.push(start);
			for (let i = Math.round(Math.floor(start) * FPS); ; i++) {
				yield makeSample(i / FPS);
			}
		},
		async *samplesAtTimestamps() {
			yield* [];
		},
	};

	return {sink, seeks};
};

test('concurrent playheads on the same src do not clear each other`s banks', async () => {
	const manager = keyframeManager;
	manager.clearAll('error');
	const {sink, seeks} = makeSeekTrackingSink();
	const src = 'same-video.mp4';

	// Two <Video> tags with the same src, mounted 30 seconds apart in the
	// timeline, advancing frame by frame in lockstep - like a
	// picture-in-picture or delayed-copy composition during a render.
	const playheads = [1, 31];

	for (let step = 0; step < 20; step++) {
		for (const base of playheads) {
			const timestamp = base + step / FPS;
			const bank = await manager.requestKeyframeBank({
				timestamp,
				videoSampleSink: sink,
				src,
				logLevel: 'error',
				maxCacheSize: 100 * 1024 * 1024,
				fps: FPS,
			});
			if (bank === null) {
				throw new Error('Expected an active keyframe bank');
			}

			const frame = await bank.getFrameFromTimestamp(timestamp, FPS);
			expect(frame?.timestamp).toBeCloseTo(timestamp, 3);
		}
	}

	// One seek per playhead. Previously, every request from the playhead that
	// was further ahead in the file would delete the other playhead's bank,
	// forcing a re-seek and re-decode from the previous keyframe for every
	// single frame.
	expect(seeks).toEqual([1, 31]);

	manager.clearAll('error');
});

test('banks that are no longer being read still get cleared', async () => {
	const manager = keyframeManager;
	manager.clearAll('error');
	const {sink, seeks} = makeSeekTrackingSink();
	const src = 'same-video.mp4';

	const request = async (timestamp: number) => {
		const bank = await manager.requestKeyframeBank({
			timestamp,
			videoSampleSink: sink,
			src,
			logLevel: 'error',
			maxCacheSize: 100 * 1024 * 1024,
			fps: FPS,
		});
		if (bank === null) {
			throw new Error('Expected an active keyframe bank');
		}

		await bank.getFrameFromTimestamp(timestamp, FPS);
	};

	// A bank is created at the start of the file, then abandoned: the
	// playhead seeks far ahead and keeps going.
	await request(0);
	for (let step = 0; step < 60; step++) {
		await request(100 + step / FPS);
	}

	// Once the first bank has not been touched for more than the recency
	// window, it is cleared - so going back to it requires a fresh seek.
	await request(0);
	expect(seeks).toEqual([0, 100, 0]);

	manager.clearAll('error');
});
