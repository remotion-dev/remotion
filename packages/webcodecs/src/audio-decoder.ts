import type {AudioSample, AudioTrack} from '@remotion/media-parser';

export type WebCodecsAudioDecoder = {
	processSample: (audioSample: AudioSample) => Promise<void>;
	waitForFinish: () => Promise<void>;
	close: () => void;
	getQueueSize: () => number;
	waitForDequeue: () => Promise<void>;
	flush: () => Promise<void>;
};

export const createAudioDecoder = async ({
	track,
	onFrame,
	onError,
}: {
	track: AudioTrack;
	onFrame: (frame: AudioData) => Promise<void>;
	onError: (error: DOMException) => void;
}): Promise<WebCodecsAudioDecoder | null> => {
	if (typeof AudioDecoder === 'undefined') {
		return null;
	}

	const {supported, config} = await AudioDecoder.isConfigSupported(track);

	if (!supported) {
		return null;
	}

	let outputQueue = Promise.resolve();
	let outputQueueSize = 0;
	let dequeueResolver = () => {};

	const audioDecoder = new AudioDecoder({
		output(inputFrame) {
			outputQueueSize++;
			outputQueue = outputQueue
				.then(() => onFrame(inputFrame))
				.then(() => {
					dequeueResolver();
					outputQueueSize--;
					return Promise.resolve();
				});
		},
		error(error) {
			onError(error);
		},
	});

	const getQueueSize = () => {
		return audioDecoder.decodeQueueSize + outputQueueSize;
	};

	audioDecoder.configure(config);

	const waitForDequeue = async () => {
		await new Promise<void>((r) => {
			dequeueResolver = r;
			// @ts-expect-error exists
			audioDecoder.addEventListener('dequeue', () => r(), {
				once: true,
			});
		});
	};

	const waitForFinish = async () => {
		while (getQueueSize() > 0) {
			await waitForDequeue();
		}
	};

	const processSample = async (audioSample: AudioSample) => {
		if (audioDecoder.state === 'closed') {
			return;
		}

		while (getQueueSize() > 10) {
			await waitForDequeue();
		}

		// Don't flush, it messes up the audio

		const chunk = new EncodedAudioChunk(audioSample);
		audioDecoder.decode(chunk);
	};

	let queue = Promise.resolve();

	return {
		processSample: (sample: AudioSample) => {
			queue = queue.then(() => processSample(sample));
			return queue;
		},
		waitForFinish: async () => {
			await audioDecoder.flush();
			await waitForFinish();
			await outputQueue;
		},
		close: () => {
			audioDecoder.close();
		},
		getQueueSize,
		waitForDequeue,
		flush: async () => {
			await audioDecoder.flush();
		},
	};
};
