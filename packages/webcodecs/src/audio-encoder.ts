import {MediaParserAbortError, type LogLevel} from '@remotion/media-parser';
import type {ProgressTracker} from './create/progress-tracker';
import type {ConvertMediaAudioCodec} from './get-available-audio-codecs';
import {makeIoSynchronizer} from './io-manager/io-synchronizer';
import {getWaveAudioEncoder} from './wav-audio-encoder';
import type {WebCodecsController} from './webcodecs-controller';

export type WebCodecsAudioEncoder = {
	encodeFrame: (audioData: AudioData) => Promise<void>;
	waitForFinish: () => Promise<void>;
	close: () => void;
	flush: () => Promise<void>;
};

export type AudioEncoderInit = {
	onChunk: (chunk: EncodedAudioChunk) => Promise<void>;
	onError: (error: DOMException) => void;
	codec: ConvertMediaAudioCodec;
	controller: WebCodecsController;
	config: AudioEncoderConfig;
	logLevel: LogLevel;
	onNewAudioSampleRate: (sampleRate: number) => void;
	progressTracker: ProgressTracker;
};

export const createAudioEncoder = ({
	onChunk,
	onError,
	codec,
	controller,
	config: audioEncoderConfig,
	logLevel,
	onNewAudioSampleRate,
	progressTracker,
}: AudioEncoderInit): WebCodecsAudioEncoder => {
	if (controller._internals.signal.aborted) {
		throw new MediaParserAbortError(
			'Not creating audio encoder, already aborted',
		);
	}

	if (codec === 'wav') {
		return getWaveAudioEncoder({onChunk, controller});
	}

	const ioSynchronizer = makeIoSynchronizer({
		logLevel,
		label: 'Audio encoder',
		progress: progressTracker,
	});

	let prom = Promise.resolve();

	const encoder = new AudioEncoder({
		output: (chunk) => {
			ioSynchronizer.onOutput(chunk.timestamp);
			prom = prom
				.then(() => {
					if (controller._internals.signal.aborted) {
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
		controller._internals.signal.removeEventListener('abort', onAbort);
		if (encoder.state === 'closed') {
			return;
		}

		encoder.close();
	};

	const onAbort = () => {
		close();
	};

	controller._internals.signal.addEventListener('abort', onAbort);

	if (codec !== 'opus' && codec !== 'aac') {
		throw new Error(
			'Only `codec: "opus"` and `codec: "aac"` is supported currently',
		);
	}

	const wantedSampleRate = audioEncoderConfig.sampleRate;

	const encodeFrame = async (audioData: AudioData) => {
		if (encoder.state === 'closed') {
			return;
		}

		progressTracker.setPossibleLowestTimestamp(audioData.timestamp);

		await ioSynchronizer.waitFor({
			unemitted: 20,
			unprocessed: 20,
			minimumProgress: audioData.timestamp - 10_000_000,
			controller,
		});

		// @ts-expect-error - can have changed in the meanwhile
		if (encoder.state === 'closed') {
			return;
		}

		if (encoder.state === 'unconfigured') {
			if (audioData.sampleRate === wantedSampleRate) {
				encoder.configure(audioEncoderConfig);
			} else {
				encoder.configure({
					...audioEncoderConfig,
					sampleRate: audioData.sampleRate,
				});
				onNewAudioSampleRate(audioData.sampleRate);
			}
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
			await ioSynchronizer.waitForFinish(controller);
			await prom;
		},
		close,
		flush: async () => {
			await encoder.flush();
		},
	};
};
