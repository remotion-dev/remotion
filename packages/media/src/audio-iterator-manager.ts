import {
	AudioBufferSink,
	InputDisposedError,
	type InputAudioTrack,
} from 'mediabunny';
import type {LogLevel} from 'remotion';
import {Internals, type ScheduleAudioNodeResult} from 'remotion';
import {
	ALLOWED_GLOBAL_TIME_ANCHOR_SHIFT,
	isAlreadyQueued,
	makeAudioIterator,
	type AudioIterator,
	type QueuedPeriod,
} from './audio/audio-preview-iterator';
import {getScheduledTime} from './audio/get-scheduled-time';
import {
	processNext,
	StaleWaiterError,
	waitForTurn,
} from './audio/sort-by-priority';
import type {DelayPlaybackIfNotPremounting} from './delay-playback-if-not-premounting';
import type {BufferWithMediaTimestamp} from './make-iterator-with-priming';
import type {Nonce} from './nonce-manager';
import type {SharedAudioContextForMediaPlayer} from './shared-audio-context-for-media-player';

type ScheduleAudioNode = (
	node: AudioBufferSourceNode,
	mediaTimestamp: number,
	originalUnloopedMediaTimestamp: number,
) => ScheduleAudioNodeResult;

export const audioIteratorManager = ({
	audioTrack,
	delayPlaybackHandleIfNotPremounting,
	sharedAudioContext,
	getSequenceEndTimestamp,
	getSequenceDurationInSeconds,
	getMediaEndTimestamp,
	getStartTime,
	initialMuted,
	drawDebugOverlay,
	initialPlaybackRate,
	initialTrimBefore,
	initialTrimAfter,
	initialSequenceOffset,
	initialSequenceDurationInFrames,
	initialLoop,
	initialFps,
}: {
	audioTrack: InputAudioTrack;
	delayPlaybackHandleIfNotPremounting: () => DelayPlaybackIfNotPremounting;
	sharedAudioContext: SharedAudioContextForMediaPlayer;
	getSequenceEndTimestamp: () => number;
	getSequenceDurationInSeconds: () => number;
	getMediaEndTimestamp: () => number;
	getStartTime: () => number;
	initialMuted: boolean;
	drawDebugOverlay: () => void;
	initialPlaybackRate: number;
	initialTrimBefore: number | undefined;
	initialTrimAfter: number | undefined;
	initialSequenceOffset: number;
	initialSequenceDurationInFrames: number;
	initialLoop: boolean;
	initialFps: number;
}) => {
	let muted = initialMuted;
	let currentVolume = 1;
	let currentSeek = {
		// do not prevent first seek
		time: -1,
		playbackRate: initialPlaybackRate,
		trimBefore: initialTrimBefore,
		trimAfter: initialTrimAfter,
		sequenceOffset: initialSequenceOffset,
		sequenceDurationInFrames: initialSequenceDurationInFrames,
		loop: initialLoop,
		fps: initialFps,
	};

	const gainNode = sharedAudioContext.audioContext.createGain();
	gainNode.connect(sharedAudioContext.gainNode);

	const audioSink = new AudioBufferSink(audioTrack);
	let audioBufferIterator: AudioIterator | null = null;
	let audioIteratorsCreated = 0;
	let totalAudioScheduledInSeconds = 0;
	let currentDelayHandle: {unblock: () => void} | null = null;

	const unblockCurrentDelayHandle = () => {
		if (currentDelayHandle) {
			currentDelayHandle.unblock();
			currentDelayHandle = null;
		}
	};

	const pendingScheduleWaiters: {
		remaining: number;
		resolve: () => void;
	}[] = [];

	const notifyNodeScheduled = () => {
		for (let i = pendingScheduleWaiters.length - 1; i >= 0; i--) {
			const waiter = pendingScheduleWaiters[i];
			waiter.remaining--;
			if (waiter.remaining <= 0) {
				waiter.resolve();
				pendingScheduleWaiters.splice(i, 1);
			}
		}
	};

	const waitForNScheduledNodes = (n: number) => {
		if (n <= 0) {
			return Promise.resolve();
		}

		return new Promise<void>((resolve) => {
			pendingScheduleWaiters.push({remaining: n, resolve});
		});
	};

	const scheduleAudioChunk = ({
		buffer,
		mediaTimestamp,
		originalUnloopedMediaTimestamp,
		playbackRate,
		scheduleAudioNode,
		logLevel,
	}: {
		buffer: AudioBuffer;
		mediaTimestamp: number;
		playbackRate: number;
		scheduleAudioNode: ScheduleAudioNode;
		logLevel: LogLevel;
		originalUnloopedMediaTimestamp: number;
	}) => {
		if (!audioBufferIterator) {
			throw new Error('Audio buffer iterator not found');
		}

		if (muted) {
			return;
		}

		const node = sharedAudioContext.audioContext.createBufferSource();
		node.buffer = buffer;
		node.playbackRate.value = playbackRate;
		node.connect(gainNode);

		const started = scheduleAudioNode(
			node,
			mediaTimestamp,
			originalUnloopedMediaTimestamp,
		);

		if (started.type === 'not-started') {
			Internals.Log.verbose(
				{logLevel, tag: 'audio-scheduling'},
				'not started, disconnected: %s %s',
				mediaTimestamp.toFixed(3),
				buffer.duration.toFixed(3),
			);

			node.disconnect();
			return;
		}

		audioBufferIterator.addQueuedAudioNode({
			node,
			timestamp: mediaTimestamp,
			buffer,
			scheduledTime: started.scheduledTime,
			scheduledAtAnchor: sharedAudioContext.audioSyncAnchor.value,
		});
	};

	const onAudioChunk = ({
		buffer,
		playbackRate,
		scheduleAudioNode,
		logLevel,
	}: {
		buffer: BufferWithMediaTimestamp;
		playbackRate: number;
		scheduleAudioNode: ScheduleAudioNode;
		logLevel: LogLevel;
	}) => {
		if (muted) {
			return;
		}

		const startTime = getStartTime();
		const sequenceEndTime = getSequenceEndTimestamp();

		// Skip chunks entirely outside the range
		if (buffer.timestamp + buffer.buffer.duration <= startTime) {
			return;
		}

		if (buffer.timestamp >= sequenceEndTime) {
			return;
		}

		const scheduledStart = Math.max(buffer.timestamp, startTime);
		const scheduledEnd = Math.min(
			buffer.timestamp + buffer.buffer.duration,
			sequenceEndTime,
		);
		totalAudioScheduledInSeconds += Math.max(0, scheduledEnd - scheduledStart);

		scheduleAudioChunk({
			buffer: buffer.buffer.buffer,
			mediaTimestamp: buffer.timestamp,
			playbackRate,
			scheduleAudioNode,
			logLevel,
			originalUnloopedMediaTimestamp: buffer.buffer.timestamp,
		});

		drawDebugOverlay();
	};

	const proceedScheduling = ({
		iterator,
		nonce,
		getTargetTime,
		playbackRate,
		scheduleAudioNode,
		onScheduled,
		onDestroyed,
		onDone,
		logLevel,
		currentTime,
		getAudioContextCurrentTimeMockedInTest,
	}: {
		iterator: AudioIterator;
		nonce: Nonce;
		getTargetTime: (
			mediaTimestamp: number,
			currentTime: number,
		) => number | null;
		playbackRate: number;
		scheduleAudioNode: ScheduleAudioNode;
		onScheduled: (mediaTimestamp: number) => void;
		onDone: () => void;
		onDestroyed: () => void;
		logLevel: LogLevel;
		currentTime: number;
		getAudioContextCurrentTimeMockedInTest: () => number;
	}) => {
		waitForTurn({
			getPriority: () => {
				if (iterator.isDestroyed()) {
					onDestroyed();
					return null;
				}

				const guessedNextTimestamp = iterator.guessNextTimestamp();
				const targetTime = getTargetTime(guessedNextTimestamp, currentTime);
				if (targetTime === null) {
					// Time will not be mounted
					return null;
				}

				const scheduledTime = getScheduledTime({
					mediaTimestamp: guessedNextTimestamp,
					targetTime,
					currentTime,
					sequenceStartTime: getStartTime(),
				});

				return scheduledTime - getAudioContextCurrentTimeMockedInTest();
			},
			fn: () => iterator.getNextFn(),
			onDone: (result, next) => {
				if (iterator.isDestroyed()) {
					next();
					onDestroyed();
					return;
				}

				// We schedule even if nonce.isStale(), because the iterator is still alive and the seek did not destroy the
				// iterator. So the seek was non-destructive, and the schedule valid. The iterator already progressed, we cannot get it again.

				if (!result.value) {
					// media ended
					next();
					onDone();
					return;
				}

				onScheduled(result.value.timestamp);
				notifyNodeScheduled();

				onAudioChunk({
					buffer: result.value,
					playbackRate,
					scheduleAudioNode,
					logLevel,
				});
				proceedScheduling({
					iterator,
					nonce,
					getTargetTime,
					playbackRate,
					scheduleAudioNode,
					onScheduled,
					onDestroyed,
					onDone,
					logLevel,
					currentTime,
					getAudioContextCurrentTimeMockedInTest,
				});
				next();
			},
			onError: (e) => {
				if (e instanceof InputDisposedError) {
					// iterator was disposed by a newer startAudioIterator call
					// this is expected during rapid seeking
					onDestroyed();
					return;
				}

				if (e instanceof StaleWaiterError) {
					onDestroyed();
					// iterator was stale before it got its turn
					return;
				}

				throw e;
			},
		});
	};

	const startAudioIterator = ({
		nonce,
		playbackRate,
		startFromSecond,
		scheduleAudioNode,
		getTargetTime,
		logLevel,
		loop,
		unscheduleAudioNode,
		getAudioContextCurrentTimeMockedInTest,
	}: {
		startFromSecond: number;
		nonce: Nonce;
		playbackRate: number;
		scheduleAudioNode: ScheduleAudioNode;
		getTargetTime: (
			mediaTimestamp: number,
			currentTime: number,
		) => number | null;
		logLevel: LogLevel;
		loop: boolean;
		unscheduleAudioNode: (node: AudioBufferSourceNode) => void;
		getAudioContextCurrentTimeMockedInTest: () => number;
	}) => {
		if (muted) {
			return;
		}

		const maximumTimestamp = getMediaEndTimestamp();
		if (startFromSecond >= maximumTimestamp) {
			return;
		}

		audioBufferIterator?.destroy();
		unblockCurrentDelayHandle();

		const delayHandle = delayPlaybackHandleIfNotPremounting();
		currentDelayHandle = delayHandle;

		const iterator = makeAudioIterator({
			startFromSecond,
			maximumTimestamp,
			audioSink,
			logLevel,
			loop,
			playbackRate,
			sequenceDurationInSeconds: getSequenceDurationInSeconds(),
			unscheduleAudioNode,
		});
		audioIteratorsCreated++;
		audioBufferIterator = iterator;

		let chunksScheduled = 0;

		proceedScheduling({
			iterator,
			nonce,
			getTargetTime,
			playbackRate,
			scheduleAudioNode,
			onScheduled: () => {
				chunksScheduled++;
				// Need to schedule a bit into the future to unblock the buffer state,
				// otherwise we might be scheduling too late.
				if (chunksScheduled === 6) {
					delayHandle.unblock();
				}
			},
			onDestroyed: () => {
				delayHandle.unblock();
			},
			onDone: () => {
				delayHandle.unblock();
			},
			logLevel,
			currentTime: sharedAudioContext.audioContext.currentTime,
			getAudioContextCurrentTimeMockedInTest,
		});
	};

	const seek = ({
		newTime,
		nonce,
		playbackRate,
		scheduleAudioNode,
		getTargetTime,
		logLevel,
		loop,
		trimBefore,
		trimAfter,
		sequenceOffset,
		sequenceDurationInFrames,
		fps,
		getAudioContextCurrentTimeMockedInTest,
	}: {
		newTime: number;
		nonce: Nonce;
		playbackRate: number;
		scheduleAudioNode: ScheduleAudioNode;
		getTargetTime: (
			mediaTimestamp: number,
			currentTime: number,
		) => number | null;
		logLevel: LogLevel;
		loop: boolean;
		trimBefore: number | undefined;
		trimAfter: number | undefined;
		sequenceOffset: number;
		sequenceDurationInFrames: number;
		fps: number;
		getAudioContextCurrentTimeMockedInTest: () => number;
	}) => {
		if (nonce.isStale()) {
			return;
		}

		if (
			currentSeek.time === newTime &&
			currentSeek.playbackRate === playbackRate &&
			currentSeek.trimBefore === trimBefore &&
			currentSeek.trimAfter === trimAfter &&
			currentSeek.sequenceOffset === sequenceOffset &&
			currentSeek.sequenceDurationInFrames === sequenceDurationInFrames &&
			currentSeek.loop === loop &&
			currentSeek.fps === fps
		) {
			return;
		}

		currentSeek = {
			time: newTime,
			playbackRate,
			trimBefore,
			trimAfter,
			sequenceOffset,
			sequenceDurationInFrames,
			loop,
			fps,
		};

		if (muted) {
			return;
		}

		if (audioBufferIterator && !audioBufferIterator.isDestroyed()) {
			const queuedPeriod = audioBufferIterator.getQueuedPeriod();
			// If there is a missing period, but we'd have no chance to schedule nodes,
			// then let's not bother. Let's just leave the gap.
			const queuedPeriodMinusLatency: QueuedPeriod | null = queuedPeriod
				? {
						from:
							queuedPeriod.from -
							ALLOWED_GLOBAL_TIME_ANCHOR_SHIFT -
							sharedAudioContext.audioContext.baseLatency -
							sharedAudioContext.audioContext.outputLatency,
						until: queuedPeriod.until,
					}
				: null;
			const currentTimeIsAlreadyQueued = isAlreadyQueued(
				newTime,
				queuedPeriodMinusLatency,
			);
			if (currentTimeIsAlreadyQueued) {
				processNext();
				// current time is scheduled, will keep scheduling
				return;
			}

			const currentIteratorTimestamp = audioBufferIterator.guessNextTimestamp();
			if (
				currentIteratorTimestamp < newTime &&
				Math.abs(currentIteratorTimestamp - newTime) < 1
			) {
				processNext();
				// iterator is less than 1 second behind, we will just let it run
				return;
			}
		}

		startAudioIterator({
			nonce,
			playbackRate,
			startFromSecond: newTime,
			scheduleAudioNode,
			getTargetTime,
			logLevel,
			loop,
			unscheduleAudioNode: sharedAudioContext.unscheduleAudioNode,
			getAudioContextCurrentTimeMockedInTest,
		});

		// Not further scheduling, initial iterator is already running
	};

	return {
		startAudioIterator,
		getAudioBufferIterator: () => audioBufferIterator,
		destroyIterator: () => {
			audioBufferIterator?.destroy();
			audioBufferIterator = null;
			unblockCurrentDelayHandle();
		},
		seek,
		getAudioIteratorsCreated: () => audioIteratorsCreated,
		getTotalAudioScheduledInSeconds: () => totalAudioScheduledInSeconds,
		setMuted: (newMuted: boolean) => {
			muted = newMuted;
			gainNode.gain.value = muted ? 0 : currentVolume;
		},
		setVolume: (volume: number) => {
			currentVolume = Math.max(0, volume);
			gainNode.gain.value = muted ? 0 : currentVolume;
		},
		scheduleAudioChunk,
		waitForNScheduledNodes,
	};
};

export type AudioIteratorManager = ReturnType<typeof audioIteratorManager>;
