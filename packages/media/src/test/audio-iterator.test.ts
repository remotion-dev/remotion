import {ALL_FORMATS, Input, UrlSource} from 'mediabunny';
import {expect, test} from 'vitest';
import {audioIteratorManager} from '../audio-iterator-manager';
import {makeNonceManager} from '../nonce-manager';

const prepare = async () => {
	const input = new Input({
		source: new UrlSource('https://remotion.media/video.mp4'),
		formats: ALL_FORMATS,
	});
	const audioTrack = await input.getPrimaryAudioTrack();
	if (!audioTrack) {
		throw new Error('No audio track found');
	}

	const manager = audioIteratorManager({
		audioTrack,
		delayPlaybackHandleIfNotPremounting: () => ({
			unblock: () => {},
		}),
		sharedAudioContext: new AudioContext(),
	});

	const fps = 30;
	const playbackRate = 1;
	const getIsPlaying = () => true;

	return {
		manager,
		fps,
		playbackRate,
		getIsPlaying,
	};
};

test('media player should work', async () => {
	const scheduledChunks: number[] = [];
	const scheduleAudioNode = (
		node: AudioBufferSourceNode,
		mediaTimestamp: number,
	) => {
		node.start(mediaTimestamp);
		setTimeout(
			() => {
				node.stop();
			},
			(node.buffer?.duration ?? 0) * 1000,
		);
		scheduledChunks.push(mediaTimestamp);
	};

	const {manager, fps, playbackRate, getIsPlaying} = await prepare();

	await manager.seek({
		newTime: 9.96,
		scheduleAudioNode,
		fps,
		getIsPlaying,
		nonce: makeNonceManager().createAsyncOperation(),
		playbackRate,

		bufferState: {
			delayPlayback: () => ({
				unblock: () => {},
			}),
		},
	});

	await manager.seek({
		newTime: 0,
		scheduleAudioNode,
		fps,
		getIsPlaying,
		nonce: makeNonceManager().createAsyncOperation(),
		playbackRate,

		bufferState: {
			delayPlayback: () => ({
				unblock: () => {},
			}),
		},
	});

	await manager.seek({
		newTime: 0.04,
		scheduleAudioNode,
		fps,
		getIsPlaying,
		nonce: makeNonceManager().createAsyncOperation(),
		playbackRate,

		bufferState: {
			delayPlayback: () => ({
				unblock: () => {},
			}),
		},
	});

	const created = manager.getAudioIteratorsCreated();
	expect(created).toBe(2);

	expect(scheduledChunks).toEqual([
		9.941333333333333, 9.962666666666667, 9.984, 0, 0.021333333333333333,
		0.042666666666666665, 0.064, 0.08533333333333333, 0.10666666666666667,
		0.128,
	]);
});

test('should not create too many iterators when the audio ends', async () => {
	const {manager, fps, playbackRate, getIsPlaying} = await prepare();

	const scheduledChunks: number[] = [];
	const scheduleAudioNode = (
		node: AudioBufferSourceNode,
		mediaTimestamp: number,
	) => {
		node.start(mediaTimestamp);
		setTimeout(
			() => {
				node.stop();
			},
			(node.buffer?.duration ?? 0) * 1000,
		);
		scheduledChunks.push(mediaTimestamp);
	};

	await manager.seek({
		newTime: 9.97,
		scheduleAudioNode,
		fps,
		getIsPlaying,
		nonce: makeNonceManager().createAsyncOperation(),
		playbackRate,

		bufferState: {
			delayPlayback: () => ({
				unblock: () => {},
			}),
		},
	});
	await manager.seek({
		newTime: 9.98,
		scheduleAudioNode,
		fps,
		getIsPlaying,
		nonce: makeNonceManager().createAsyncOperation(),
		playbackRate,

		bufferState: {
			delayPlayback: () => ({
				unblock: () => {},
			}),
		},
	});
	await manager.seek({
		newTime: 9.99,
		scheduleAudioNode,
		fps,
		getIsPlaying,
		nonce: makeNonceManager().createAsyncOperation(),
		playbackRate,

		bufferState: {
			delayPlayback: () => ({
				unblock: () => {},
			}),
		},
	});

	const created = manager.getAudioIteratorsCreated();
	expect(created).toBe(1);

	expect(scheduledChunks).toEqual([9.962666666666667, 9.984]);
});

test('should create more iterators when seeking ', async () => {
	const {manager, fps, playbackRate, getIsPlaying} = await prepare();

	const scheduledChunks: number[] = [];
	const scheduleAudioNode = (
		node: AudioBufferSourceNode,
		mediaTimestamp: number,
	) => {
		node.start(mediaTimestamp);
		setTimeout(
			() => {
				node.stop();
			},
			(node.buffer?.duration ?? 0) * 1000,
		);
		scheduledChunks.push(mediaTimestamp);
	};

	await manager.seek({
		newTime: 0,
		scheduleAudioNode,
		fps,
		getIsPlaying,
		nonce: makeNonceManager().createAsyncOperation(),
		playbackRate,

		bufferState: {
			delayPlayback: () => ({
				unblock: () => {},
			}),
		},
	});
	await manager.seek({
		newTime: 1,
		scheduleAudioNode,
		fps,
		getIsPlaying,
		nonce: makeNonceManager().createAsyncOperation(),
		playbackRate,

		bufferState: {
			delayPlayback: () => ({
				unblock: () => {},
			}),
		},
	});

	const created = manager.getAudioIteratorsCreated();
	expect(created).toBe(2);

	expect(scheduledChunks).toEqual([
		0, 0.021333333333333333, 0.042666666666666665, 0.9813333333333333,
		1.0026666666666666, 1.024,
	]);
});

// https://github.com/remotion-dev/remotion/issues/5872#issuecomment-3541004403
test('should not schedule duplicate chunks with playbackRate=0.5', async () => {
	const input = new Input({
		source: new UrlSource('https://remotion.media/video.mp4'),
		formats: ALL_FORMATS,
	});
	const audioTrack = await input.getPrimaryAudioTrack();
	if (!audioTrack) {
		throw new Error('No audio track found');
	}

	const manager = audioIteratorManager({
		audioTrack,
		delayPlaybackHandleIfNotPremounting: () => ({
			unblock: () => {},
		}),
		sharedAudioContext: new AudioContext(),
	});

	const scheduledChunks: number[] = [];
	const scheduleAudioNode = (
		node: AudioBufferSourceNode,
		mediaTimestamp: number,
	) => {
		node.start(mediaTimestamp);
		setTimeout(
			() => {
				node.stop();
			},
			(node.buffer?.duration ?? 0) * 1000,
		);
		scheduledChunks.push(mediaTimestamp);
	};

	const fps = 25;
	const playbackRate = 0.5;

	// Simulate sequential seeks like real playback over many frames
	// At 25fps with playbackRate=0.5, media time advances 20ms per frame
	// But AAC audio chunks are 21.33ms, so we keep re-encountering them

	// Simulate 30 frames of playback
	// (about 1.2 seconds real time, 0.6s media time)
	for (let frame = 0; frame < 30; frame++) {
		const mediaTime = frame * (1 / fps) * playbackRate;

		await manager.seek({
			newTime: mediaTime,
			scheduleAudioNode,
			fps,
			getIsPlaying: () => true,
			nonce: makeNonceManager().createAsyncOperation(),
			playbackRate,

			bufferState: {
				delayPlayback: () => ({
					unblock: () => {},
				}),
			},
		});
	}

	const uniqueChunks = [...new Set(scheduledChunks)];
	expect(scheduledChunks.length).toBe(uniqueChunks.length);
});

test('should schedule audio when looping back to beginning after reaching end', async () => {
	const {manager, fps, playbackRate, getIsPlaying} = await prepare();

	const scheduledChunks: number[] = [];
	const scheduleAudioNode = (
		node: AudioBufferSourceNode,
		mediaTimestamp: number,
	) => {
		node.start(mediaTimestamp);
		setTimeout(
			() => {
				node.stop();
			},
			(node.buffer?.duration ?? 0) * 1000,
		);
		scheduledChunks.push(mediaTimestamp);
	};

	// Seek near the end of the video
	await manager.seek({
		newTime: 9.97,
		scheduleAudioNode,
		fps,
		getIsPlaying,
		nonce: makeNonceManager().createAsyncOperation(),
		playbackRate,

		bufferState: {
			delayPlayback: () => ({
				unblock: () => {},
			}),
		},
	});

	// The audio iterator should now be at the end
	const chunksBeforeLoop = scheduledChunks.length;
	expect(chunksBeforeLoop).toBeGreaterThan(0);

	// Now loop back to the beginning (simulating loop behavior)
	await manager.seek({
		newTime: 0,
		scheduleAudioNode,
		fps,
		getIsPlaying,
		nonce: makeNonceManager().createAsyncOperation(),
		playbackRate,

		bufferState: {
			delayPlayback: () => ({
				unblock: () => {},
			}),
		},
	});

	// BUG: Audio should be scheduled after looping, but it's not
	const chunksAfterLoop = scheduledChunks.length;
	expect(chunksAfterLoop).toBeGreaterThan(chunksBeforeLoop);

	// Should have created 2 iterators: one for near the end, one for the loop
	const created = manager.getAudioIteratorsCreated();
	expect(created).toBe(2);

	// Verify we have chunks from both the end and the beginning
	expect(scheduledChunks.some((t) => t > 9.9)).toBe(true);
	expect(scheduledChunks.some((t) => t < 0.1)).toBe(true);
});

test('should use pre-warmed iterator when looping with prepareLoopTransition', async () => {
	const {manager, fps, playbackRate, getIsPlaying} = await prepare();

	const scheduledChunks: number[] = [];
	const scheduleAudioNode = (
		node: AudioBufferSourceNode,
		mediaTimestamp: number,
	) => {
		node.start(mediaTimestamp);
		setTimeout(
			() => {
				node.stop();
			},
			(node.buffer?.duration ?? 0) * 1000,
		);
		scheduledChunks.push(mediaTimestamp);
	};

	// simulate loop scenario & preparing for loop
	await manager.prepareLoopTransition({startTimeInSeconds: 0});

	await manager.seek({
		newTime: 9.97,
		scheduleAudioNode,
		fps,
		getIsPlaying,
		nonce: makeNonceManager().createAsyncOperation(),
		playbackRate,
		bufferState: {
			delayPlayback: () => ({unblock: () => {}}),
		},
	});

	const chunksBeforeLoop = scheduledChunks.length;
	const iteratorsBeforeLoop = manager.getAudioIteratorsCreated();

	expect(iteratorsBeforeLoop).toBe(1);

	await manager.seek({
		newTime: 0,
		scheduleAudioNode,
		fps,
		getIsPlaying,
		nonce: makeNonceManager().createAsyncOperation(),
		playbackRate,
		bufferState: {
			delayPlayback: () => ({unblock: () => {}}),
		},
	});

	const chunksAfterLoop = scheduledChunks.length;
	expect(chunksAfterLoop).toBeGreaterThan(chunksBeforeLoop);

	const loopChunks = scheduledChunks.slice(chunksBeforeLoop);
	expect(loopChunks.some((t) => t < 0.1)).toBe(true);

	// Key assertion: No new iterator was created during the loop!
	// We reused the pre-warmed one, so iterator count stays at 1
	const iteratorsAfterLoop = manager.getAudioIteratorsCreated();
	expect(iteratorsAfterLoop).toBe(1);

	// Most robust assertion: Verify the swap occurred exactly once
	expect(manager.getLoopSwapCount()).toBe(1);

	expect(scheduledChunks.some((t) => t > 9.9)).toBe(true);
	expect(scheduledChunks.some((t) => t < 0.1)).toBe(true);
});
