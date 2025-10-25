import type {InputAudioTrack, WrappedAudioBuffer} from 'mediabunny';
import {AudioBufferSink} from 'mediabunny';
import type {AudioIterator} from './audio/audio-preview-iterator';
import {
	isAlreadyQueued,
	makeAudioIterator,
} from './audio/audio-preview-iterator';
import type {Nonce} from './nonce-manager';

export const audioIteratorManager = ({
	audioTrack,
	delayPlaybackHandleIfNotPremounting,
	sharedAudioContext,
}: {
	audioTrack: InputAudioTrack;
	delayPlaybackHandleIfNotPremounting: () => {unblock: () => void};
	sharedAudioContext: AudioContext;
}) => {
	let muted = false;
	let currentVolume = 1;

	const gainNode = sharedAudioContext.createGain();
	gainNode.connect(sharedAudioContext.destination);

	const audioSink = new AudioBufferSink(audioTrack);
	let audioBufferIterator: AudioIterator | null = null;
	let audioIteratorsCreated = 0;

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
		audioBufferIterator?.destroy();
		const delayHandle = delayPlaybackHandleIfNotPremounting();

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

			onAudioChunk({
				getIsPlaying,
				buffer: result.value,
				playbackRate,
				scheduleAudioNode,
			});
		}

		delayHandle.unblock();
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
	}: {
		newTime: number;
		nonce: Nonce;
		fps: number;
		playbackRate: number;
		getIsPlaying: () => boolean;
		scheduleAudioNode: (
			node: AudioBufferSourceNode,
			mediaTimestamp: number,
		) => void;
	}) => {
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

		const currentTimeIsAlreadyQueued = isAlreadyQueued(
			newTime,
			audioBufferIterator.getQueuedPeriod([]),
		);
		const toBeScheduled: WrappedAudioBuffer[] = [];

		if (!currentTimeIsAlreadyQueued) {
			const audioSatisfyResult = await audioBufferIterator.tryToSatisfySeek(
				newTime,
				false,
			);

			if (nonce.isStale()) {
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

			toBeScheduled.push(...audioSatisfyResult.buffers);
		}

		const nextTime =
			newTime +
			// start of next frame
			(1 / fps) * playbackRate +
			// need the full duration of the next frame to be queued
			(1 / fps) * playbackRate;

		const nextIsAlreadyQueued = isAlreadyQueued(
			nextTime,
			audioBufferIterator.getQueuedPeriod(toBeScheduled),
		);

		if (!nextIsAlreadyQueued) {
			// here we allow waiting for the next buffer to be loaded
			// it's better than to create a new iterator
			// because we already know we are in the right spot
			const audioSatisfyResult = await audioBufferIterator.tryToSatisfySeek(
				nextTime,
				true,
			);

			if (nonce.isStale()) {
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

			toBeScheduled.push(...audioSatisfyResult.buffers);
		}

		for (const buffer of toBeScheduled) {
			onAudioChunk({
				getIsPlaying,
				buffer,
				playbackRate,
				scheduleAudioNode,
			});
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
		destroy: () => {
			audioBufferIterator?.destroy();
			audioBufferIterator = null;
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
