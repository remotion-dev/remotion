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
			[Symbol.dispose]: () => {},
		}),
		sharedAudioContext: new AudioContext(),
		getIsLooping: () => false,
		getEndTime: () => Infinity,
		getStartTime: () => 0,
		updatePlaybackTime: () => {},
		initialMuted: false,
		drawDebugOverlay: () => {},
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
		maxDuration: number | null,
	) => {
		node.start(mediaTimestamp, 0, maxDuration ?? undefined);
		setTimeout(
			() => {
				node.stop();
			},
			(maxDuration ?? node.buffer?.duration ?? 0) * 1000,
		);
		scheduledChunks.push(mediaTimestamp);
	};

	const {manager, playbackRate, getIsPlaying} = await prepare();

	await manager.seek({
		newTime: 9.96,
		scheduleAudioNode,
		getIsPlaying,
		nonce: makeNonceManager().createAsyncOperation(),
		playbackRate,
	});

	await manager.seek({
		newTime: 0,
		scheduleAudioNode,
		getIsPlaying,
		nonce: makeNonceManager().createAsyncOperation(),
		playbackRate,
	});

	await manager.seek({
		newTime: 0.04,
		scheduleAudioNode,
		getIsPlaying,
		nonce: makeNonceManager().createAsyncOperation(),
		playbackRate,
	});

	const created = manager.getAudioIteratorsCreated();
	expect(created).toBe(2);

	expect(scheduledChunks).toEqual([
		9.941333333333333, 9.962666666666667, 9.984, 0, 0.021333333333333333,
		0.042666666666666665, 0.064, 0.08533333333333333, 0.10666666666666667,
	]);
});

test('should not create too many iterators when the audio ends', async () => {
	const {manager, playbackRate, getIsPlaying} = await prepare();

	const scheduledChunks: number[] = [];
	const scheduleAudioNode = (
		node: AudioBufferSourceNode,
		mediaTimestamp: number,
		maxDuration: number | null,
	) => {
		node.start(mediaTimestamp, 0, maxDuration ?? undefined);
		setTimeout(
			() => {
				node.stop();
			},
			(maxDuration ?? node.buffer?.duration ?? 0) * 1000,
		);
		scheduledChunks.push(mediaTimestamp);
	};

	await manager.seek({
		newTime: 9.97,
		scheduleAudioNode,
		getIsPlaying,
		nonce: makeNonceManager().createAsyncOperation(),
		playbackRate,
	});
	await manager.seek({
		newTime: 9.98,
		scheduleAudioNode,
		getIsPlaying,
		nonce: makeNonceManager().createAsyncOperation(),
		playbackRate,
	});
	await manager.seek({
		newTime: 9.99,
		scheduleAudioNode,
		getIsPlaying,
		nonce: makeNonceManager().createAsyncOperation(),
		playbackRate,
	});

	const created = manager.getAudioIteratorsCreated();
	expect(created).toBe(1);

	expect(scheduledChunks).toEqual([9.962666666666667, 9.984]);
});

test('should create more iterators when seeking ', async () => {
	const {manager, playbackRate, getIsPlaying} = await prepare();

	const scheduledChunks: number[] = [];
	const scheduleAudioNode = (
		node: AudioBufferSourceNode,
		mediaTimestamp: number,
		maxDuration: number | null,
	) => {
		node.start(mediaTimestamp, 0, maxDuration ?? undefined);
		setTimeout(
			() => {
				node.stop();
			},
			(maxDuration ?? node.buffer?.duration ?? 0) * 1000,
		);
		scheduledChunks.push(mediaTimestamp);
	};

	await manager.seek({
		newTime: 0,
		scheduleAudioNode,
		getIsPlaying,
		nonce: makeNonceManager().createAsyncOperation(),
		playbackRate,
	});
	await manager.seek({
		newTime: 1,
		scheduleAudioNode,
		getIsPlaying,
		nonce: makeNonceManager().createAsyncOperation(),
		playbackRate,
	});

	const created = manager.getAudioIteratorsCreated();
	expect(created).toBe(2);

	expect(scheduledChunks).toEqual([
		0, 0.021333333333333333, 0.042666666666666665, 0.064, 0.08533333333333333,
		0.10666666666666667, 0.9813333333333333, 1.0026666666666666, 1.024,
		1.0453333333333332, 1.0666666666666667, 1.088,
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
			[Symbol.dispose]: () => {},
		}),
		sharedAudioContext: new AudioContext(),
		getIsLooping: () => false,
		getEndTime: () => Infinity,
		getStartTime: () => 0,
		updatePlaybackTime: () => {},
		initialMuted: false,
		drawDebugOverlay: () => {},
	});

	const scheduledChunks: number[] = [];
	const scheduleAudioNode = (
		node: AudioBufferSourceNode,
		mediaTimestamp: number,
		maxDuration: number | null,
	) => {
		node.start(mediaTimestamp, 0, maxDuration ?? undefined);
		setTimeout(
			() => {
				node.stop();
			},
			(maxDuration ?? node.buffer?.duration ?? 0) * 1000,
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
			getIsPlaying: () => true,
			nonce: makeNonceManager().createAsyncOperation(),
			playbackRate,
		});
	}

	const uniqueChunks = [...new Set(scheduledChunks)];
	expect(scheduledChunks.length).toBe(uniqueChunks.length);
});

test('should not decode + schedule audio chunks beyond the end time', async () => {
	const endTime = 0.5;
	const fps = 30;

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
			[Symbol.dispose]: () => {},
		}),
		sharedAudioContext: new AudioContext(),
		getIsLooping: () => false,
		getEndTime: () => endTime,
		getStartTime: () => 0,
		updatePlaybackTime: () => {},
		initialMuted: false,
		drawDebugOverlay: () => {},
	});

	const scheduledChunks: {
		timestamp: number;
		maxDuration: number | null;
		bufferDuration: number;
	}[] = [];
	const scheduleAudioNode = (
		node: AudioBufferSourceNode,
		mediaTimestamp: number,
		maxDuration: number | null,
	) => {
		node.start(mediaTimestamp, 0, maxDuration ?? undefined);
		setTimeout(
			() => {
				node.stop();
			},
			(maxDuration ?? node.buffer?.duration ?? 0) * 1000,
		);
		scheduledChunks.push({
			timestamp: mediaTimestamp,
			maxDuration,
			bufferDuration: node.buffer?.duration ?? 0,
		});
	};

	// Simulate playback frame by frame, seeking past the end time
	for (let frame = 0; frame < 30; frame++) {
		const mediaTime = frame / fps;

		await manager.seek({
			newTime: mediaTime,
			scheduleAudioNode,
			getIsPlaying: () => true,
			nonce: makeNonceManager().createAsyncOperation(),
			playbackRate: 1,
		});
	}

	for (const chunk of scheduledChunks) {
		expect(chunk.timestamp).toBeLessThanOrEqual(endTime);
		const effectiveDuration = chunk.maxDuration ?? chunk.bufferDuration;
		expect(chunk.timestamp + effectiveDuration).toBeLessThanOrEqual(
			endTime + 1 / 48000,
		);
	}
});
