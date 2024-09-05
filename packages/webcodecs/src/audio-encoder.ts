import type {ConvertMediaAudioCodec} from './codec-id';

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
	onError,
	codec,
	signal,
}: {
	onChunk: (chunk: EncodedAudioChunk) => Promise<void>;
	sampleRate: number;
	numberOfChannels: number;
	onError: (error: DOMException) => void;
	codec: ConvertMediaAudioCodec;
	signal: AbortSignal;
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
			onError(error);
		},
	});

	const close = () => {
		encoder.close();

		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		signal.removeEventListener('abort', onAbort);
	};

	const onAbort = () => {
		close();
	};

	signal.addEventListener('abort', onAbort);

	if (codec !== 'opus') {
		return Promise.reject(
			new Error('Only `codec: "opus"` is supported currently'),
		);
	}

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

		// @ts-expect-error - can have changed in the meanwhile
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
			await encoder.flush();
			await waitForFinish();
			await prom;
		},
		close,
		getQueueSize,
		flush: async () => {
			await encoder.flush();
		},
	};
};
