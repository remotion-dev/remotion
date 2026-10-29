import {
	AudioBufferSink,
	InputDisposedError,
	type InputAudioTrack,
} from 'mediabunny';
import type {LogLevel} from 'remotion';
import {Internals, type ScheduleAudioNodeResult} from 'remotion';
import {
	isAlreadyQueued,
	makeAudioIterator,
	type AudioIterator,
	type PreparedAudioChunk,
	type QueuedPeriod,
} from './audio/audio-preview-iterator';
import {getScheduledTime} from './audio/get-scheduled-time';
import {pitchShiftAudioIterator} from './audio/pitch-shift';
import {
	processNext,
	StaleWaiterError,
	waitForTurn,
} from './audio/sort-by-priority';
import type {DelayPlaybackIfNotPremounting} from './delay-playback-if-not-premounting';
import {
	makeIteratorWithPriming,
	makeLoopingIterator,
	type AudioBufferSlice,
} from './make-iterator-with-priming';
import type {Nonce} from './nonce-manager';
import type {SharedAudioContextForMediaPlayer} from './shared-audio-context-for-media-player';

type ScheduleAudioNode = (
	node: AudioBufferSourceNode,
	mediaTimestamp: number,
	originalUnloopedMediaTimestamp: number,
	sourceOffsetInSeconds: number,
	sourceDurationInSeconds: number,
) => ScheduleAudioNodeResult;

export const MINIMUM_AUDIO_BUFFERING_TIME_SECONDS = 0.1;

export const hasEnoughAudioToStartPlayback = (bufferedDuration: number) => {
	return bufferedDuration >= MINIMUM_AUDIO_BUFFERING_TIME_SECONDS;
};

export type AudioIteratorAnchor = {
	// The unlooped time in seconds at which the current iterator was started
	unloopedStartInSeconds: number;
	// The media timestamp emitted by the current iterator at that unlooped time
	mediaStartInSeconds: number;
};

// Convert an unlooped composition time into the iterator's continuous media
// timeline using the anchor established when the iterator was started. The
// looping iterator emits timestamps that continue monotonically across loop
// iterations, so both the scheduler (getTargetTime) and the seek dedup must
// map times into this same frame via the identical formula.
export const anchorToContinuousTime = ({
	anchor,
	unloopedTimeInSeconds,
	playbackRate,
}: {
	anchor: AudioIteratorAnchor;
	unloopedTimeInSeconds: number;
	playbackRate: number;
}): number => {
	return (
		anchor.mediaStartInSeconds +
		(unloopedTimeInSeconds - anchor.unloopedStartInSeconds) * playbackRate
	);
};

export const audioIteratorManager = ({
	audioTrack,
	delayPlaybackHandleIfNotPremounting,
	sharedAudioContext,
	getSequenceEndTimestamp,
	getSequenceDurationInSeconds,
	getMediaEndTimestamp,
	getStartTime,
	getIsPlaying,
	initialMuted,
	initialVolume,
	toneFrequency,
	drawDebugOverlay,
	onError,
}: {
	audioTrack: InputAudioTrack;
	delayPlaybackHandleIfNotPremounting: () => DelayPlaybackIfNotPremounting;
	sharedAudioContext: SharedAudioContextForMediaPlayer;
	getSequenceEndTimestamp: () => number;
	getSequenceDurationInSeconds: () => number;
	getMediaEndTimestamp: () => number;
	getStartTime: () => number;
	getIsPlaying: () => boolean;
	initialMuted: boolean;
	initialVolume: number;
	toneFrequency: number;
	drawDebugOverlay: () => void;
	onError: (error: Error) => void;
}) => {
	let muted = initialMuted;
	let currentVolume = Math.max(0, initialVolume);
	let currentToneFrequency = toneFrequency;
	let currentSeek: {
		time: number;
		playbackRate: number;
		trimBefore: number | undefined;
		trimAfter: number | undefined;
		sequenceOffset: number;
		sequenceDurationInFrames: number;
		loop: boolean;
		fps: number;
	} | null = null;

	const gainNode = sharedAudioContext.audioContext.createGain();
	gainNode.gain.value = muted ? 0 : currentVolume;
	gainNode.connect(sharedAudioContext.gainNode);

	const audioSink = new AudioBufferSink(audioTrack);
	let audioBufferIterator: AudioIterator | null = null;
	// When looping, the iterator emits timestamps that continue monotonically
	// across loop iterations instead of wrapping. This anchor maps the unlooped
	// time to that continuous timeline so the scheduler can align chunks.
	let currentAnchor: AudioIteratorAnchor | null = null;
	let audioIteratorsCreated = 0;
	let totalAudioScheduledInSeconds = 0;
	let currentDelayHandle: {unblock: () => void} | null = null;

	const unblockCurrentDelayHandle = () => {
		if (currentDelayHandle) {
			currentDelayHandle.unblock();
			currentDelayHandle = null;
		}
	};

	const destroyIterator = () => {
		audioBufferIterator?.destroy();
		audioBufferIterator = null;
		// The anchor and seek describe this decoder's media timeline.
		currentAnchor = null;
		currentSeek = null;
		unblockCurrentDelayHandle();
	};

	const getIteratorTime = (
		newTime: number,
		unloopedTime: number,
		localPlaybackRate: number,
		loop: boolean,
	) => {
		return loop && currentAnchor
			? anchorToContinuousTime({
					anchor: currentAnchor,
					unloopedTimeInSeconds: unloopedTime,
					playbackRate: localPlaybackRate,
				})
			: newTime;
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

	const onAudioChunk = ({
		buffer,
		iterator,
	}: {
		buffer: AudioBufferSlice;
		iterator: AudioIterator;
	}) => {
		if (muted) {
			return;
		}

		const startTime = getStartTime();
		const sequenceEndTime = getSequenceEndTimestamp();

		// Skip chunks entirely outside the range
		if (
			buffer.timelineTimestamp + buffer.sourceDurationInSeconds <=
			startTime
		) {
			return;
		}

		if (buffer.timelineTimestamp >= sequenceEndTime) {
			return;
		}

		const scheduledStart = Math.max(buffer.timelineTimestamp, startTime);
		const scheduledEnd = Math.min(
			buffer.timelineTimestamp + buffer.sourceDurationInSeconds,
			sequenceEndTime,
		);
		totalAudioScheduledInSeconds += Math.max(0, scheduledEnd - scheduledStart);

		iterator.scheduleAudio({
			buffer: buffer.buffer.buffer,
			timestamp: buffer.timelineTimestamp,
			originalUnloopedMediaTimestamp: buffer.buffer.timestamp,
			sourceOffsetInSeconds: buffer.sourceOffsetInSeconds,
			sourceDurationInSeconds: Math.min(
				buffer.sourceDurationInSeconds,
				sequenceEndTime - buffer.timelineTimestamp,
			),
		});

		drawDebugOverlay();
	};

	const proceedScheduling = ({
		iterator,
		nonce,
		getTargetTime,
		playbackRate,
		onScheduled,
		onDestroyed,
		onDone,
		currentTime,
		startFromSecond,
		getAudioContextCurrentTimeMockedInTest,
	}: {
		iterator: AudioIterator;
		nonce: Nonce;
		getTargetTime: (
			mediaTimestamp: number,
			currentTime: number,
		) => number | null;
		playbackRate: number;
		onScheduled: (
			sourceDurationInSeconds: number,
			timelineTimestamp: number,
		) => void;
		onDone: () => void;
		onDestroyed: () => void;
		currentTime: number;
		startFromSecond: number;
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

				// Always finish the initial prebuffer, even for future or very slow clips.
				// Bound further paused decoding by prepared media, not a future start time.
				const preparedDuration = guessedNextTimestamp - startFromSecond;
				if (getIsPlaying()) {
					return scheduledTime - getAudioContextCurrentTimeMockedInTest();
				}

				return hasEnoughAudioToStartPlayback(preparedDuration)
					? preparedDuration / playbackRate
					: 0;
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

				onScheduled(
					result.value.sourceDurationInSeconds,
					result.value.timelineTimestamp,
				);
				notifyNodeScheduled();

				onAudioChunk({
					buffer: result.value,
					iterator,
				});
				proceedScheduling({
					iterator,
					nonce,
					getTargetTime,
					playbackRate,
					onScheduled,
					onDestroyed,
					onDone,
					currentTime,
					startFromSecond,
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

				// A non-destructive seek can stale the nonce while retaining this
				// iterator. Only ignore errors when the iterator was replaced.
				if (iterator.isDestroyed()) {
					onDestroyed();
					return;
				}

				iterator.destroy();
				onDestroyed();
				onError(e as Error);
			},
		});
	};

	const startAudioIterator = ({
		nonce,
		playbackRate,
		startFromSecond,
		unloopedStartFromSecond,
		scheduleAudioNode,
		getTargetTime,
		logLevel,
		loop,
		unscheduleAudioNode,
		getAudioContextCurrentTimeMockedInTest,
	}: {
		startFromSecond: number;
		unloopedStartFromSecond: number;
		nonce: Nonce;
		playbackRate: number;
		scheduleAudioNode: ScheduleAudioNode;
		getTargetTime: (
			mediaTimestamp: number,
			currentTime: number,
		) => number | null;
		logLevel: LogLevel;
		loop: boolean;
		unscheduleAudioNode: (node: AudioBufferSourceNode) => boolean | void;
		getAudioContextCurrentTimeMockedInTest: () => number;
	}) => {
		// Audio iterators only schedule forward. Studio's reverse playback must
		// stay silent instead of producing negative AudioBufferSourceNode offsets.
		if (muted || playbackRate <= 0) {
			return;
		}

		const maximumTimestamp =
			loop || currentToneFrequency !== 1
				? getMediaEndTimestamp()
				: Math.min(getMediaEndTimestamp(), getSequenceEndTimestamp());
		if (startFromSecond >= maximumTimestamp) {
			return;
		}

		audioBufferIterator?.destroy();
		unblockCurrentDelayHandle();

		const delayHandle = delayPlaybackHandleIfNotPremounting();
		currentDelayHandle = delayHandle;

		currentAnchor = {
			unloopedStartInSeconds: unloopedStartFromSecond,
			mediaStartInSeconds: startFromSecond,
		};

		const maximumContinuousTimestamp =
			startFromSecond + getSequenceDurationInSeconds() * playbackRate;
		const unshiftedSource = loop
			? makeLoopingIterator({
					audioSink,
					seekTimeInSeconds: startFromSecond,
					loopStartInSeconds: getStartTime(),
					segmentEndInSeconds: maximumTimestamp,
					maximumContinuousTimestamp,
				})
			: makeIteratorWithPriming({
					audioSink,
					timeToSeek: startFromSecond,
					maximumTimestamp,
				});
		const source = pitchShiftAudioIterator({
			iterator: unshiftedSource,
			toneFrequency: currentToneFrequency,
		});
		const iterator = makeAudioIterator({
			startFromSecond,
			iterator: source,
			unscheduleAudioNode,
			scheduleChunk: (chunk: PreparedAudioChunk) => {
				if (muted) return null;
				const node = sharedAudioContext.audioContext.createBufferSource();
				node.buffer = chunk.buffer;
				node.playbackRate.value = playbackRate;
				node.connect(gainNode);
				const started = scheduleAudioNode(
					node,
					chunk.timestamp,
					chunk.originalUnloopedMediaTimestamp,
					chunk.sourceOffsetInSeconds,
					chunk.sourceDurationInSeconds,
				);
				if (started.type === 'not-started') {
					Internals.Log.verbose(
						{logLevel, tag: 'audio-scheduling'},
						'not started, disconnected: %s %s',
						chunk.timestamp.toFixed(3),
						chunk.buffer.duration.toFixed(3),
					);
					node.disconnect();
					return null;
				}

				return node;
			},
		});
		audioIteratorsCreated++;
		audioBufferIterator = iterator;

		let bufferedUntil = startFromSecond;
		let hasUnblockedPlayback = false;
		const unblockPlayback = () => {
			if (hasUnblockedPlayback) {
				return;
			}

			hasUnblockedPlayback = true;
			delayHandle.unblock();
		};

		proceedScheduling({
			iterator,
			nonce,
			getTargetTime,
			playbackRate,
			onScheduled: (sourceDurationInSeconds, timelineTimestamp) => {
				bufferedUntil = Math.max(
					bufferedUntil,
					timelineTimestamp + sourceDurationInSeconds,
				);
				const bufferedDuration = bufferedUntil - startFromSecond;
				// Need to schedule a bit into the future to unblock the buffer state,
				// otherwise we might be scheduling too late. This must be based on
				// timeline coverage, not audible duration or chunk count: silence is
				// already safe to play, and large PCM chunks can exceed the scheduling
				// horizon before enough chunks are queued:
				// https://github.com/remotion-dev/remotion/issues/9394
				if (hasEnoughAudioToStartPlayback(bufferedDuration)) {
					unblockPlayback();
				}
			},
			onDestroyed: () => {
				unblockPlayback();
			},
			onDone: () => {
				unblockPlayback();
			},
			currentTime: sharedAudioContext.audioContext.currentTime,
			startFromSecond,
			getAudioContextCurrentTimeMockedInTest,
		});
	};

	const seek = ({
		newTime,
		unloopedNewTime,
		nonce,
		playbackRate,
		localPlaybackRate,
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
		unloopedNewTime: number;
		nonce: Nonce;
		playbackRate: number;
		localPlaybackRate: number;
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
			currentSeek !== null &&
			currentSeek.time === newTime &&
			currentSeek.playbackRate === playbackRate &&
			currentSeek.trimBefore === trimBefore &&
			currentSeek.trimAfter === trimAfter &&
			currentSeek.sequenceOffset === sequenceOffset &&
			currentSeek.sequenceDurationInFrames === sequenceDurationInFrames &&
			currentSeek.loop === loop &&
			currentSeek.fps === fps &&
			(muted || (audioBufferIterator && !audioBufferIterator.isDestroyed()))
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
			// When looping, queued nodes carry continuous timestamps that don't
			// wrap at loop boundaries. Map the new time into that continuous
			// frame so it can be compared against the queued period.
			const timeToCheck = getIteratorTime(
				newTime,
				unloopedNewTime,
				localPlaybackRate,
				loop,
			);
			const queuedPeriod = audioBufferIterator.getQueuedPeriod();
			// Queued timestamps are in media seconds, so convert the Player's
			// AudioContext tolerance using the combined media and Player rate.
			const anchorTolerance =
				Internals.getAudioSyncAnchorTolerance(sharedAudioContext.audioContext) *
				Math.abs(playbackRate);
			// If there is a missing period, but we'd have no chance to schedule nodes,
			// then let's not bother. Let's just leave the gap.
			const queuedPeriodMinusLatency: QueuedPeriod | null = queuedPeriod
				? {
						from: queuedPeriod.from - anchorTolerance,
						until: queuedPeriod.until,
					}
				: null;
			const currentTimeIsAlreadyQueued = isAlreadyQueued(
				timeToCheck,
				queuedPeriodMinusLatency,
			);
			if (currentTimeIsAlreadyQueued) {
				processNext();
				// current time is scheduled, will keep scheduling
				return;
			}

			const currentIteratorTimestamp = audioBufferIterator.guessNextTimestamp();
			const iteratorHasAdvancedThroughSilence =
				loop &&
				currentAnchor !== null &&
				unloopedNewTime >= currentAnchor.unloopedStartInSeconds &&
				currentIteratorTimestamp >= timeToCheck;
			if (
				iteratorHasAdvancedThroughSilence ||
				(currentIteratorTimestamp < timeToCheck &&
					Math.abs(currentIteratorTimestamp - timeToCheck) < 1)
			) {
				processNext();
				// The iterator has either advanced beyond the current time, meaning
				// the gap is known silence, or is less than 1 second behind. Let it run.
				return;
			}
		}

		startAudioIterator({
			nonce,
			playbackRate,
			startFromSecond: newTime,
			unloopedStartFromSecond: unloopedNewTime,
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
		rescheduleAudio: (
			newTime: number | null,
			unloopedTime: number,
			localPlaybackRate: number,
			loop: boolean,
		) => {
			if (
				newTime !== null &&
				audioBufferIterator?.rescheduleAudio(
					getIteratorTime(newTime, unloopedTime, localPlaybackRate, loop),
				)
			) {
				processNext();
				return true;
			}

			// Missing live samples require a fresh decoder when the caller seeks.
			destroyIterator();
			return false;
		},
		getAudioBufferIterator: () => audioBufferIterator,
		getCurrentAnchor: () => currentAnchor,
		destroyIterator,
		seek,
		getAudioIteratorsCreated: () => audioIteratorsCreated,
		getTotalAudioScheduledInSeconds: () => totalAudioScheduledInSeconds,
		setMuted: (newMuted: boolean) => {
			if (muted === newMuted) {
				return;
			}

			muted = newMuted;
			gainNode.gain.value = muted ? 0 : currentVolume;
			if (muted) {
				destroyIterator();
			}

			// An unmute at the same frame still needs a fresh iterator.
			currentSeek = null;
		},
		setVolume: (volume: number) => {
			currentVolume = Math.max(0, volume);
			gainNode.gain.value = muted ? 0 : currentVolume;
		},
		setToneFrequency: (newToneFrequency: number) => {
			currentToneFrequency = newToneFrequency;
		},
		waitForNScheduledNodes,
	};
};

export type AudioIteratorManager = ReturnType<typeof audioIteratorManager>;
