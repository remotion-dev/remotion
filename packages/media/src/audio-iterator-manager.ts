import type {InputAudioTrack, WrappedAudioBuffer} from 'mediabunny';
import {AudioBufferSink, InputDisposedError} from 'mediabunny';
import type {UseBufferState} from 'remotion';
import type {AudioIterator} from './audio/audio-preview-iterator';
import {
	isAlreadyQueued,
	makeAudioIterator,
} from './audio/audio-preview-iterator';
import type {DelayPlaybackIfNotPremounting} from './delay-playback-if-not-premounting';
import type {Nonce} from './nonce-manager';
import {makePrewarmedAudioIteratorCache} from './prewarm-iterator-for-looping';

export const audioIteratorManager = ({
	audioTrack,
	delayPlaybackHandleIfNotPremounting,
	sharedAudioContext,
	getIsLooping,
	getEndTime,
	getStartTime,
	updatePlaybackTime,
}: {
	audioTrack: InputAudioTrack;
	delayPlaybackHandleIfNotPremounting: () => DelayPlaybackIfNotPremounting;
	sharedAudioContext: AudioContext;
	getIsLooping: () => boolean;
	getEndTime: () => number;
	getStartTime: () => number;
	updatePlaybackTime: (time: number) => void;
}) => {
	let muted = false;
	let currentVolume = 1;

	const gainNode = sharedAudioContext.createGain();
	gainNode.connect(sharedAudioContext.destination);

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
	}: {
		buffer: AudioBuffer;
		mediaTimestamp: number;
		playbackRate: number;
		scheduleAudioNode: (
			node: AudioBufferSourceNode,
			mediaTimestamp: number,
		) => void;
	}) => {
		if (!audioBufferIterator) {
			throw new Error('Audio buffer iterator not found');
		}

		const node = sharedAudioContext.createBufferSource();
		node.buffer = buffer;
		node.playbackRate.value = playbackRate;
		node.connect(gainNode);

		scheduleAudioNode(node, mediaTimestamp);

		const iterator = audioBufferIterator;

		iterator.addQueuedAudioNode(node, mediaTimestamp, buffer);
		node.onended = () => {
			// Some leniancy is needed as we find that sometimes onended is fired a bit too early
			setTimeout(() => {
				iterator.removeQueuedAudioNode(node);
			}, 30);
		};
	};

	const onAudioChunk = ({
		getIsPlaying,
		buffer,
		playbackRate,
		scheduleAudioNode,
	}: {
		getIsPlaying: () => boolean;
		buffer: WrappedAudioBuffer;
		playbackRate: number;
		scheduleAudioNode: (
			node: AudioBufferSourceNode,
			mediaTimestamp: number,
		) => void;
	}) => {
		if (getIsPlaying()) {
			scheduleAudioChunk({
				buffer: buffer.buffer,
				mediaTimestamp: buffer.timestamp,
				playbackRate,
				scheduleAudioNode,
			});
		} else {
			if (!audioBufferIterator) {
				throw new Error('Audio buffer iterator not found');
			}

			audioBufferIterator.addChunkForAfterResuming(
				buffer.buffer,
				buffer.timestamp,
			);
		}
	};

	const startAudioIterator = async ({
		nonce,
		playbackRate,
		startFromSecond,
		getIsPlaying,
		scheduleAudioNode,
	}: {
		startFromSecond: number;
		nonce: Nonce;
		playbackRate: number;
		getIsPlaying: () => boolean;
		scheduleAudioNode: (
			node: AudioBufferSourceNode,
			mediaTimestamp: number,
		) => void;
	}) => {
		updatePlaybackTime(startFromSecond);
		audioBufferIterator?.destroy();
		using delayHandle = delayPlaybackHandleIfNotPremounting();
		currentDelayHandle = delayHandle;

		const iterator = makeAudioIterator(
			startFromSecond,
			prewarmedAudioIteratorCache,
		);
		audioIteratorsCreated++;
		audioBufferIterator = iterator;

		try {
			// Schedule up to 3 buffers ahead of the current time
			for (let i = 0; i < 3; i++) {
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
				});
			}
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
		fps,
		playbackRate,
		getIsPlaying,
		scheduleAudioNode,
		bufferState,
	}: {
		newTime: number;
		nonce: Nonce;
		fps: number;
		playbackRate: number;
		getIsPlaying: () => boolean;
		bufferState: UseBufferState;
		scheduleAudioNode: (
			node: AudioBufferSourceNode,
			mediaTimestamp: number,
		) => void;
	}) => {
		if (getIsLooping()) {
			// If less than 1 second from the end away, we pre-warm a new iterator
			if (getEndTime() - newTime < 1) {
				prewarmedAudioIteratorCache.prewarmIteratorForLooping({
					timeToSeek: getStartTime(),
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
			});
			return;
		}

		const queuedPeriod = audioBufferIterator.getQueuedPeriod();

		const currentTimeIsAlreadyQueued = isAlreadyQueued(newTime, queuedPeriod);

		if (!currentTimeIsAlreadyQueued) {
			const audioSatisfyResult = await audioBufferIterator.tryToSatisfySeek(
				newTime,
				null,
				(buffer) => {
					if (!nonce.isStale()) {
						onAudioChunk({
							getIsPlaying,
							buffer,
							playbackRate,
							scheduleAudioNode,
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
				});
				return;
			}
		}

		const nextTime =
			newTime +
			// 3 frames ahead to get enough of a buffer
			(1 / fps) * Math.max(1, playbackRate) * 3;

		const nextIsAlreadyQueued = isAlreadyQueued(
			nextTime,
			audioBufferIterator.getQueuedPeriod(),
		);

		if (!nextIsAlreadyQueued) {
			// here we allow waiting for the next buffer to be loaded
			// it's better than to create a new iterator
			// because we already know we are in the right spot
			const audioSatisfyResult = await audioBufferIterator.tryToSatisfySeek(
				nextTime,
				{
					type: 'allow-wait',
					waitCallback: () => {
						const handle = bufferState.delayPlayback();
						return () => {
							handle.unblock();
						};
					},
				},
				(buffer) => {
					if (!nonce.isStale()) {
						onAudioChunk({
							getIsPlaying,
							buffer,
							playbackRate,
							scheduleAudioNode,
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
				});
			}
		}
	};

	const resumeScheduledAudioChunks = ({
		playbackRate,
		scheduleAudioNode,
	}: {
		playbackRate: number;
		scheduleAudioNode: (
			node: AudioBufferSourceNode,
			mediaTimestamp: number,
		) => void;
	}) => {
		if (!audioBufferIterator) {
			return;
		}

		for (const chunk of audioBufferIterator.getAndClearAudioChunksForAfterResuming()) {
			scheduleAudioChunk({
				buffer: chunk.buffer,
				mediaTimestamp: chunk.timestamp,
				playbackRate,
				scheduleAudioNode,
			});
		}
	};

	return {
		startAudioIterator,
		resumeScheduledAudioChunks,
		pausePlayback,
		getAudioBufferIterator: () => audioBufferIterator,
		destroyIterator: () => {
			prewarmedAudioIteratorCache.destroy();
			audioBufferIterator?.destroy();
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
