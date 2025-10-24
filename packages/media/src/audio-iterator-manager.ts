import type {InputAudioTrack} from 'mediabunny';
import {AudioBufferSink} from 'mediabunny';
import type {useBufferState} from 'remotion';
import type {AudioIterator} from './audio/audio-preview-iterator';
import {makeAudioIterator} from './audio/audio-preview-iterator';

export const audioIteratorManager = (
	audioTrack: InputAudioTrack,
	bufferState: ReturnType<typeof useBufferState>,
) => {
	let audioChunksForAfterResuming: {
		buffer: AudioBuffer;
		timestamp: number;
	}[] = [];

	const audioSink = new AudioBufferSink(audioTrack);
	let audioBufferIterator: AudioIterator | null = null;
	let audioIteratorsCreated = 0;

	const startAudioIterator = async (
		startFromSecond: number,
		nonce: number,
		getSeekNonce: () => number,
	) => {
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

			if (nonce !== getSeekNonce()) {
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

	return {
		startAudioIterator,
		getAudioChunksForAfterResuming: () => audioChunksForAfterResuming,
		getAudioBufferIterator: () => audioBufferIterator,
		destroy: () => {
			audioBufferIterator?.destroy();
			audioBufferIterator = null;
			audioChunksForAfterResuming.length = 0;
		},
		getAudioIteratorsCreated: () => audioIteratorsCreated,
	};
};

export type AudioIteratorManager = ReturnType<typeof audioIteratorManager>;
