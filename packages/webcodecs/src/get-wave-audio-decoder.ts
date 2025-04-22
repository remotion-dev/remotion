import type {AudioOrVideoSample} from '@remotion/media-parser';
import type {
	CreateAudioDecoderInit,
	WebCodecsAudioDecoder,
} from './audio-decoder';

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

// TODO: Should also be subject to throttling
export const getWaveAudioDecoder = ({
	onFrame,
	track,
	sampleFormat,
}: Pick<CreateAudioDecoderInit, 'onFrame' | 'track'> & {
	sampleFormat: AudioSampleFormat;
}): WebCodecsAudioDecoder => {
	let queue = Promise.resolve();

	const processSample = async (audioSample: AudioOrVideoSample) => {
		const bytesPerSample = getBytesPerSample(sampleFormat);
		await onFrame(
			new AudioData({
				data: audioSample.data,
				format: sampleFormat,
				numberOfChannels: track.numberOfChannels,
				numberOfFrames:
					audioSample.data.byteLength / bytesPerSample / track.numberOfChannels,
				sampleRate: track.sampleRate,
				timestamp: audioSample.timestamp,
			}),
		);
	};

	return {
		close() {
			return Promise.resolve();
		},
		processSample(audioSample) {
			queue = queue.then(() => processSample(audioSample));
			return queue;
		},
		flush: () => Promise.resolve(),
		waitForFinish: () => Promise.resolve(),
	};
};
