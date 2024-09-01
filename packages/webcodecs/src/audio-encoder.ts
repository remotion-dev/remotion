import {encoderWaitForDequeue} from './wait-for-dequeue';

export const createAudioEncoder = async ({
	onChunk,
	sampleRate,
	numberOfChannels,
}: {
	onChunk: (chunk: EncodedAudioChunk) => void;
	sampleRate: number;
	numberOfChannels: number;
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
		console.log({
			audioData: audioData.timestamp,
			t: audioData.timestamp,
			d: audioData.numberOfFrames,
			s: audioData.numberOfChannels,
			a: audioData.sampleRate,
			f: audioData.format,
		});
		await encoderWaitForDequeue(encoder);
		if (encoder.state === 'closed') {
			return;
		}

		console.log(audioData.duration, audioData.timestamp);
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
