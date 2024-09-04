import {encoderWaitForDequeue, encoderWaitForFinish} from './wait-for-dequeue';

export const createAudioEncoder = async ({
	onChunk,
	sampleRate,
	numberOfChannels,
}: {
	onChunk: (chunk: EncodedAudioChunk) => Promise<void>;
	sampleRate: number;
	numberOfChannels: number;
}) => {
	if (typeof AudioEncoder === 'undefined') {
		return null;
	}

	let prom = Promise.resolve();

	const encoder = new AudioEncoder({
		output: (chunk) => {
			prom = prom.then(() => onChunk(chunk));
		},
		error(error) {
			console.error(error);
		},
	});

	const audioEncoderConfig: AudioEncoderConfig = {
		codec: 'opus',
		numberOfChannels,
		sampleRate,
		bitrate: 128000,
	};

	const config = await AudioEncoder.isConfigSupported(audioEncoderConfig);

	if (!config.supported) {
		return null;
	}

	encoder.configure(audioEncoderConfig);

	const encodeFrame = async (audioData: AudioData) => {
		await encoderWaitForDequeue(encoder);
		if (encoder.state === 'closed') {
			return;
		}

		encoder.encode(audioData);
	};

	let queue = Promise.resolve();

	return {
		encodeFrame: (audioData: AudioData) => {
			queue = queue.then(() => encodeFrame(audioData));
			return queue;
		},
		waitForFinish: async () => {
			await encoderWaitForFinish(encoder);
			await prom;
		},
		close: () => {
			encoder.close();
		},
	};
};
