import type {AudioSample, AudioTrack} from '@remotion/media-parser';
import {decoderWaitForDequeue} from './wait-for-dequeue';

export const createAudioDecoder = async ({
	track,
	onFrame,
	onError,
}: {
	track: AudioTrack;
	onFrame: (frame: AudioData) => Promise<void>;
	onError: (error: DOMException) => void;
}) => {
	if (typeof AudioDecoder === 'undefined') {
		return null;
	}

	const {supported, config} = await AudioDecoder.isConfigSupported(track);

	if (!supported) {
		return null;
	}

	const audioDecoder = new AudioDecoder({
		output(inputFrame) {
			onFrame(inputFrame);
		},
		error(error) {
			onError(error);
		},
	});

	audioDecoder.configure(config);

	const processSample = async (audioSample: AudioSample) => {
		if (audioDecoder.state === 'closed') {
			return;
		}

		await decoderWaitForDequeue(audioDecoder);

		if (audioSample.type === 'key') {
			await audioDecoder.flush();
		}

		const chunk = new EncodedAudioChunk(audioSample);
		audioDecoder.decode(chunk);
	};

	let queue = Promise.resolve();

	return {
		processSample: (sample: AudioSample) => {
			queue = queue.then(() => processSample(sample));
			return queue;
		},
	};
};
