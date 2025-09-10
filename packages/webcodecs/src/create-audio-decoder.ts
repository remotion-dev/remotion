import type {MediaParserLogLevel} from '@remotion/media-parser';
import type {FlushPending} from './flush-pending';
import {makeFlushPending} from './flush-pending';
import {getWaveAudioDecoder} from './get-wave-audio-decoder';
import {makeIoSynchronizer} from './io-manager/io-synchronizer';
import {AudioUndecodableError} from './undecodable-error';
import type {WebCodecsController} from './webcodecs-controller';

export type WebCodecsAudioDecoder = {
	decode: (
		audioSample: EncodedAudioChunkInit | EncodedAudioChunk,
	) => Promise<void>;
	close: () => void;
	flush: () => Promise<void>;
	waitForQueueToBeLessThan: (items: number) => Promise<void>;
	reset: () => void;
	checkReset: () => {
		wasReset: () => boolean;
	};
	getMostRecentSampleInput: () => number | null;
};

export type CreateAudioDecoderInit = {
	onFrame: (frame: AudioData) => Promise<void> | void;
	onError: (error: Error) => void;
	controller: WebCodecsController | null;
	config: AudioDecoderConfig;
	logLevel: MediaParserLogLevel;
};

export const internalCreateAudioDecoder = async ({
	onFrame,
	onError,
	controller,
	config,
	logLevel,
}: CreateAudioDecoderInit): Promise<WebCodecsAudioDecoder> => {
	if (
		controller &&
		controller._internals._mediaParserController._internals.signal.aborted
	) {
		throw new Error('Not creating audio decoder, already aborted');
	}

	const ioSynchronizer = makeIoSynchronizer({
		logLevel,
		label: 'Audio decoder',
		controller,
	});

	let mostRecentSampleReceived: number | null = null;

	if (config.codec === 'pcm-s16') {
		return getWaveAudioDecoder({
			onFrame,
			config,
			sampleFormat: 's16',
			logLevel,
			ioSynchronizer,
			onError,
		});
	}

	if (config.codec === 'pcm-s24') {
		return getWaveAudioDecoder({
			onFrame,
			config,
			sampleFormat: 's24',
			logLevel,
			ioSynchronizer,
			onError,
		});
	}

	const audioDecoder = new AudioDecoder({
		async output(frame) {
			try {
				await onFrame(frame);
			} catch (err) {
				frame.close();
				onError(err as Error);
			}

			ioSynchronizer.onOutput(frame.timestamp + (frame.duration ?? 0));
		},
		error(error) {
			onError(error);
		},
	});

	const close = () => {
		if (controller) {
			controller._internals._mediaParserController._internals.signal.removeEventListener(
				'abort',
				// eslint-disable-next-line @typescript-eslint/no-use-before-define
				onAbort,
			);
		}

		if (audioDecoder.state === 'closed') {
			return;
		}

		audioDecoder.close();
	};

	const onAbort = () => {
		close();
	};

	if (controller) {
		controller._internals._mediaParserController._internals.signal.addEventListener(
			'abort',
			onAbort,
		);
	}

	const isConfigSupported = await AudioDecoder.isConfigSupported(config);
	if (!isConfigSupported) {
		throw new AudioUndecodableError({
			message: 'Audio cannot be decoded by this browser',
			config,
		});
	}

	audioDecoder.configure(config);

	const decode = async (
		audioSample: EncodedAudioChunkInit | EncodedAudioChunk,
	) => {
		if (audioDecoder.state === 'closed') {
			return;
		}

		try {
			await controller?._internals._mediaParserController._internals.checkForAbortAndPause();
		} catch (err) {
			onError(err as Error);
			return;
		}

		mostRecentSampleReceived = audioSample.timestamp;

		// Don't flush, it messes up the audio

		const chunk =
			audioSample instanceof EncodedAudioChunk
				? audioSample
				: new EncodedAudioChunk(audioSample);
		audioDecoder.decode(chunk);

		// https://test-streams.mux.dev/x36xhzz/url_0/url_525/193039199_mp4_h264_aac_hd_7.ts
		// has a 16 byte audio sample at the end which chrome does not decode
		// Might be empty audio
		// For now only reporting chunks that are bigger than that
		// 16 was chosen arbitrarily, can be improved
		if (chunk.byteLength > 16) {
			ioSynchronizer.inputItem(chunk.timestamp);
		}
	};

	let flushPending: FlushPending | null = null;
	const lastReset: number | null = null;

	return {
		decode,
		close,
		flush: () => {
			if (flushPending) {
				throw new Error('Flush already pending');
			}

			const pendingFlush = makeFlushPending();
			flushPending = pendingFlush;
			Promise.resolve()
				.then(() => {
					return audioDecoder.flush();
				})
				.catch(() => {
					// Firefox might throw "Needs to be configured first"
				})
				.finally(() => {
					pendingFlush.resolve();
					flushPending = null;
				});

			return pendingFlush.promise;
		},
		waitForQueueToBeLessThan: ioSynchronizer.waitForQueueSize,
		reset: () => {
			audioDecoder.reset();
			audioDecoder.configure(config);
		},
		checkReset: () => {
			const initTime = Date.now();
			return {
				wasReset: () => lastReset !== null && lastReset > initTime,
			};
		},
		getMostRecentSampleInput() {
			return mostRecentSampleReceived;
		},
	};
};

export const createAudioDecoder = ({
	track,
	onFrame,
	onError,
	controller,
	logLevel,
}: {
	track: AudioDecoderConfig;
	onFrame: (frame: AudioData) => Promise<void> | void;
	onError: (error: Error) => void;
	controller?: WebCodecsController | null;
	logLevel?: MediaParserLogLevel;
}): Promise<WebCodecsAudioDecoder> => {
	return internalCreateAudioDecoder({
		onFrame,
		onError,
		controller: controller ?? null,
		config: track,
		logLevel: logLevel ?? 'error',
	});
};
