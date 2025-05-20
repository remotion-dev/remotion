import type {
	MediaParserAudioSample,
	MediaParserLogLevel,
} from '@remotion/media-parser';
import type {
	CreateAudioDecoderInit,
	WebCodecsAudioDecoder,
} from './audio-decoder';
import type {IoSynchronizer} from './io-manager/io-synchronizer';

const getBytesPerSample = (sampleFormat: AudioSampleFormat) => {
	if (sampleFormat === 's16') {
		return 2;
	}

	if (sampleFormat === 's32') {
		return 4;
	}

	if (sampleFormat === 'f32') {
		return 4;
	}

	if (sampleFormat === 'u8') {
		return 1;
	}

	if (sampleFormat === 'f32-planar') {
		return 4;
	}

	if (sampleFormat === 's16-planar') {
		return 2;
	}

	if (sampleFormat === 's32-planar') {
		return 4;
	}

	if (sampleFormat === 'u8-planar') {
		return 1;
	}

	throw new Error(`Unsupported sample format: ${sampleFormat satisfies never}`);
};

export const getWaveAudioDecoder = ({
	onFrame,
	config,
	sampleFormat,
	ioSynchronizer,
	onError,
}: Pick<CreateAudioDecoderInit, 'onFrame' | 'config'> & {
	sampleFormat: AudioSampleFormat;
	logLevel: MediaParserLogLevel;
	ioSynchronizer: IoSynchronizer;
	onError: (error: Error) => void;
}): WebCodecsAudioDecoder => {
	const processSample = async (audioSample: MediaParserAudioSample) => {
		const bytesPerSample = getBytesPerSample(sampleFormat);

		const audioData = new AudioData({
			data: audioSample.data,
			format: sampleFormat,
			numberOfChannels: config.numberOfChannels,
			numberOfFrames:
				audioSample.data.byteLength / bytesPerSample / config.numberOfChannels,
			sampleRate: config.sampleRate,
			timestamp: audioSample.timestamp,
		});

		try {
			await onFrame(audioData);
		} catch (err) {
			audioData.close();
			onError(err as Error);
		}
	};

	return {
		close() {
			return Promise.resolve();
		},
		decode(audioSample) {
			processSample(audioSample);
		},
		flush: () => Promise.resolve(),
		waitForFinish: () => Promise.resolve(),
		ioSynchronizer,
	};
};
