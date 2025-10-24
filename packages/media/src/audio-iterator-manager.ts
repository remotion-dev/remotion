import type {InputAudioTrack, WrappedAudioBuffer} from 'mediabunny';
import {AudioBufferSink} from 'mediabunny';
import type {useBufferState} from 'remotion';
import type {AudioIterator} from './audio/audio-preview-iterator';
import {
	isAlreadyQueued,
	makeAudioIterator,
} from './audio/audio-preview-iterator';
import type {Nonce} from './nonce-manager';

export const audioIteratorManager = ({
	audioTrack,
	bufferState,
	sharedAudioContext,
}: {
	audioTrack: InputAudioTrack;
	bufferState: ReturnType<typeof useBufferState>;
	sharedAudioContext: AudioContext;
}) => {
	let muted = false;
	let currentVolume = 1;

	let audioChunksForAfterResuming: {
		buffer: AudioBuffer;
		timestamp: number;
	}[] = [];
	const gainNode = sharedAudioContext.createGain();
	gainNode.connect(sharedAudioContext.destination);

	const audioSink = new AudioBufferSink(audioTrack);
	let audioBufferIterator: AudioIterator | null = null;
	let audioIteratorsCreated = 0;

	const startAudioIterator = async (startFromSecond: number, nonce: Nonce) => {
		audioBufferIterator?.destroy();
		audioChunksForAfterResuming = [];
		const delayHandle = bufferState.delayPlayback();

		const iterator = makeAudioIterator(audioSink, startFromSecond);
		audioIteratorsCreated++;
		audioBufferIterator = iterator;

		// Schedule up to 3 buffers ahead of the current time
		for (let i = 0; i < 3; i++) {
			const result = await iterator.getNext();

			if (iterator.isDestroyed()) {
				delayHandle.unblock();
				return;
			}

			if (nonce.isStale()) {
				delayHandle.unblock();
				return;
			}

			if (!result.value) {
				// media ended
				delayHandle.unblock();
				return;
			}

			const {buffer, timestamp} = result.value;

			audioChunksForAfterResuming.push({
				buffer,
				timestamp,
			});
		}

		delayHandle.unblock();
	};

	const scheduleAudioChunk = ({
		buffer,
		mediaTimestamp,
		trimBefore,
		fps,
		playbackRate,
		audioSyncAnchor,
	}: {
		buffer: AudioBuffer;
		mediaTimestamp: number;
		trimBefore: number | undefined;
		fps: number;
		playbackRate: number;
		audioSyncAnchor: number;
	}) => {
		// TODO: Might already be scheduled, and then the playback rate changes
		// TODO: Playbackrate does not yet work
		const targetTime =
			(mediaTimestamp - (trimBefore ?? 0) / fps) / playbackRate;
		const delay = targetTime + audioSyncAnchor - sharedAudioContext.currentTime;

		const node = sharedAudioContext.createBufferSource();
		node.buffer = buffer;
		node.playbackRate.value = playbackRate;
		node.connect(gainNode);

		if (delay >= 0) {
			node.start(targetTime + audioSyncAnchor);
		} else {
			node.start(sharedAudioContext.currentTime, -delay);
		}

		if (!audioBufferIterator) {
			throw new Error('Audio buffer iterator not found');
		}

		audioBufferIterator.addQueuedAudioNode(node, mediaTimestamp, buffer);
		node.onended = () => {
			if (!audioBufferIterator) {
				return;
			}

			return audioBufferIterator.removeQueuedAudioNode(node);
		};
	};

	const pausePlayback = () => {
		if (!audioBufferIterator) {
			return;
		}

		const toQueue = audioBufferIterator.removeAndReturnAllQueuedAudioNodes();
		for (const chunk of toQueue) {
			audioChunksForAfterResuming.push({
				buffer: chunk.buffer,
				timestamp: chunk.timestamp,
			});
		}
	};

	const seek = async ({
		newTime,
		nonce,
		fps,
		playbackRate,
		audioSyncAnchor,
		trimBefore,
		getIsPlaying,
	}: {
		newTime: number;
		nonce: Nonce;
		fps: number;
		playbackRate: number;
		audioSyncAnchor: number;
		trimBefore: number | undefined;
		getIsPlaying: () => boolean;
	}) => {
		if (!audioBufferIterator) {
			await startAudioIterator(newTime, nonce);
			return;
		}

		// TODO: This should account for audio chunks after resuming
		const queuedPeriod = audioBufferIterator.getQueuedPeriod();

		const currentTimeIsAlreadyQueued = isAlreadyQueued(newTime, queuedPeriod);
		const toBeScheduled: WrappedAudioBuffer[] = [];

		if (!currentTimeIsAlreadyQueued) {
			const audioSatisfyResult =
				await audioBufferIterator.tryToSatisfySeek(newTime);

			if (nonce.isStale()) {
				return;
			}

			if (audioSatisfyResult.type === 'not-satisfied') {
				await startAudioIterator(newTime, nonce);
				return;
			}

			toBeScheduled.push(...audioSatisfyResult.buffers);
		}

		// TODO: What is this is beyond the end of the video
		const nextTime =
			newTime +
			// start of next frame
			(1 / fps) * playbackRate +
			// need the full duration of the next frame to be queued
			(1 / fps) * playbackRate;
		const nextIsAlreadyQueued = isAlreadyQueued(nextTime, queuedPeriod);
		if (!nextIsAlreadyQueued) {
			const audioSatisfyResult =
				await audioBufferIterator.tryToSatisfySeek(nextTime);

			if (nonce.isStale()) {
				return;
			}

			if (!audioSatisfyResult) {
				return;
			}

			if (audioSatisfyResult.type === 'not-satisfied') {
				await startAudioIterator(nextTime, nonce);

				return;
			}

			toBeScheduled.push(...audioSatisfyResult.buffers);
		}

		for (const buffer of toBeScheduled) {
			if (getIsPlaying()) {
				scheduleAudioChunk({
					buffer: buffer.buffer,
					mediaTimestamp: buffer.timestamp,
					trimBefore,
					fps,
					playbackRate,
					audioSyncAnchor,
				});
			} else {
				audioChunksForAfterResuming.push({
					buffer: buffer.buffer,
					timestamp: buffer.timestamp,
				});
			}
		}
	};

	const resumePlayback = ({
		audioSyncAnchor,
		fps,
		playbackRate,
		trimBefore,
	}: {
		trimBefore: number | undefined;
		fps: number;
		playbackRate: number;
		audioSyncAnchor: number;
	}) => {
		for (const chunk of audioChunksForAfterResuming) {
			scheduleAudioChunk({
				buffer: chunk.buffer,
				mediaTimestamp: chunk.timestamp,
				trimBefore,
				fps,
				playbackRate,
				audioSyncAnchor,
			});
		}

		audioChunksForAfterResuming = [];
	};

	return {
		startAudioIterator,
		resumeScheduledAudioChunks: resumePlayback,
		pausePlayback,
		getAudioBufferIterator: () => audioBufferIterator,
		getNumberOfChunksAfterResuming: () => audioChunksForAfterResuming.length,
		destroy: () => {
			audioBufferIterator?.destroy();
			audioBufferIterator = null;
			audioChunksForAfterResuming = [];
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
