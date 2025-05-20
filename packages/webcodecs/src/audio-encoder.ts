import {
	MediaParserAbortError,
	type MediaParserLogLevel,
} from '@remotion/media-parser';
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
	onError: (error: Error) => void;
	codec: ConvertMediaAudioCodec;
	controller: WebCodecsController;
	config: AudioEncoderConfig;
	logLevel: MediaParserLogLevel;
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
	if (controller._internals._mediaParserController._internals.signal.aborted) {
		throw new MediaParserAbortError(
			'Not creating audio encoder, already aborted',
		);
	}

	if (codec === 'wav') {
		return getWaveAudioEncoder({
			onChunk,
			controller,
			config: audioEncoderConfig,
		});
	}

	const ioSynchronizer = makeIoSynchronizer({
		logLevel,
		label: 'Audio encoder',
		progress: progressTracker,
	});

	const encoder = new AudioEncoder({
		output: async (chunk) => {
			ioSynchronizer.onOutput(chunk.timestamp);
			try {
				return await onChunk(chunk);
			} catch (err) {
				onError(err as Error);
			}
		},
		error(error) {
			onError(error);
		},
	});

	const close = () => {
		controller._internals._mediaParserController._internals.signal.removeEventListener(
			'abort',
			// eslint-disable-next-line @typescript-eslint/no-use-before-define
			onAbort,
		);
		if (encoder.state === 'closed') {
			return;
		}

		encoder.close();
	};

	const onAbort = () => {
		close();
	};

	controller._internals._mediaParserController._internals.signal.addEventListener(
		'abort',
		onAbort,
	);

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

		await ioSynchronizer.waitForQueueSize({
			queueSize: 20,
			controller,
		});

		await progressTracker.waitForMinimumProgress({
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
		ioSynchronizer.inputItem(audioData.timestamp);
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
		},
		close,
		flush: async () => {
			await encoder.flush();
		},
	};
};
