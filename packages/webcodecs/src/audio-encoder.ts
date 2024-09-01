import {encoderWaitForDequeue} from './wait-for-dequeue';

export const createAudioEncoder = async ({
	onChunk,
}: {
	onChunk: (chunk: EncodedAudioChunk) => void;
}) => {
	if (typeof AudioEncoder === 'undefined') {
		return null;
	}

	const encoder = new AudioEncoder({
		output: (chunk) => {
			onChunk(chunk);
		},
		error(error) {
			console.error(error);
		},
	});

	const audioEncoderConfig: AudioEncoderConfig = {
		codec: 'opus',
		// TODO: Hardcoded
		numberOfChannels: 2,
		// TODO: Hardcoded and fails if wrong
		sampleRate: 48000,
		bitrate: 128000,
	};

	const config = await AudioEncoder.isConfigSupported(audioEncoderConfig);

	if (!config.supported) {
		return null;
	}

	encoder.configure(audioEncoderConfig);

	const encodeFrame = async (audioData: AudioData) => {
		await encoderWaitForDequeue(encoder);

		encoder.encode(audioData);
	};

	let queue = Promise.resolve();

	return {
		encodeFrame: (audioData: AudioData) => {
			queue = queue.then(() => encodeFrame(audioData));
			return queue;
		},
	};
};
