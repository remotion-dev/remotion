// A "passthrough" audio encoder, AudioData is already in WAV
import type {AudioEncoderInit, WebCodecsAudioEncoder} from './audio-encoder';
import {convertAudioData} from './convert-audiodata';

export const getWaveAudioEncoder = ({
	onChunk,
	controller,
	config,
}: Pick<
	AudioEncoderInit,
	'onChunk' | 'controller' | 'config'
>): WebCodecsAudioEncoder => {
	return {
		close: () => {
			return Promise.resolve();
		},
		encodeFrame: (unconvertedAudioData) => {
			if (controller._internals.signal.aborted) {
				return Promise.resolve();
			}

			const audioData = convertAudioData({
				audioData: unconvertedAudioData,
				newSampleRate: config.sampleRate,
				format: 's16',
			});
			unconvertedAudioData.close();

			const chunk: EncodedAudioChunk = {
				timestamp: audioData.timestamp,
				duration: audioData.duration,
				type: 'key',
				copyTo: (destination) => audioData.copyTo(destination, {planeIndex: 0}),
				byteLength: audioData.allocationSize({planeIndex: 0}),
			};

			return onChunk(chunk);
		},
		flush: () => Promise.resolve(),
		waitForFinish: () => Promise.resolve(),
	};
};
