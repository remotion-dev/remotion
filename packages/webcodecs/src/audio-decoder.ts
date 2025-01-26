import type {
	AudioOrVideoSample,
	AudioTrack,
	LogLevel,
} from '@remotion/media-parser';
import type {WebCodecsController} from './controller';
import type {ProgressTracker} from './create/progress-tracker';
import {getWaveAudioDecoder} from './get-wave-audio-decoder';
import {makeIoSynchronizer} from './io-manager/io-synchronizer';

export type WebCodecsAudioDecoder = {
	processSample: (audioSample: AudioOrVideoSample) => Promise<void>;
	waitForFinish: () => Promise<void>;
	close: () => void;
	flush: () => Promise<void>;
};

export type CreateAudioDecoderInit = {
	onFrame: (frame: AudioData) => Promise<void>;
	onError: (error: DOMException) => void;
	controller: WebCodecsController;
	config: AudioDecoderConfig;
	logLevel: LogLevel;
	track: AudioTrack;
	progressTracker: ProgressTracker;
};

export const createAudioDecoder = ({
	onFrame,
	onError,
	controller,
	config,
	logLevel,
	track,
	progressTracker,
}: CreateAudioDecoderInit): WebCodecsAudioDecoder => {
	if (controller.signal.aborted) {
		throw new Error('Not creating audio decoder, already aborted');
	}

	if (config.codec === 'pcm-s16') {
		return getWaveAudioDecoder({onFrame, track});
	}

	const ioSynchronizer = makeIoSynchronizer({
		logLevel,
		label: 'Audio decoder',
		progress: progressTracker,
	});

	let outputQueue = Promise.resolve();

	const audioDecoder = new AudioDecoder({
		output(frame) {
			ioSynchronizer.onOutput(frame.timestamp + (frame.duration ?? 0));
			const abortHandler = () => {
				frame.close();
			};

			controller.signal.addEventListener('abort', abortHandler, {once: true});
			outputQueue = outputQueue
				.then(() => {
					if (controller.signal.aborted) {
						return;
					}

					return onFrame(frame);
				})
				.then(() => {
					ioSynchronizer.onProcessed();
					controller.signal.removeEventListener('abort', abortHandler);
					return Promise.resolve();
				})
				.catch((err) => {
					frame.close();
					onError(err);
				});
		},
		error(error) {
			onError(error);
		},
	});

	const close = () => {
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		controller.signal.removeEventListener('abort', onAbort);

		if (audioDecoder.state === 'closed') {
			return;
		}

		audioDecoder.close();
	};

	const onAbort = () => {
		close();
	};

	controller.signal.addEventListener('abort', onAbort);

	audioDecoder.configure(config);

	const processSample = async (audioSample: AudioOrVideoSample) => {
		if (audioDecoder.state === 'closed') {
			return;
		}

		progressTracker.setPossibleLowestTimestamp(
			Math.min(
				audioSample.timestamp,
				audioSample.dts ?? Infinity,
				audioSample.cts ?? Infinity,
			),
		);

		await ioSynchronizer.waitFor({
			unemitted: 20,
			unprocessed: 20,
			minimumProgress: audioSample.timestamp - 10_000_000,
			controller,
		});

		// Don't flush, it messes up the audio

		const chunk = new EncodedAudioChunk(audioSample);
		audioDecoder.decode(chunk);
		ioSynchronizer.inputItem(chunk.timestamp, audioSample.type === 'key');
	};

	let queue = Promise.resolve();

	return {
		processSample: (sample: AudioOrVideoSample) => {
			queue = queue.then(() => processSample(sample));
			return queue;
		},
		waitForFinish: async () => {
			// Firefox might throw "Needs to be configured first"
			try {
				await audioDecoder.flush();
			} catch {}

			await queue;
			await ioSynchronizer.waitForFinish(controller);
			await outputQueue;
		},
		close,
		flush: async () => {
			await audioDecoder.flush();
		},
	};
};
