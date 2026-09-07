import {
	ALL_FORMATS,
	BlobSource,
	CanvasSink,
	CanvasSource,
	Input,
	type InputVideoTrack,
	type Quality,
	UrlSource,
	WebMOutputFormat,
	canEncodeVideo,
} from 'mediabunny';
import {createVideoLayerOutput} from './create-video-layer-output';
import {
	type OnVideoMattingModelLoadProgress,
	withLoadedVideoMattingPipeline,
} from './load-video-matting-model';
import {getVideoMattingModelInfo, type VideoMattingModel} from './models';
import type {VideoLayerOutput, VideoLayerOutputOptions} from './output-target';
import {prepareAudio, type PreparedVideoMattingAudio} from './prepare-audio';
import {
	createVideoMattingCanvas,
	drawForegroundFrame,
	drawOpaqueBaseFrame,
	getVideoMattingCanvasContext,
} from './video-matting-canvas';
import {
	resolveVideoMattingQuality,
	type VideoMattingBitrate,
} from './video-matting-quality';
import {
	getClippedVideoFrameTiming,
	getVideoProcessingProgress,
} from './video-timing';

export type VideoLayerAudio = 'base' | 'foreground' | 'both' | 'none';

type VideoLayerProgressFields = {
	processedFrames: number;
	processedDurationInSeconds: number;
	durationInSeconds: number;
};

export type SeparateVideoLayersProgress =
	| (VideoLayerProgressFields & {
			stage: 'processing';
			progress: number;
	  })
	| (VideoLayerProgressFields & {
			stage: 'finalizing';
			progress: null;
	  });

export type SeparateVideoLayersOptions = {
	src: string | URL | Blob;
	model?: VideoMattingModel;
	audio?: VideoLayerAudio;
	outputs?: {
		base?: VideoLayerOutputOptions;
		foreground?: VideoLayerOutputOptions;
	};
	videoBitrate?: VideoMattingBitrate;
	audioBitrate?: VideoMattingBitrate;
	keyframeIntervalInSeconds?: number;
	signal?: AbortSignal;
	onModelLoadProgress?: OnVideoMattingModelLoadProgress;
	onProgress?: (progress: SeparateVideoLayersProgress) => void;
};

export type SeparateVideoLayersResult = {
	base: VideoLayerOutput;
	foreground: VideoLayerOutput;
	model: VideoMattingModel;
	width: number;
	height: number;
	durationInSeconds: number;
	processedFrames: number;
};

const AUDIO_DESTINATIONS: VideoLayerAudio[] = [
	'base',
	'foreground',
	'both',
	'none',
];

const createAbortError = (signal: AbortSignal): unknown => {
	if (signal.reason !== undefined) {
		return signal.reason;
	}

	const error = new Error('Video layer separation was aborted.');
	error.name = 'AbortError';
	return error;
};

const throwIfAborted = (signal: AbortSignal | undefined) => {
	if (signal?.aborted) {
		throw createAbortError(signal);
	}
};

const validateLayerOutputOptions = ({
	layer,
	output,
}: {
	layer: 'base' | 'foreground';
	output: VideoLayerOutputOptions | undefined;
}) => {
	if (output === undefined) {
		return;
	}

	if (!output || typeof output !== 'object' || Array.isArray(output)) {
		throw new TypeError(`outputs.${layer} must be an object.`);
	}

	if (
		output.outputTarget !== undefined &&
		output.outputTarget !== 'arraybuffer' &&
		output.outputTarget !== 'web-fs'
	) {
		throw new TypeError(
			`outputs.${layer}.outputTarget must be arraybuffer or web-fs.`,
		);
	}

	if (
		output.outputTarget !== undefined &&
		output.outputWritable !== undefined
	) {
		throw new TypeError(
			`outputs.${layer} cannot specify both outputTarget and outputWritable.`,
		);
	}

	if (output.outputWritable !== undefined) {
		if (
			typeof WritableStream === 'undefined' ||
			!(output.outputWritable instanceof WritableStream)
		) {
			throw new TypeError(
				`outputs.${layer}.outputWritable must be a WritableStream.`,
			);
		}

		if (output.outputWritable.locked) {
			throw new TypeError(
				`outputs.${layer}.outputWritable must not already be locked.`,
			);
		}
	}
};

const validateOptions = (options: SeparateVideoLayersOptions) => {
	if (!options || typeof options !== 'object') {
		throw new TypeError('separateVideoLayers() expects an options object.');
	}

	const isBlob = typeof Blob !== 'undefined' && options.src instanceof Blob;
	const isUrl = options.src instanceof URL;
	if (typeof options.src !== 'string' && !isUrl && !isBlob) {
		throw new TypeError('src must be a string, URL, or Blob.');
	}

	if (typeof options.src === 'string' && options.src.length === 0) {
		throw new TypeError('src must not be an empty string.');
	}

	if (
		options.outputs !== undefined &&
		(!options.outputs ||
			typeof options.outputs !== 'object' ||
			Array.isArray(options.outputs))
	) {
		throw new TypeError('outputs must be an object.');
	}

	validateLayerOutputOptions({
		layer: 'base',
		output: options.outputs?.base,
	});
	validateLayerOutputOptions({
		layer: 'foreground',
		output: options.outputs?.foreground,
	});
	if (
		options.outputs?.base?.outputWritable !== undefined &&
		options.outputs.base.outputWritable ===
			options.outputs.foreground?.outputWritable
	) {
		throw new TypeError(
			'outputs.base and outputs.foreground must not use the same outputWritable.',
		);
	}

	getVideoMattingModelInfo(options.model ?? 'modnet');

	if (
		options.audio !== undefined &&
		!AUDIO_DESTINATIONS.includes(options.audio)
	) {
		throw new TypeError(
			'audio must be one of base, foreground, both, or none.',
		);
	}

	resolveVideoMattingQuality(options.videoBitrate ?? 'very-high');
	resolveVideoMattingQuality(options.audioBitrate ?? 'medium');

	if (
		options.keyframeIntervalInSeconds !== undefined &&
		(!Number.isFinite(options.keyframeIntervalInSeconds) ||
			options.keyframeIntervalInSeconds <= 0)
	) {
		throw new TypeError(
			'keyframeIntervalInSeconds must be a positive finite number.',
		);
	}

	if (
		options.onProgress !== undefined &&
		typeof options.onProgress !== 'function'
	) {
		throw new TypeError('onProgress must be a function.');
	}

	if (
		options.onModelLoadProgress !== undefined &&
		typeof options.onModelLoadProgress !== 'function'
	) {
		throw new TypeError('onModelLoadProgress must be a function.');
	}
};

const makeInput = (src: string | URL | Blob): Input => {
	const source =
		typeof src === 'string' || src instanceof URL
			? new UrlSource(src)
			: new BlobSource(src);

	return new Input({formats: ALL_FORMATS, source});
};

const probeVideoInput = async ({
	input,
	videoQuality,
}: {
	input: Input;
	videoQuality: Quality;
}): Promise<{videoTrack: InputVideoTrack; width: number; height: number}> => {
	if (!(await input.canRead())) {
		throw new Error('The input is not a supported media file.');
	}

	const videoTrack = await input.getPrimaryVideoTrack();
	if (videoTrack === null) {
		throw new Error('The input does not contain a video track.');
	}

	if (!(await videoTrack.canDecode())) {
		throw new Error('The primary video track cannot be decoded.');
	}

	const [width, height] = await Promise.all([
		videoTrack.getDisplayWidth(),
		videoTrack.getDisplayHeight(),
	]);
	if (
		!Number.isInteger(width) ||
		width <= 0 ||
		!Number.isInteger(height) ||
		height <= 0
	) {
		throw new Error('The input video has invalid dimensions.');
	}

	const [canEncodeBase, canEncodeForeground] = await Promise.all([
		canEncodeVideo('vp9', {
			width,
			height,
			quality: videoQuality,
			alpha: 'discard',
		}),
		canEncodeVideo('vp9', {
			width,
			height,
			quality: videoQuality,
			alpha: 'keep',
		}),
	]);
	if (!canEncodeBase || !canEncodeForeground) {
		throw new Error(
			'This browser cannot encode the VP9 video streams required for video layer separation.',
		);
	}

	return {videoTrack, width, height};
};

export const separateVideoLayers = async (
	options: SeparateVideoLayersOptions,
): Promise<SeparateVideoLayersResult> => {
	validateOptions(options);
	throwIfAborted(options.signal);

	const model = options.model ?? 'modnet';
	const audio = options.audio ?? 'base';
	const videoQuality = resolveVideoMattingQuality(
		options.videoBitrate ?? 'very-high',
	);
	const audioQuality = resolveVideoMattingQuality(
		options.audioBitrate ?? 'medium',
	);
	const keyframeIntervalInSeconds = options.keyframeIntervalInSeconds ?? 1;
	const input = makeInput(options.src);
	const onInputAbort = () => input.dispose();
	options.signal?.addEventListener('abort', onInputAbort, {once: true});

	try {
		const {videoTrack, width, height} = await probeVideoInput({
			input,
			videoQuality,
		});
		const [inputFirstVideoTimestamp, videoEndTimestamp] = await Promise.all([
			videoTrack.getFirstTimestamp(),
			videoTrack.computeDuration(),
		]);
		const videoStartTimestamp = Math.max(inputFirstVideoTimestamp, 0);
		if (videoEndTimestamp <= videoStartTimestamp) {
			throw new Error(
				'The primary video track contains no presentable video duration.',
			);
		}

		const durationInSeconds = videoEndTimestamp - videoStartTimestamp;
		throwIfAborted(options.signal);

		const result = await withLoadedVideoMattingPipeline({
			model,
			onProgress: options.onModelLoadProgress,
			signal: options.signal ?? null,
			run: async (pipeline) => {
				throwIfAborted(options.signal);
				let iterator: AsyncGenerator<
					{
						canvas: HTMLCanvasElement | OffscreenCanvas;
						timestamp: number;
						duration: number;
					},
					void,
					unknown
				> | null = null;
				let baseOutput: Awaited<
					ReturnType<typeof createVideoLayerOutput<WebMOutputFormat>>
				> | null = null;
				let foregroundOutput: Awaited<
					ReturnType<typeof createVideoLayerOutput<WebMOutputFormat>>
				> | null = null;
				let baseVideoSource: CanvasSource | null = null;
				let foregroundVideoSource: CanvasSource | null = null;
				let audioWriter: PreparedVideoMattingAudio | null = null;
				let completed = false;
				let abortCleanupPromise: Promise<void> | null = null;

				const cancelPendingMedia = async () => {
					await Promise.allSettled([
						baseOutput?.cancel(),
						foregroundOutput?.cancel(),
					]);
					await Promise.allSettled([audioWriter?.cancel()]);
					await Promise.allSettled([
						baseOutput?.discard(),
						foregroundOutput?.discard(),
					]);
				};

				const onAbort = () => {
					abortCleanupPromise = cancelPendingMedia();
				};

				options.signal?.addEventListener('abort', onAbort, {once: true});

				try {
					const canvasSink = new CanvasSink(videoTrack, {
						alpha: true,
						width,
						height,
						fit: 'fill',
						poolSize: 1,
					});
					iterator = canvasSink.canvases(
						videoStartTimestamp,
						videoEndTimestamp,
					);
					let nextFrame = await iterator.next();
					if (nextFrame.done) {
						throw new Error(
							'The primary video track contains no presentable decodable frames.',
						);
					}

					throwIfAborted(options.signal);

					const baseCanvas = createVideoMattingCanvas({width, height});
					const foregroundCanvas = createVideoMattingCanvas({width, height});
					const baseContext = getVideoMattingCanvasContext(baseCanvas);
					const foregroundContext =
						getVideoMattingCanvasContext(foregroundCanvas);

					baseOutput = await createVideoLayerOutput({
						format: new WebMOutputFormat(),
						options: options.outputs?.base,
					});
					throwIfAborted(options.signal);
					foregroundOutput = await createVideoLayerOutput({
						format: new WebMOutputFormat(),
						options: options.outputs?.foreground,
					});
					throwIfAborted(options.signal);

					baseVideoSource = new CanvasSource(baseCanvas, {
						codec: 'vp9',
						quality: videoQuality,
						keyFrameInterval: keyframeIntervalInSeconds,
						alpha: 'discard',
					});
					foregroundVideoSource = new CanvasSource(foregroundCanvas, {
						codec: 'vp9',
						quality: videoQuality,
						keyFrameInterval: keyframeIntervalInSeconds,
						alpha: 'keep',
					});
					baseOutput.output.addVideoTrack(baseVideoSource);
					foregroundOutput.output.addVideoTrack(foregroundVideoSource);

					audioWriter = await prepareAudio({
						input,
						baseOutput: baseOutput.output,
						foregroundOutput: foregroundOutput.output,
						destination: audio,
						videoStartTimestamp,
						videoEndTimestamp,
						audioQuality,
						forceTranscode: options.audioBitrate !== undefined,
					});
					throwIfAborted(options.signal);

					await Promise.all([
						baseOutput.output.start(),
						foregroundOutput.output.start(),
					]);
					throwIfAborted(options.signal);
					await audioWriter.prime();
					throwIfAborted(options.signal);

					let processedFrames = 0;
					let processedDurationInSeconds = 0;
					options.onProgress?.({
						stage: 'processing',
						progress: 0,
						processedFrames,
						processedDurationInSeconds,
						durationInSeconds,
					});

					while (!nextFrame.done) {
						throwIfAborted(options.signal);
						const frame = nextFrame.value;
						const timing = getClippedVideoFrameTiming({
							timestamp: frame.timestamp,
							duration: frame.duration,
							videoStartTimestamp,
							videoEndTimestamp,
						});
						if (timing === null) {
							nextFrame = await iterator.next();
							continue;
						}

						const foregroundFrame = await pipeline(frame.canvas);
						throwIfAborted(options.signal);

						drawOpaqueBaseFrame({
							context: baseContext,
							source: frame.canvas,
							width,
							height,
						});
						drawForegroundFrame({
							context: foregroundContext,
							result: foregroundFrame,
							source: frame.canvas,
							targetWidth: width,
							targetHeight: height,
						});

						await Promise.all([
							baseVideoSource.add(timing.timestamp, timing.duration),
							foregroundVideoSource.add(timing.timestamp, timing.duration),
							audioWriter.writeAudioUntil(timing.timestamp + timing.duration),
						]);

						processedFrames++;
						const processingProgress = getVideoProcessingProgress({
							timestamp: videoStartTimestamp + timing.timestamp,
							duration: timing.duration,
							firstVideoTimestamp: videoStartTimestamp,
							durationInSeconds,
						});
						processedDurationInSeconds =
							processingProgress.processedDurationInSeconds;
						options.onProgress?.({
							stage: 'processing',
							progress: processingProgress.progress,
							processedFrames,
							processedDurationInSeconds,
							durationInSeconds,
						});

						nextFrame = await iterator.next();
					}

					options.onProgress?.({
						stage: 'finalizing',
						progress: null,
						processedFrames,
						processedDurationInSeconds,
						durationInSeconds,
					});
					await audioWriter.finishAudio();
					baseVideoSource.close();
					foregroundVideoSource.close();
					const [base, foreground] = await Promise.all([
						baseOutput.finalize(),
						foregroundOutput.finalize(),
					]);
					throwIfAborted(options.signal);

					completed = true;
					return {
						base,
						foreground,
						model,
						width,
						height,
						durationInSeconds,
						processedFrames,
					};
				} catch (error) {
					await cancelPendingMedia();

					if (options.signal?.aborted) {
						throw createAbortError(options.signal);
					}

					throw error;
				} finally {
					options.signal?.removeEventListener('abort', onAbort);
					await abortCleanupPromise;
					if (!completed) {
						try {
							await iterator?.return();
						} catch {
							// Cleanup must not replace the operation's original error.
						}
					}
				}
			},
		});

		return result;
	} catch (error) {
		if (options.signal?.aborted) {
			throw createAbortError(options.signal);
		}

		throw error;
	} finally {
		options.signal?.removeEventListener('abort', onInputAbort);
		input.dispose();
	}
};
