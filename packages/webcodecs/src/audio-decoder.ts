import type {
	MediaParserAudioSample,
	MediaParserLogLevel,
} from '@remotion/media-parser';
import {getWaveAudioDecoder} from './get-wave-audio-decoder';
import {makeIoSynchronizer} from './io-manager/io-synchronizer';
import type {WebCodecsController} from './webcodecs-controller';

export type WebCodecsAudioDecoder = {
	decode: (audioSample: MediaParserAudioSample) => void;
	close: () => void;
	flush: () => Promise<void>;
	waitForFinish: () => Promise<void>;
	waitForQueueToBeLessThan: (items: number) => Promise<void>;
};

export type CreateAudioDecoderInit = {
	onFrame: (frame: AudioData) => Promise<void>;
	onError: (error: Error) => void;
	controller: WebCodecsController | null;
	config: AudioDecoderConfig;
	logLevel: MediaParserLogLevel;
};

export const internalCreateAudioDecoder = ({
	onFrame,
	onError,
	controller,
	config,
	logLevel,
}: CreateAudioDecoderInit): WebCodecsAudioDecoder => {
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

	audioDecoder.configure(config);

	const processSample = (audioSample: MediaParserAudioSample) => {
		if (audioDecoder.state === 'closed') {
			return;
		}

		// Don't flush, it messes up the audio

		const chunk = new EncodedAudioChunk(audioSample);
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

	return {
		decode: (sample: MediaParserAudioSample) => {
			processSample(sample);
		},
		waitForFinish: async () => {
			// Firefox might throw "Needs to be configured first"
			try {
				await audioDecoder.flush();
			} catch {}

			await ioSynchronizer.waitForFinish();
		},
		close,
		flush: async () => {
			await audioDecoder.flush();
		},
		waitForQueueToBeLessThan: ioSynchronizer.waitForQueueSize,
	};
};

export const createAudioDecoder = ({
	onFrame,
	onError,
	controller,
	config,
	logLevel,
}: {
	config: AudioDecoderConfig;
	onFrame: (frame: AudioData) => Promise<void>;
	onError: (error: Error) => void;
	controller?: WebCodecsController | null;
	logLevel?: MediaParserLogLevel;
}): WebCodecsAudioDecoder => {
	return internalCreateAudioDecoder({
		onFrame,
		onError,
		controller: controller ?? null,
		config,
		logLevel: logLevel ?? 'error',
	});
};
