import type {LogLevel} from '@remotion/media-parser';
import type {ConvertMediaAudioCodec} from './codec-id';
import {makeIoSynchronizer} from './io-manager/io-synchronizer';

export type WebCodecsAudioEncoder = {
	encodeFrame: (audioData: AudioData) => Promise<void>;
	waitForFinish: () => Promise<void>;
	close: () => void;
	flush: () => Promise<void>;
};

export const createAudioEncoder = ({
	onChunk,
	onError,
	codec,
	signal,
	config: audioEncoderConfig,
	logLevel,
}: {
	onChunk: (chunk: EncodedAudioChunk) => Promise<void>;
	onError: (error: DOMException) => void;
	codec: ConvertMediaAudioCodec;
	signal: AbortSignal;
	config: AudioEncoderConfig;
	logLevel: LogLevel;
}): WebCodecsAudioEncoder => {
	if (signal.aborted) {
		throw new Error('Not creating audio encoder, already aborted');
	}

	const ioSynchronizer = makeIoSynchronizer(logLevel, 'Audio encoder');

	let prom = Promise.resolve();

	const encoder = new AudioEncoder({
		output: (chunk) => {
			ioSynchronizer.onOutput(chunk.timestamp);
			prom = prom
				.then(() => {
					if (signal.aborted) {
						return;
					}

					return onChunk(chunk);
				})
				.then(() => {
					ioSynchronizer.onProcessed();
					return Promise.resolve();
				})
				.catch((err) => {
					onError(err);
				});
		},
		error(error) {
			onError(error);
		},
	});

	const close = () => {
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		signal.removeEventListener('abort', onAbort);
		if (encoder.state === 'closed') {
			return;
		}

		encoder.close();
	};

	const onAbort = () => {
		close();
	};

	signal.addEventListener('abort', onAbort);

	if (codec !== 'opus' && codec !== 'aac') {
		throw new Error('Only `codec: "opus"` is supported currently');
	}

	const wantedSampleRate = audioEncoderConfig.sampleRate;

	const encodeFrame = async (audioData: AudioData) => {
		if (encoder.state === 'closed') {
			return;
		}

		await ioSynchronizer.waitFor({unemitted: 2, _unprocessed: 2});

		// @ts-expect-error - can have changed in the meanwhile
		if (encoder.state === 'closed') {
			return;
		}

		if (audioData.sampleRate !== wantedSampleRate) {
			encoder.configure({
				...audioEncoderConfig,
				sampleRate: audioData.sampleRate,
			});
		}

		encoder.encode(audioData);
		ioSynchronizer.inputItem(audioData.timestamp, true);
	};

	let queue = Promise.resolve();

	return {
		encodeFrame: (audioData: AudioData) => {
			queue = queue.then(() => encodeFrame(audioData));
			return queue;
		},
		waitForFinish: async () => {
			await encoder.flush();
			await ioSynchronizer.waitForFinish();
			await prom;
		},
		close,
		flush: async () => {
			await encoder.flush();
		},
	};
};
