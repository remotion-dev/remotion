// A "passthrough" audio encoder, AudioData is already in WAV
import type {AudioEncoderInit, WebCodecsAudioEncoder} from './audio-encoder';

export const getWaveAudioEncoder = ({
	onChunk,
	signal,
}: Pick<AudioEncoderInit, 'onChunk' | 'signal'>): WebCodecsAudioEncoder => {
	return {
		close: () => {
			return Promise.resolve();
		},
		encodeFrame: (audioData) => {
			if (signal.aborted) {
				return Promise.resolve();
			}

			const chunk: EncodedAudioChunk = {
				timestamp: audioData.timestamp,
				duration: audioData.duration,
				type: 'key',
				copyTo: (destination) =>
					audioData.copyTo(destination, {planeIndex: 0, format: 's16'}),
				byteLength: audioData.allocationSize({planeIndex: 0, format: 's16'}),
			};

			return onChunk(chunk);
		},
		flush: () => Promise.resolve(),
		waitForFinish: () => Promise.resolve(),
	};
};
