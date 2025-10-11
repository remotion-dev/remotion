import {
	MediaParserAbortError,
	type MediaParserLogLevel,
} from '@remotion/media-parser';
import {convertToCorrectVideoFrame} from './convert-to-correct-videoframe';
import type {ConvertMediaVideoCodec} from './get-available-video-codecs';
import type {IoSynchronizer} from './io-manager/io-synchronizer';
import {makeIoSynchronizer} from './io-manager/io-synchronizer';
import {Log} from './log';
import type {WebCodecsController} from './webcodecs-controller';

export type WebCodecsVideoEncoder = {
	encode: (videoFrame: VideoFrame) => void;
	waitForFinish: () => Promise<void>;
	close: () => void;
	flush: () => Promise<void>;
	ioSynchronizer: IoSynchronizer;
};

export const createVideoEncoder = ({
	onChunk,
	onError,
	controller,
	config,
	logLevel,
	outputCodec,
	keyframeInterval,
}: {
	onChunk: (
		chunk: EncodedVideoChunk,
		metadata: EncodedVideoChunkMetadata | null,
	) => Promise<void>;
	onError: (error: Error) => void;
	controller: WebCodecsController;
	config: VideoEncoderConfig;
	logLevel: MediaParserLogLevel;
	outputCodec: ConvertMediaVideoCodec;
	keyframeInterval: number;
}): WebCodecsVideoEncoder => {
	if (controller._internals._mediaParserController._internals.signal.aborted) {
		throw new MediaParserAbortError(
			'Not creating video encoder, already aborted',
		);
	}

	const ioSynchronizer = makeIoSynchronizer({
		logLevel,
		label: 'Video encoder',
		controller,
	});

	const encoder = new VideoEncoder({
		error(error) {
			onError(error);
		},
		async output(chunk, metadata) {
			const timestamp = chunk.timestamp + (chunk.duration ?? 0);

			try {
				await onChunk(chunk, metadata ?? null);
			} catch (err) {
				onError(err as Error);
			}

			ioSynchronizer.onOutput(timestamp);
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

	Log.verbose(logLevel, 'Configuring video encoder', config);
	encoder.configure(config);

	let framesProcessed = 0;

	const encodeFrame = (frame: VideoFrame) => {
		if (encoder.state === 'closed') {
			return;
		}

		const keyFrame = framesProcessed % keyframeInterval === 0;

		encoder.encode(
			convertToCorrectVideoFrame({videoFrame: frame, outputCodec}),
			{
				keyFrame,
				// @ts-expect-error
				vp9: {
					quantizer: 36,
				},
			},
		);

		ioSynchronizer.inputItem(frame.timestamp);
		framesProcessed++;
	};

	return {
		encode: (frame: VideoFrame) => {
			encodeFrame(frame);
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
