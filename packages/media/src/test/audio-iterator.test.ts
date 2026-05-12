import {ALL_FORMATS, Input, UrlSource} from 'mediabunny';
import type {ScheduleAudioNodeResult} from 'remotion';
import {expect, test} from 'vitest';
import {audioIteratorManager} from '../audio-iterator-manager';
import {makeNonceManager} from '../nonce-manager';

const prepare = async (options?: {
	fps?: number;
	playbackRate?: number;
	mediaEndTimestamp?: number;
	sequenceEndTimestamp?: number;
}) => {
	const {
		fps = 30,
		playbackRate = 1,
		mediaEndTimestamp = Infinity,
		sequenceEndTimestamp = Infinity,
	} = options ?? {};
	const input = new Input({
		source: new UrlSource('https://remotion.media/video.mp4'),
		formats: ALL_FORMATS,
	});
	const audioTrack = await input.getPrimaryAudioTrack();
	if (!audioTrack) {
		throw new Error('No audio track found');
	}

	const audioContext = new AudioContext();

	const audioContextCurrentTime = {
		current: 0,
	};

	const scheduleSharedAudioNode = (): ScheduleAudioNodeResult => {
		return {
			type: 'started',
			scheduledTime: 0,
		};
	};

	const unscheduleAudioNode = () => {};
	const audioSyncAnchor = {value: 0};

	const manager = audioIteratorManager({
		audioTrack,
		delayPlaybackHandleIfNotPremounting: () => ({
			unblock: () => {},
			[Symbol.dispose]: () => {},
		}),
		sharedAudioContext: {
			audioContext,
			gainNode: audioContext.createGain(),
			audioSyncAnchor,
			scheduleAudioNode: scheduleSharedAudioNode,
			unscheduleAudioNode,
		},
		getMediaEndTimestamp: () => mediaEndTimestamp,
		getSequenceEndTimestamp: () => sequenceEndTimestamp,
		getSequenceDurationInSeconds: () => 10,
		getStartTime: () => 0,
		initialMuted: false,
		drawDebugOverlay: () => {},
		initialPlaybackRate: 1,
		initialTrimBefore: undefined,
		initialTrimAfter: undefined,
		initialSequenceOffset: 0,
		initialSequenceDurationInFrames: 10,
		initialLoop: false,
		initialFps: 30,
	});

	const scheduledChunks: number[] = [];
	const waiters: {count: number; resolve: () => void}[] = [];

	const scheduleAudioNode = (
		_node: AudioBufferSourceNode,
		mediaTimestamp: number,
	): ScheduleAudioNodeResult => {
		scheduledChunks.push(mediaTimestamp);
		for (let i = waiters.length - 1; i >= 0; i--) {
			if (scheduledChunks.length >= waiters[i].count) {
				waiters[i].resolve();
				waiters.splice(i, 1);
			}
		}

		return {
			type: 'started',
			scheduledTime: mediaTimestamp,
		};
	};

	const seek = ({time}: {time: number}) => {
		manager.seek({
			newTime: time,
			scheduleAudioNode,
			nonce: makeNonceManager().createAsyncOperation(),
			playbackRate,
			getTargetTime: (mediaTimestamp: number) => mediaTimestamp,
			logLevel: 'info',
			loop: false,
			trimBefore: undefined,
			trimAfter: undefined,
			sequenceOffset: 0,
			sequenceDurationInFrames: 10,
			fps,
			getAudioContextCurrentTimeMockedInTest: () =>
				audioContextCurrentTime.current,
		});
	};

	return {
		manager,
		fps,
		scheduledChunks,
		seek,
		audioContextCurrentTime,
	};
};

test('media player should work', async () => {
	const {manager, scheduledChunks, seek, audioContextCurrentTime} =
		await prepare();

	audioContextCurrentTime.current = 9.96;
	seek({
		time: 9.96,
	});

	await manager.waitForNScheduledNodes(3);
	expect(scheduledChunks).toEqual([
		9.941333333333333, 9.962666666666667, 9.984,
	]);

	scheduledChunks.length = 0;
	seek({
		time: 0,
	});

	await manager.waitForNScheduledNodes(3);

	expect(scheduledChunks).toEqual([
		0, 0.021333333333333333, 0.042666666666666665,
	]);
	scheduledChunks.length = 0;

	seek({
		time: 0.04,
	});

	await manager.waitForNScheduledNodes(2);

	manager.destroyIterator();

	expect(scheduledChunks).toEqual([0.064, 0.08533333333333333]);

	const created = manager.getAudioIteratorsCreated();
	expect(created).toBe(2);
	manager.destroyIterator();
});

test('should not create too many iterators when the audio ends', async () => {
	const {manager, seek, scheduledChunks, audioContextCurrentTime} =
		await prepare();

	audioContextCurrentTime.current = 9.97;
	seek({
		time: 9.97,
	});
	await manager.waitForNScheduledNodes(0);

	seek({
		time: 9.98,
	});
	await manager.waitForNScheduledNodes(2);

	const created = manager.getAudioIteratorsCreated();
	expect(created).toBe(1);

	expect(scheduledChunks).toEqual([9.962666666666667, 9.984]);
});

test('should not create too many iterators when the audio ends (variant)', async () => {
	const {manager, seek, scheduledChunks, audioContextCurrentTime} =
		await prepare();

	audioContextCurrentTime.current = 9.97;
	seek({
		time: 9.97,
	});
	await manager.waitForNScheduledNodes(2);

	seek({
		time: 9.98,
	});
	await manager.waitForNScheduledNodes(0);

	const created = manager.getAudioIteratorsCreated();
	expect(created).toBe(1);

	expect(scheduledChunks).toEqual([9.962666666666667, 9.984]);
});

test('should create more iterators when seeking ', async () => {
	const {manager, seek, scheduledChunks, audioContextCurrentTime} =
		await prepare();

	seek({
		time: 0,
	});
	await manager.waitForNScheduledNodes(6);
	expect(scheduledChunks).toEqual([
		0, 0.021333333333333333, 0.042666666666666665, 0.064, 0.08533333333333333,
		0.10666666666666667,
	]);
	scheduledChunks.length = 0;
	audioContextCurrentTime.current = 2;
	seek({
		time: 2,
	});
	await manager.waitForNScheduledNodes(6);

	const created = manager.getAudioIteratorsCreated();
	expect(created).toBe(2);

	expect(scheduledChunks).toEqual([
		1.984, 2.005333333333333, 2.026666666666667, 2.048, 2.0693333333333332,
		2.0906666666666665,
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

	const {seek, manager, scheduledChunks} = await prepare({
		fps: 25,
		playbackRate: 0.5,
	});

	const fps = 25;
	const playbackRate = 0.5;

	// Simulate sequential seeks like real playback over many frames
	// At 25fps with playbackRate=0.5, media time advances 20ms per frame
	// But AAC audio chunks are 21.33ms, so we keep re-encountering them

	// Simulate 30 frames of playback
	// (about 1.2 seconds real time, 0.6s media time)
	for (let frame = 0; frame < 30; frame++) {
		const mediaTime = frame * (1 / fps) * playbackRate;

		seek({
			time: mediaTime,
		});
		await manager.waitForNScheduledNodes(1);
	}

	const uniqueChunks = [...new Set(scheduledChunks)];
	expect(uniqueChunks.length).toEqual(30);
	expect(scheduledChunks.length).toBe(uniqueChunks.length);
});

test('should not decode + schedule audio chunks beyond the end time', async () => {
	const endTime = 0.5;
	const fps = 30;

	const {seek, manager, scheduledChunks, audioContextCurrentTime} =
		await prepare({
			fps,
			mediaEndTimestamp: endTime,
			sequenceEndTimestamp: endTime,
		});

	const prom = manager.waitForNScheduledNodes(23);

	// Simulate playback frame by frame, seeking past the end time
	for (let frame = 0; frame < 30; frame++) {
		const mediaTime = frame / fps;
		audioContextCurrentTime.current = mediaTime;
		seek({time: mediaTime});
	}

	await prom;

	for (const timestamp of scheduledChunks) {
		expect(timestamp).toBeLessThanOrEqual(endTime);
	}

	expect(scheduledChunks.length).toBe(23);
});
