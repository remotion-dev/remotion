import {ALL_FORMATS, Input, UrlSource} from 'mediabunny';
import type {ScheduleAudioNodeResult} from 'remotion';
import {expect, test} from 'vitest';
import {
	anchorToContinuousTime,
	audioIteratorManager,
} from '../audio-iterator-manager';
import {makeNonceManager} from '../nonce-manager';

const prepare = async (options?: {
	fps?: number;
	playbackRate?: number;
	localPlaybackRate?: number;
	mediaEndTimestamp?: number;
	sequenceEndTimestamp?: number;
	sequenceDurationInSeconds?: number;
	startTime?: number;
	loop?: boolean;
}) => {
	const {
		fps = 30,
		playbackRate = 1,
		localPlaybackRate = playbackRate,
		mediaEndTimestamp = Infinity,
		sequenceEndTimestamp = Infinity,
		sequenceDurationInSeconds = 10,
		startTime = 0,
		loop = false,
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
		getSequenceDurationInSeconds: () => sequenceDurationInSeconds,
		getStartTime: () => startTime,
		initialMuted: false,
		drawDebugOverlay: () => {},
		initialPlaybackRate: 1,
		initialTrimBefore: undefined,
		initialTrimAfter: undefined,
		initialSequenceOffset: 0,
		initialSequenceDurationInFrames: 10,
		initialLoop: loop,
		initialFps: 30,
	});

	const scheduledChunks: number[] = [];
	const scheduledStartOffsets: number[] = [];
	const waiters: {count: number; resolve: () => void}[] = [];

	const scheduleAudioNode = (
		_node: AudioBufferSourceNode,
		mediaTimestamp: number,
		_originalUnloopedMediaTimestamp: number,
		startOffsetInSeconds: number,
	): ScheduleAudioNodeResult => {
		scheduledChunks.push(mediaTimestamp);
		scheduledStartOffsets.push(startOffsetInSeconds);
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

	const seek = ({
		time,
		unloopedTime = time,
	}: {
		time: number;
		unloopedTime?: number;
	}) => {
		manager.seek({
			newTime: time,
			unloopedNewTime: unloopedTime,
			scheduleAudioNode,
			nonce: makeNonceManager().createAsyncOperation(),
			playbackRate,
			localPlaybackRate,
			getTargetTime: (mediaTimestamp: number) => mediaTimestamp,
			logLevel: 'info',
			loop,
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
		scheduledStartOffsets,
		seek,
		audioContextCurrentTime,
	};
};

test('anchor maps unlooped time using the local playback rate', () => {
	const anchor = {
		unloopedStartInSeconds: 10,
		mediaStartInSeconds: 4,
	};

	expect(
		anchorToContinuousTime({
			anchor,
			unloopedTimeInSeconds: 12,
			playbackRate: 0.5,
		}),
	).toBe(5);
	expect(
		anchorToContinuousTime({
			anchor,
			unloopedTimeInSeconds: 12,
			playbackRate: 2,
		}),
	).toBe(8);
});

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

test('looping keeps continuous timestamps and reuses the iterator after a wrapped seek', async () => {
	const {manager, seek, scheduledChunks, scheduledStartOffsets} = await prepare(
		{
			playbackRate: 1,
			localPlaybackRate: 0.5,
			mediaEndTimestamp: 0.1,
			sequenceDurationInSeconds: 1,
			loop: true,
		},
	);

	seek({time: 0.08, unloopedTime: 0.08});
	await manager.waitForNScheduledNodes(8);

	expect(scheduledChunks.length).toBeGreaterThanOrEqual(8);
	for (let i = 1; i < scheduledChunks.length; i++) {
		expect(scheduledChunks[i]).toBeGreaterThan(scheduledChunks[i - 1]);
	}

	expect(scheduledChunks.some((timestamp) => timestamp >= 0.1)).toBe(true);
	expect(scheduledStartOffsets.some((offset) => offset > 0)).toBe(true);

	// The wrapped media time differs, but the unlooped time maps into the
	// already queued continuous period using localPlaybackRate.
	seek({time: 0, unloopedTime: 0.12});
	expect(manager.getAudioIteratorsCreated()).toBe(1);

	// Seeking by exactly one loop duration produces the same wrapped media time
	// and must not recreate the iterator either.
	seek({time: 0, unloopedTime: 0.22});
	expect(manager.getAudioIteratorsCreated()).toBe(1);

	manager.destroyIterator();
	expect(manager.getCurrentAnchor()).toBe(null);
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
