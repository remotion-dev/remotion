import type {LogLevel} from '@remotion/media-parser';
import type {ProgressTracker} from './create/progress-tracker';
import type {ConvertMediaAudioCodec} from './get-available-audio-codecs';
import {makeIoSynchronizer} from './io-manager/io-synchronizer';
import {getWaveAudioEncoder} from './wav-audio-encoder';

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
	signal: AbortSignal;
	config: AudioEncoderConfig;
	logLevel: LogLevel;
	onNewAudioSampleRate: (sampleRate: number) => void;
	progressTracker: ProgressTracker;
};

export const createAudioEncoder = ({
	onChunk,
	onError,
	codec,
	signal,
	config: audioEncoderConfig,
	logLevel,
	onNewAudioSampleRate,
	progressTracker,
}: AudioEncoderInit): WebCodecsAudioEncoder => {
	if (signal.aborted) {
		throw new Error('Not creating audio encoder, already aborted');
	}

	if (codec === 'wav') {
		return getWaveAudioEncoder({onChunk, signal});
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
			signal,
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
			await ioSynchronizer.waitForFinish(signal);
			await prom;
		},
		close,
		flush: async () => {
			await encoder.flush();
		},
	};
};
