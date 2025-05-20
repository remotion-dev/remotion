import type {
	MediaParserAudioSample,
	MediaParserAudioTrack,
	MediaParserLogLevel,
} from '@remotion/media-parser';
import {getWaveAudioDecoder} from './get-wave-audio-decoder';
import type {IoSynchronizer} from './io-manager/io-synchronizer';
import {makeIoSynchronizer} from './io-manager/io-synchronizer';
import type {WebCodecsController} from './webcodecs-controller';

export type WebCodecsAudioDecoder = {
	decode: (audioSample: MediaParserAudioSample) => void;
	waitForFinish: () => Promise<void>;
	close: () => void;
	flush: () => Promise<void>;
	ioSynchronizer: IoSynchronizer;
};

export type CreateAudioDecoderInit = {
	onFrame: (frame: AudioData) => Promise<void>;
	onError: (error: Error) => void;
	controller: WebCodecsController;
	config: AudioDecoderConfig;
	logLevel: MediaParserLogLevel;
	track: MediaParserAudioTrack;
};

export const createAudioDecoder = ({
	onFrame,
	onError,
	controller,
	config,
	logLevel,
	track,
}: CreateAudioDecoderInit): WebCodecsAudioDecoder => {
	if (controller._internals._mediaParserController._internals.signal.aborted) {
		throw new Error('Not creating audio decoder, already aborted');
	}

	const ioSynchronizer = makeIoSynchronizer({
		logLevel,
		label: 'Audio decoder',
	});

	if (config.codec === 'pcm-s16') {
		return getWaveAudioDecoder({
			onFrame,
			track,
			sampleFormat: 's16',
			logLevel,
			ioSynchronizer,
			onError,
		});
	}

	const audioDecoder = new AudioDecoder({
		async output(frame) {
			ioSynchronizer.onOutput(frame.timestamp + (frame.duration ?? 0));
			try {
				await onFrame(frame);
			} catch (err) {
				frame.close();
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

		if (audioDecoder.state === 'closed') {
			return;
		}

		audioDecoder.close();
	};

	const onAbort = () => {
		close();
	};

	controller._internals._mediaParserController._internals.signal.addEventListener(
		'abort',
		onAbort,
	);

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

			await ioSynchronizer.waitForFinish(controller);
		},
		close,
		flush: async () => {
			await audioDecoder.flush();
		},
		ioSynchronizer,
	};
};
