export type WebCodecsAudioEncoder = {
	encodeFrame: (audioData: AudioData) => Promise<void>;
	waitForFinish: () => Promise<void>;
	close: () => void;
	getQueueSize: () => number;
	flush: () => Promise<void>;
};

export const createAudioEncoder = async ({
	onChunk,
	sampleRate,
	numberOfChannels,
}: {
	onChunk: (chunk: EncodedAudioChunk) => Promise<void>;
	sampleRate: number;
	numberOfChannels: number;
}): Promise<WebCodecsAudioEncoder | null> => {
	if (typeof AudioEncoder === 'undefined') {
		return null;
	}

	let prom = Promise.resolve();
	let outputQueue = 0;
	let dequeueResolver = () => {};

	const encoder = new AudioEncoder({
		output: (chunk) => {
			outputQueue++;
			prom = prom
				.then(() => onChunk(chunk))
				.then(() => {
					outputQueue--;
					dequeueResolver();
					return Promise.resolve();
				});
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

	const getQueueSize = () => {
		return encoder.encodeQueueSize + outputQueue;
	};

	encoder.configure(audioEncoderConfig);

	const waitForDequeue = async () => {
		await new Promise<void>((r) => {
			dequeueResolver = r;

			// @ts-expect-error exists
			encoder.addEventListener('dequeue', () => r(), {
				once: true,
			});
		});
	};

	const waitForFinish = async () => {
		while (getQueueSize() > 0) {
			await waitForDequeue();
		}
	};

	const encodeFrame = async (audioData: AudioData) => {
		if (encoder.state === 'closed') {
			return;
		}

		while (getQueueSize() > 10) {
			await waitForDequeue();
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
			await encoder.flush();
			await waitForFinish();
			await prom;
		},
		close: () => {
			encoder.close();
		},
		getQueueSize,
		flush: async () => {
			await encoder.flush();
		},
	};
};
