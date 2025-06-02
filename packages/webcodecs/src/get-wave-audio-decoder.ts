import type {MediaParserLogLevel} from '@remotion/media-parser';
import type {
	CreateAudioDecoderInit,
	WebCodecsAudioDecoder,
} from './create-audio-decoder';
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

const getAudioData = (
	audioSample: EncodedAudioChunkInit | EncodedAudioChunk,
) => {
	if (audioSample instanceof EncodedAudioChunk) {
		const data = new Uint8Array(audioSample.byteLength);
		audioSample.copyTo(data);
		return data;
	}

	return audioSample.data;
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
	const processSample = async (
		audioSample: EncodedAudioChunkInit | EncodedAudioChunk,
	) => {
		const bytesPerSample = getBytesPerSample(sampleFormat);
		const data = getAudioData(audioSample);

		const audioData = new AudioData({
			data,
			format: sampleFormat,
			numberOfChannels: config.numberOfChannels,
			numberOfFrames:
				data.byteLength / bytesPerSample / config.numberOfChannels,
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

	let lastReset: number | null = null;
	let mostRecentSampleInput: number | null = null;

	return {
		close() {
			return Promise.resolve();
		},
		decode(audioSample) {
			mostRecentSampleInput = audioSample.timestamp;
			return processSample(audioSample);
		},
		flush: () => Promise.resolve(),
		waitForQueueToBeLessThan: ioSynchronizer.waitForQueueSize,
		reset: () => {
			lastReset = Date.now();
		},
		checkReset: () => ({
			wasReset: () => lastReset !== null && lastReset > Date.now(),
		}),
		getMostRecentSampleInput: () => mostRecentSampleInput,
	};
};
