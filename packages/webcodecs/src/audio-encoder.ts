import {
	MediaParserAbortError,
	type MediaParserLogLevel,
} from '@remotion/media-parser';
import type {ConvertMediaAudioCodec} from './get-available-audio-codecs';
import type {IoSynchronizer} from './io-manager/io-synchronizer';
import {makeIoSynchronizer} from './io-manager/io-synchronizer';
import {getWaveAudioEncoder} from './wav-audio-encoder';
import type {WebCodecsController} from './webcodecs-controller';

export type WebCodecsAudioEncoder = {
	encode: (audioData: AudioData) => void;
	waitForFinish: () => Promise<void>;
	close: () => void;
	flush: () => Promise<void>;
	ioSynchronizer: IoSynchronizer;
};

export type AudioEncoderInit = {
	onChunk: (chunk: EncodedAudioChunk) => Promise<void>;
	onError: (error: Error) => void;
	codec: ConvertMediaAudioCodec;
	controller: WebCodecsController;
	config: AudioEncoderConfig;
	logLevel: MediaParserLogLevel;
	onNewAudioSampleRate: (sampleRate: number) => void;
};

export const createAudioEncoder = ({
	onChunk,
	onError,
	codec,
	controller,
	config: audioEncoderConfig,
	logLevel,
	onNewAudioSampleRate,
}: AudioEncoderInit): WebCodecsAudioEncoder => {
	if (controller._internals._mediaParserController._internals.signal.aborted) {
		throw new MediaParserAbortError(
			'Not creating audio encoder, already aborted',
		);
	}

	const ioSynchronizer = makeIoSynchronizer({
		logLevel,
		label: 'Audio encoder',
		controller,
	});

	if (codec === 'wav') {
		return getWaveAudioEncoder({
			onChunk,
			controller,
			config: audioEncoderConfig,
			ioSynchronizer,
		});
	}

	const encoder = new AudioEncoder({
		output: async (chunk) => {
			try {
				await onChunk(chunk);
			} catch (err) {
				onError(err as Error);
			}

			ioSynchronizer.onOutput(chunk.timestamp);
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

	const encodeFrame = (audioData: AudioData) => {
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

	return {
		encode: (audioData: AudioData) => {
			encodeFrame(audioData);
		},
		waitForFinish: async () => {
			await encoder.flush();
			await ioSynchronizer.waitForQueueSize(0);
		},
		close,
		flush: async () => {
			await encoder.flush();
		},
		ioSynchronizer,
	};
};
