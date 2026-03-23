import type {InputAudioTrack, WrappedAudioBuffer} from 'mediabunny';
import {AudioBufferSink, InputDisposedError} from 'mediabunny';
import {Internals, type ScheduleAudioNodeResult} from 'remotion';
import type {AudioIterator, QueuedPeriod} from './audio/audio-preview-iterator';
import {
	isAlreadyQueued,
	makeAudioIterator,
} from './audio/audio-preview-iterator';
import type {DelayPlaybackIfNotPremounting} from './delay-playback-if-not-premounting';
import type {Nonce} from './nonce-manager';
import {makePrewarmedAudioIteratorCache} from './prewarm-iterator-for-looping';
import {ALLOWED_GLOBAL_TIME_ANCHOR_SHIFT} from './set-global-time-anchor';
import type {SharedAudioContextForMediaPlayer} from './shared-audio-context-for-media-player';

const MAX_BUFFER_AHEAD_SECONDS = 8;

type ScheduleAudioNode = (
	node: AudioBufferSourceNode,
	mediaTimestamp: number,
) => ScheduleAudioNodeResult;

export const audioIteratorManager = ({
	audioTrack,
	delayPlaybackHandleIfNotPremounting,
	sharedAudioContext,
	getIsLooping,
	getEndTime,
	getStartTime,
	initialMuted,
	drawDebugOverlay,
}: {
	audioTrack: InputAudioTrack;
	delayPlaybackHandleIfNotPremounting: () => DelayPlaybackIfNotPremounting;
	sharedAudioContext: SharedAudioContextForMediaPlayer;
	getIsLooping: () => boolean;
	getEndTime: () => number;
	getStartTime: () => number;
	initialMuted: boolean;
	drawDebugOverlay: () => void;
}) => {
	let muted = initialMuted;
	let currentVolume = 1;

	const gainNode = sharedAudioContext.audioContext.createGain();
	gainNode.connect(sharedAudioContext.audioContext.destination);

	const audioSink = new AudioBufferSink(audioTrack);
	const prewarmedAudioIteratorCache =
		makePrewarmedAudioIteratorCache(audioSink);
	let audioBufferIterator: AudioIterator | null = null;
	let audioIteratorsCreated = 0;
	let currentDelayHandle: {unblock: () => void} | null = null;

	const scheduleAudioChunk = ({
		buffer,
		mediaTimestamp,
		playbackRate,
		scheduleAudioNode,
		debugAudioScheduling,
	}: {
		buffer: AudioBuffer;
		mediaTimestamp: number;
		playbackRate: number;
		scheduleAudioNode: ScheduleAudioNode;
		debugAudioScheduling: boolean;
	}) => {
		if (!audioBufferIterator) {
			throw new Error('Audio buffer iterator not found');
		}

		if (sharedAudioContext.audioContext.state !== 'running') {
			throw new Error(
				'Tried to schedule node while audio context is not running',
			);
		}

		if (muted) {
			return;
		}

		const node = sharedAudioContext.audioContext.createBufferSource();
		node.buffer = buffer;
		node.playbackRate.value = playbackRate;
		node.connect(gainNode);

		const started = scheduleAudioNode(node, mediaTimestamp);

		if (started.type === 'not-started') {
			if (debugAudioScheduling) {
				Internals.Log.info(
					{logLevel: 'trace', tag: 'audio-scheduling'},
					'not started, disconnected: %s %s',
					mediaTimestamp.toFixed(3),
					buffer.duration.toFixed(3),
				);
			}

			node.disconnect();
			return;
		}

		const iterator = audioBufferIterator;

		iterator.addQueuedAudioNode({
			node,
			timestamp: mediaTimestamp,
			buffer,
			scheduledTime: started.scheduledTime,
			playbackRate,
			scheduledAtAnchor: sharedAudioContext.audioSyncAnchor.value,
		});
		node.onended = () => {
			// Some leniancy is needed as we find that sometimes onended is fired a bit too early
			setTimeout(() => {
				iterator.removeQueuedAudioNode(node);
			}, 30);
		};
	};

	const resumeScheduledAudioChunks = ({
		playbackRate,
		scheduleAudioNode,
		debugAudioScheduling,
	}: {
		playbackRate: number;
		scheduleAudioNode: ScheduleAudioNode;
		debugAudioScheduling: boolean;
	}) => {
		if (muted) {
			return;
		}

		if (!audioBufferIterator) {
			return;
		}

		for (const chunk of audioBufferIterator.getAndClearAudioChunksForAfterResuming()) {
			scheduleAudioChunk({
				buffer: chunk.buffer,
				mediaTimestamp: chunk.timestamp,
				playbackRate,
				scheduleAudioNode,
				debugAudioScheduling,
			});
		}
	};

	const onAudioChunk = ({
		getIsPlaying,
		buffer,
		playbackRate,
		scheduleAudioNode,
		debugAudioScheduling,
	}: {
		getIsPlaying: () => boolean;
		buffer: WrappedAudioBuffer;
		playbackRate: number;
		scheduleAudioNode: ScheduleAudioNode;
		debugAudioScheduling: boolean;
	}) => {
		if (muted) {
			return;
		}

		const startTime = getStartTime();
		const endTime = getEndTime();

		// Skip chunks entirely outside the range
		if (buffer.timestamp + buffer.duration <= startTime) {
			return;
		}

		if (buffer.timestamp >= endTime) {
			return;
		}

		if (
			getIsPlaying() &&
			sharedAudioContext.audioContext.state === 'running' &&
			(sharedAudioContext.audioContext.getOutputTimestamp().contextTime ?? 0) >
				0
		) {
			resumeScheduledAudioChunks({
				playbackRate,
				scheduleAudioNode,
				debugAudioScheduling,
			});

			scheduleAudioChunk({
				buffer: buffer.buffer,
				mediaTimestamp: buffer.timestamp,
				playbackRate,
				scheduleAudioNode,
				debugAudioScheduling,
			});
		} else {
			if (!audioBufferIterator) {
				throw new Error('Audio buffer iterator not found');
			}

			if (debugAudioScheduling) {
				Internals.Log.info(
					{logLevel: 'trace', tag: 'audio-scheduling'},
					'not ready, added to queue: %s %s',
					buffer.timestamp.toFixed(3),
					buffer.duration.toFixed(3),
				);
			}

			audioBufferIterator.addChunkForAfterResuming(
				buffer.buffer,
				buffer.timestamp,
			);
		}

		drawDebugOverlay();
	};

	const startAudioIterator = async ({
		nonce,
		playbackRate,
		startFromSecond,
		getIsPlaying,
		scheduleAudioNode,
		debugAudioScheduling,
	}: {
		startFromSecond: number;
		nonce: Nonce;
		playbackRate: number;
		getIsPlaying: () => boolean;
		scheduleAudioNode: ScheduleAudioNode;
		debugAudioScheduling: boolean;
	}) => {
		if (muted) {
			return;
		}

		audioBufferIterator?.destroy(sharedAudioContext);
		using delayHandle = delayPlaybackHandleIfNotPremounting();
		currentDelayHandle = delayHandle;

		const iterator = makeAudioIterator({
			startFromSecond,
			maximumTimestamp: getEndTime(),
			cache: prewarmedAudioIteratorCache,
			debugAudioScheduling,
		});
		audioIteratorsCreated++;
		audioBufferIterator = iterator;

		try {
			// Schedule at least 6 buffers ahead of the current time
			for (let i = 0; i < 6; i++) {
				const result = await iterator.getNext();

				if (iterator.isDestroyed()) {
					return;
				}

				if (nonce.isStale()) {
					return;
				}

				if (!result.value) {
					// media ended
					return;
				}

				onAudioChunk({
					getIsPlaying,
					buffer: result.value,
					playbackRate,
					scheduleAudioNode,
					debugAudioScheduling,
				});
			}

			await iterator.bufferAsFarAsPossible(
				(buffer) => {
					if (!nonce.isStale()) {
						onAudioChunk({
							getIsPlaying,
							buffer,
							playbackRate,
							scheduleAudioNode,
							debugAudioScheduling,
						});
					}
				},
				Math.min(startFromSecond + MAX_BUFFER_AHEAD_SECONDS, getEndTime()),
			);
		} catch (e) {
			if (e instanceof InputDisposedError) {
				// iterator was disposed by a newer startAudioIterator call
				// this is expected during rapid seeking
				return;
			}

			throw e;
		}
	};

	const pausePlayback = () => {
		if (!audioBufferIterator) {
			return;
		}

		audioBufferIterator.moveQueuedChunksToPauseQueue();
	};

	const seek = async ({
		newTime,
		nonce,
		playbackRate,
		getIsPlaying,
		scheduleAudioNode,
		debugAudioScheduling,
	}: {
		newTime: number;
		nonce: Nonce;
		playbackRate: number;
		getIsPlaying: () => boolean;
		scheduleAudioNode: ScheduleAudioNode;
		debugAudioScheduling: boolean;
	}) => {
		if (muted) {
			return;
		}

		if (getIsLooping()) {
			// If less than 1 second from the end away, we pre-warm a new iterator
			if (getEndTime() - newTime < 1) {
				prewarmedAudioIteratorCache.prewarmIteratorForLooping({
					timeToSeek: getStartTime(),
					maximumTimestamp: getEndTime(),
				});
			}
		}

		if (!audioBufferIterator) {
			await startAudioIterator({
				nonce,
				playbackRate,
				startFromSecond: newTime,
				getIsPlaying,
				scheduleAudioNode,
				debugAudioScheduling,
			});
			return;
		}

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

		if (!currentTimeIsAlreadyQueued) {
			const audioSatisfyResult = await audioBufferIterator.tryToSatisfySeek(
				newTime,
				(buffer) => {
					if (!nonce.isStale()) {
						onAudioChunk({
							getIsPlaying,
							buffer,
							playbackRate,
							scheduleAudioNode,
							debugAudioScheduling,
						});
					}
				},
			);

			if (nonce.isStale()) {
				return;
			}

			if (audioSatisfyResult.type === 'ended') {
				return;
			}

			if (audioSatisfyResult.type === 'not-satisfied') {
				await startAudioIterator({
					nonce,
					playbackRate,
					startFromSecond: newTime,
					getIsPlaying,
					scheduleAudioNode,
					debugAudioScheduling,
				});
				return;
			}

			if (audioSatisfyResult.type === 'satisfied') {
				// fall through
			}
		}

		await audioBufferIterator.bufferAsFarAsPossible(
			(buffer) => {
				if (!nonce.isStale()) {
					onAudioChunk({
						getIsPlaying,
						buffer,
						playbackRate,
						scheduleAudioNode,
						debugAudioScheduling,
					});
				}
			},
			Math.min(newTime + MAX_BUFFER_AHEAD_SECONDS, getEndTime()),
		);
	};

	return {
		startAudioIterator,
		resumeScheduledAudioChunks,
		pausePlayback,
		getAudioBufferIterator: () => audioBufferIterator,
		destroyIterator: () => {
			prewarmedAudioIteratorCache.destroy();
			audioBufferIterator?.destroy(sharedAudioContext);
			audioBufferIterator = null;

			if (currentDelayHandle) {
				currentDelayHandle.unblock();
				currentDelayHandle = null;
			}
		},
		seek,
		getAudioIteratorsCreated: () => audioIteratorsCreated,
		setMuted: (newMuted: boolean) => {
			muted = newMuted;
			gainNode.gain.value = muted ? 0 : currentVolume;
		},
		setVolume: (volume: number) => {
			currentVolume = Math.max(0, volume);
			gainNode.gain.value = muted ? 0 : currentVolume;
		},
		scheduleAudioChunk,
	};
};

export type AudioIteratorManager = ReturnType<typeof audioIteratorManager>;
