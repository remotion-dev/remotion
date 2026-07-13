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
import {
	makeIteratorWithPriming,
	makeLoopingIterator,
	type AudioBufferSlice,
} from './make-iterator-with-priming';
import type {Nonce} from './nonce-manager';
import type {SharedAudioContextForMediaPlayer} from './shared-audio-context-for-media-player';

type ScheduleAudioNode = (options: {
	node: AudioBufferSourceNode;
	mediaTimestamp: number;
	originalUnloopedMediaTimestamp: number;
	sourceOffsetInSeconds: number;
	sourceDurationInSeconds: number;
	processingLatencyInSeconds: number;
}) => ScheduleAudioNodeResult;

type SetPitchParamsOptions = {
	preservePitch: boolean;
	toneFrequency: number;
	combinedPlaybackRate: number;
};

type ScheduleAudioChunkOptions = {
	buffer: AudioBuffer;
	mediaTimestamp: number;
	playbackRate: number;
	scheduleAudioNode: ScheduleAudioNode;
	logLevel: LogLevel;
	originalUnloopedMediaTimestamp: number;
	sourceOffsetInSeconds: number;
	sourceDurationInSeconds: number;
};

type OnAudioChunkOptions = {
	buffer: AudioBufferSlice;
	playbackRate: number;
	scheduleAudioNode: ScheduleAudioNode;
	logLevel: LogLevel;
};

type ProceedSchedulingOptions = {
	iterator: AudioIterator;
	nonce: Nonce;
	getTargetTime: (mediaTimestamp: number, currentTime: number) => number | null;
	playbackRate: number;
	scheduleAudioNode: ScheduleAudioNode;
	onScheduled: (mediaTimestamp: number) => void;
	onDone: () => void;
	onDestroyed: () => void;
	logLevel: LogLevel;
	currentTime: number;
	getAudioContextCurrentTimeMockedInTest: () => number;
};

type StartAudioIteratorOptions = {
	startFromSecond: number;
	unloopedStartFromSecond: number;
	nonce: Nonce;
	playbackRate: number;
	scheduleAudioNode: ScheduleAudioNode;
	getTargetTime: (mediaTimestamp: number, currentTime: number) => number | null;
	logLevel: LogLevel;
	loop: boolean;
	unscheduleAudioNode: (node: AudioBufferSourceNode) => void;
	getAudioContextCurrentTimeMockedInTest: () => number;
};

type SeekOptions = {
	newTime: number;
	unloopedNewTime: number;
	nonce: Nonce;
	playbackRate: number;
	localPlaybackRate: number;
	scheduleAudioNode: ScheduleAudioNode;
	getTargetTime: (mediaTimestamp: number, currentTime: number) => number | null;
	logLevel: LogLevel;
	loop: boolean;
	trimBefore: number | undefined;
	trimAfter: number | undefined;
	sequenceOffset: number;
	sequenceDurationInFrames: number;
	fps: number;
	getAudioContextCurrentTimeMockedInTest: () => number;
};

export type AudioIteratorAnchor = {
	// The unlooped time in seconds at which the current iterator was started
	unloopedStartInSeconds: number;
	// The media timestamp emitted by the current iterator at that unlooped time
	mediaStartInSeconds: number;
};

type GetPitchShiftProcessingLatencyOptions = {
	useWorklet: boolean;
	sampleRate: number;
};

export const getPitchShiftProcessingLatency = ({
	useWorklet,
	sampleRate,
}: GetPitchShiftProcessingLatencyOptions): number => {
	return useWorklet ? Internals.getWsolaLatencyInSeconds(sampleRate) : 0;
};

// Convert an unlooped composition time into the iterator's continuous media
// timeline using the anchor established when the iterator was started. The
// looping iterator emits timestamps that continue monotonically across loop
// iterations, so both the scheduler (getTargetTime) and the seek dedup must
// map times into this same frame via the identical formula.
type AnchorToContinuousTimeOptions = {
	anchor: AudioIteratorAnchor;
	unloopedTimeInSeconds: number;
	playbackRate: number;
};

export const anchorToContinuousTime = ({
	anchor,
	unloopedTimeInSeconds,
	playbackRate,
}: AnchorToContinuousTimeOptions): number => {
	return (
		anchor.mediaStartInSeconds +
		(unloopedTimeInSeconds - anchor.unloopedStartInSeconds) * playbackRate
	);
};

type AudioIteratorManagerOptions = {
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
	initialPreservePitch: boolean;
	initialToneFrequency: number;
};

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
	initialPreservePitch,
	initialToneFrequency,
}: AudioIteratorManagerOptions) => {
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

	// The pitch shifter (WSOLA) applies a pure, duration-preserving pitch shift
	// by `P` on top of the native `playbackRate` tempo change. When `P === 1`
	// the worklet is bypassed entirely (chunks connect straight to `gainNode`),
	// so behavior is byte-identical to before this feature existed.
	let currentPitchRatio = Internals.computePitchRatio({
		preservePitch: initialPreservePitch,
		toneFrequency: initialToneFrequency,
		combinedPlaybackRate: initialPlaybackRate,
	});
	let useWorklet = currentPitchRatio !== 1;
	// Persists across seeks, like `gainNode`. Created lazily the first time a
	// pitch shift is actually needed.
	const pitchShifterNodes = new Map<number, AudioWorkletNode>();

	const getPitchShifterNode = (channels: number): AudioWorkletNode => {
		const existing = pitchShifterNodes.get(channels);
		if (existing) {
			return existing;
		}

		const node = new AudioWorkletNode(
			sharedAudioContext.audioContext,
			'remotion-pitch-shifter',
			{
				numberOfInputs: 1,
				numberOfOutputs: 1,
				outputChannelCount: [channels],
				channelCount: channels,
				channelCountMode: 'explicit',
				channelInterpretation: 'speakers',
				processorOptions: {pitchRatio: currentPitchRatio},
			},
		);
		node.connect(gainNode);
		pitchShifterNodes.set(channels, node);

		return node;
	};

	const setPitchParams = ({
		preservePitch,
		toneFrequency,
		combinedPlaybackRate,
	}: SetPitchParamsOptions) => {
		currentPitchRatio = Internals.computePitchRatio({
			preservePitch,
			toneFrequency,
			combinedPlaybackRate,
		});
		useWorklet = currentPitchRatio !== 1;
		for (const node of pitchShifterNodes.values()) {
			node.port.postMessage({
				type: 'pitchRatio',
				value: currentPitchRatio,
			});
		}
	};

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
		sourceOffsetInSeconds,
		sourceDurationInSeconds,
		playbackRate,
		scheduleAudioNode,
		logLevel,
	}: ScheduleAudioChunkOptions) => {
		if (!audioBufferIterator) {
			throw new Error('Audio buffer iterator not found');
		}

		if (muted) {
			return;
		}

		const node = sharedAudioContext.audioContext.createBufferSource();
		node.buffer = buffer;
		node.playbackRate.value = playbackRate;
		node.connect(
			useWorklet ? getPitchShifterNode(buffer.numberOfChannels) : gainNode,
		);

		const started = scheduleAudioNode({
			node,
			mediaTimestamp,
			originalUnloopedMediaTimestamp,
			sourceOffsetInSeconds,
			sourceDurationInSeconds,
			processingLatencyInSeconds: getPitchShiftProcessingLatency({
				useWorklet,
				sampleRate: sharedAudioContext.audioContext.sampleRate,
			}),
		});

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
			sourceDurationInSeconds,
			scheduledTime: started.scheduledTime,
			playbackRate,
			scheduledAtAnchor: sharedAudioContext.audioSyncAnchor.value,
		});
	};

	const onAudioChunk = ({
		buffer,
		playbackRate,
		scheduleAudioNode,
		logLevel,
	}: OnAudioChunkOptions) => {
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

		scheduleAudioChunk({
			buffer: buffer.buffer.buffer,
			mediaTimestamp: buffer.timelineTimestamp,
			playbackRate,
			scheduleAudioNode,
			logLevel,
			originalUnloopedMediaTimestamp: buffer.buffer.timestamp,
			sourceOffsetInSeconds: buffer.sourceOffsetInSeconds,
			sourceDurationInSeconds: buffer.sourceDurationInSeconds,
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
	}: ProceedSchedulingOptions) => {
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

				onScheduled(result.value.timelineTimestamp);
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
		unloopedStartFromSecond,
		scheduleAudioNode,
		getTargetTime,
		logLevel,
		loop,
		unscheduleAudioNode,
		getAudioContextCurrentTimeMockedInTest,
	}: StartAudioIteratorOptions) => {
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

		currentAnchor = {
			unloopedStartInSeconds: unloopedStartFromSecond,
			mediaStartInSeconds: startFromSecond,
		};

		const maximumContinuousTimestamp =
			startFromSecond + getSequenceDurationInSeconds() * playbackRate;
		const source = loop
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
		const iterator = makeAudioIterator({
			startFromSecond,
			iterator: source,
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
	}: SeekOptions) => {
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
			// When looping, queued nodes carry continuous timestamps that don't
			// wrap at loop boundaries. Map the new time into that continuous
			// frame so it can be compared against the queued period.
			const timeToCheck =
				loop && currentAnchor
					? anchorToContinuousTime({
							anchor: currentAnchor,
							unloopedTimeInSeconds: unloopedNewTime,
							playbackRate: localPlaybackRate,
						})
					: newTime;
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
				timeToCheck,
				queuedPeriodMinusLatency,
			);
			if (currentTimeIsAlreadyQueued) {
				processNext();
				// current time is scheduled, will keep scheduling
				return;
			}

			const currentIteratorTimestamp = audioBufferIterator.guessNextTimestamp();
			if (
				currentIteratorTimestamp < timeToCheck &&
				Math.abs(currentIteratorTimestamp - timeToCheck) < 1
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
		getAudioBufferIterator: () => audioBufferIterator,
		getCurrentAnchor: () => currentAnchor,
		destroyIterator: () => {
			audioBufferIterator?.destroy();
			audioBufferIterator = null;
			// Drop the anchor together with the iterator it described, so
			// getCurrentAnchor() cannot hand out a stale mapping (from a previous
			// rate/trim) during the window before a new iterator is started.
			currentAnchor = null;
			unblockCurrentDelayHandle();
			// Flush the ~60 ms of stale audio the worklet is holding so it does not
			// bleed across the seek / rebuild.
			for (const node of pitchShifterNodes.values()) {
				node.port.postMessage({type: 'reset'});
			}
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
		setPitchParams,
	};
};

export type AudioIteratorManager = ReturnType<typeof audioIteratorManager>;
