import type * as NodeUrl from 'node:url';
import {
	ALL_FORMATS,
	BlobSource,
	FilePathSource,
	Input,
	type InputVideoTrack,
	type Quality,
	UrlSource,
	WebMOutputFormat,
	canEncodeVideo,
} from 'mediabunny';
import {createVideoLayerOutput} from './create-video-layer-output';
import {
	createVideoMattingFrames,
	type VideoMattingFrames,
} from './create-video-matting-frames';
import {importNodeModule} from './import-node-module';
import {
	type OnVideoMattingModelLoadProgress,
	withLoadedVideoMattingPipeline,
} from './load-video-matting-model';
import {getVideoMattingModelInfo, type VideoMattingModel} from './models';
import type {VideoLayerOutput, VideoLayerOutputOptions} from './output-target';
import {prepareAudio, type PreparedVideoMattingAudio} from './prepare-audio';
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

export type SeparateVideoLayersResult = AsyncDisposable & {
	base: VideoLayerOutput;
	foreground: VideoLayerOutput;
	model: VideoMattingModel;
	width: number;
	height: number;
	durationInSeconds: number;
	processedFrames: number;
};

export type RemoveVideoBackgroundOptions = Omit<
	SeparateVideoLayersOptions,
	'audio' | 'outputs'
> & {
	audio?: 'keep' | 'none';
	output?: VideoLayerOutputOptions;
};

export type RemoveVideoBackgroundResult = AsyncDisposable & {
	video: VideoLayerOutput;
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

	const error = new Error('Video matting was aborted.');
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

const validateOptions = (
	options: SeparateVideoLayersOptions,
	operationName: 'separateVideoLayers' | 'removeVideoBackground',
) => {
	if (!options || typeof options !== 'object') {
		throw new TypeError(`${operationName}() expects an options object.`);
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

const makeInput = async (src: string | URL | Blob): Promise<Input> => {
	if (
		typeof window === 'undefined' &&
		typeof process !== 'undefined' &&
		process.release?.name === 'node' &&
		(typeof src === 'string' || src instanceof URL)
	) {
		const path = String(src);
		if (path.startsWith('file:')) {
			const {fileURLToPath} =
				await importNodeModule<typeof NodeUrl>('node:url');
			return new Input({
				formats: ALL_FORMATS,
				source: new FilePathSource(fileURLToPath(path)),
			});
		}

		// Treat Windows drive letters as paths, while preserving HTTP/data URLs.
		if (/^[a-z]:[/\\]/i.test(path) || !/^[a-z][a-z\d+.-]*:/i.test(path)) {
			return new Input({
				formats: ALL_FORMATS,
				source: new FilePathSource(path),
			});
		}
	}

	const source =
		typeof src === 'string' || src instanceof URL
			? new UrlSource(src)
			: new BlobSource(src);

	return new Input({formats: ALL_FORMATS, source});
};

const probeVideoInput = async ({
	input,
	videoQuality,
	includeBase,
}: {
	input: Input;
	videoQuality: Quality;
	includeBase: boolean;
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
		includeBase
			? canEncodeVideo('vp9', {
					width,
					height,
					quality: videoQuality,
					alpha: 'discard',
				})
			: Promise.resolve(true),
		canEncodeVideo('vp9', {
			width,
			height,
			quality: videoQuality,
			alpha: 'keep',
		}),
	]);
	if (!canEncodeBase || !canEncodeForeground) {
		throw new Error(
			'This environment cannot encode the VP9 video streams required for video matting.',
		);
	}

	return {videoTrack, width, height};
};

const runVideoMatting = async (
	options: SeparateVideoLayersOptions,
	includeBase: boolean,
): Promise<SeparateVideoLayersResult | RemoveVideoBackgroundResult> => {
	validateOptions(
		options,
		includeBase ? 'separateVideoLayers' : 'removeVideoBackground',
	);
	throwIfAborted(options.signal);

	const model = options.model ?? 'modnet';
	const audio = options.audio ?? (includeBase ? 'base' : 'foreground');
	const videoQuality = resolveVideoMattingQuality(
		options.videoBitrate ?? 'very-high',
	);
	const audioQuality = resolveVideoMattingQuality(
		options.audioBitrate ?? 'medium',
	);
	const keyframeIntervalInSeconds = options.keyframeIntervalInSeconds ?? 1;
	const input = await makeInput(options.src);
	const onInputAbort = () => input.dispose();
	options.signal?.addEventListener('abort', onInputAbort, {once: true});

	try {
		throwIfAborted(options.signal);
		const {videoTrack, width, height} = await probeVideoInput({
			input,
			videoQuality,
			includeBase,
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
				let videoFrames: VideoMattingFrames | null = null;
				let baseOutput: Awaited<
					ReturnType<typeof createVideoLayerOutput<WebMOutputFormat>>
				> | null = null;
				let foregroundOutput: Awaited<
					ReturnType<typeof createVideoLayerOutput<WebMOutputFormat>>
				> | null = null;
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
					videoFrames = await createVideoMattingFrames({
						videoTrack,
						width,
						height,
						videoQuality,
						keyframeIntervalInSeconds,
						videoStartTimestamp,
						videoEndTimestamp,
						includeBase,
					});
					const iterator = videoFrames.frames;
					let nextFrame = await iterator.next();
					if (nextFrame.done) {
						throw new Error(
							'The primary video track contains no presentable decodable frames.',
						);
					}

					throwIfAborted(options.signal);

					if (includeBase) {
						baseOutput = await createVideoLayerOutput({
							format: new WebMOutputFormat(),
							options: options.outputs?.base,
						});
					}

					throwIfAborted(options.signal);
					foregroundOutput = await createVideoLayerOutput({
						format: new WebMOutputFormat(),
						options: options.outputs?.foreground,
					});
					throwIfAborted(options.signal);

					if (baseOutput && videoFrames.baseSource) {
						baseOutput.output.addVideoTrack(videoFrames.baseSource);
					}

					foregroundOutput.output.addVideoTrack(videoFrames.foregroundSource);

					audioWriter = await prepareAudio({
						input,
						baseOutput: baseOutput?.output ?? null,
						foregroundOutput: foregroundOutput.output,
						destination: audio,
						videoStartTimestamp,
						videoEndTimestamp,
						audioQuality,
						forceTranscode: options.audioBitrate !== undefined,
					});
					throwIfAborted(options.signal);

					await Promise.all([
						baseOutput?.output.start(),
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

						const foregroundFrame = await pipeline(frame.image);
						throwIfAborted(options.signal);

						await Promise.all([
							videoFrames.addFrame({
								frame,
								foreground: foregroundFrame,
								...timing,
							}),
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
					videoFrames.baseSource?.close();
					videoFrames.foregroundSource.close();
					const [base, foreground] = await Promise.all([
						baseOutput?.finalize() ?? Promise.resolve(null),
						foregroundOutput.finalize(),
					]);
					throwIfAborted(options.signal);

					completed = true;
					const separated = {
						...(base ? {base, foreground} : {video: foreground}),
						model,
						width,
						height,
						durationInSeconds,
						processedFrames,
					} as SeparateVideoLayersResult | RemoveVideoBackgroundResult;
					Object.defineProperty(separated, Symbol.asyncDispose, {
						enumerable: false,
						value: async () => {
							await Promise.all([base?.dispose(), foreground.dispose()]);
						},
					});
					return separated;
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
							await videoFrames?.frames.return();
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

export const separateVideoLayers = async (
	options: SeparateVideoLayersOptions,
): Promise<SeparateVideoLayersResult> =>
	(await runVideoMatting(options, true)) as SeparateVideoLayersResult;

export const removeVideoBackground = async (
	options: RemoveVideoBackgroundOptions,
): Promise<RemoveVideoBackgroundResult> =>
	(await runVideoMatting(
		{
			...options,
			audio: options.audio === 'none' ? 'none' : 'foreground',
			outputs: {foreground: options.output},
		},
		false,
	)) as RemoveVideoBackgroundResult;
