import {BufferTarget, Output, VideoSample, VideoSampleSource} from 'mediabunny';
import type {CalculateMetadataFunction} from 'remotion';
import {Internals, type LogLevel} from 'remotion';
import type {AnyZodObject, z} from 'zod';
import {handleArtifacts, type OnArtifact} from './artifact';
import {createScaffold} from './create-scaffold';
import {getRealFrameRange, type FrameRange} from './frame-range';
import type {
	WebRendererContainer,
	WebRendererQuality,
} from './mediabunny-mappings';
import {
	codecToMediabunnyCodec,
	containerToMediabunnyContainer,
	getDefaultVideoCodecForContainer,
	getQualityForWebRendererQuality,
	type WebRendererCodec,
} from './mediabunny-mappings';
import type {
	CompositionCalculateMetadataOrExplicit,
	InferProps,
} from './props-if-has-props';
import {createFrame} from './take-screenshot';
import {createThrottledProgressCallback} from './throttle-progress';
import {validateVideoFrame, type OnFrameCallback} from './validate-video-frame';
import {waitForReady} from './wait-for-ready';

export type InputPropsIfHasProps<
	Schema extends AnyZodObject,
	Props,
> = AnyZodObject extends Schema
	? {} extends Props
		? {
				// Neither props nor schema specified
				inputProps?: z.input<Schema> & Props;
			}
		: {
				// Only props specified
				inputProps: Props;
			}
	: {} extends Props
		? {
				// Only schema specified
				inputProps: z.input<Schema>;
			}
		: {
				// Props and schema specified
				inputProps: z.input<Schema> & Props;
			};

type MandatoryRenderMediaOnWebOptions<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> = {
	composition: CompositionCalculateMetadataOrExplicit<Schema, Props>;
};

export type RenderMediaOnWebProgress = {
	renderedFrames: number;
	encodedFrames: number;
	// TODO: encodedDoneIn, renderEstimatedTime, progress
};

export type RenderMediaOnWebProgressCallback = (
	progress: RenderMediaOnWebProgress,
) => void;

type OptionalRenderMediaOnWebOptions<Schema extends AnyZodObject> = {
	delayRenderTimeoutInMilliseconds: number;
	logLevel: LogLevel;
	schema: Schema | undefined;
	mediaCacheSizeInBytes: number | null;
	codec: WebRendererCodec;
	container: WebRendererContainer;
	signal: AbortSignal | null;
	onProgress: RenderMediaOnWebProgressCallback | null;
	hardwareAcceleration: 'no-preference' | 'prefer-hardware' | 'prefer-software';
	keyframeIntervalInSeconds: number;
	videoBitrate: number | WebRendererQuality;
	frameRange: FrameRange | null;
	transparent: boolean;
	onArtifact: OnArtifact | null;
	onFrame: OnFrameCallback | null;
};

export type RenderMediaOnWebOptions<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> = MandatoryRenderMediaOnWebOptions<Schema, Props> &
	Partial<OptionalRenderMediaOnWebOptions<Schema>> &
	InputPropsIfHasProps<Schema, Props>;

type InternalRenderMediaOnWebOptions<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> = MandatoryRenderMediaOnWebOptions<Schema, Props> &
	OptionalRenderMediaOnWebOptions<Schema> &
	InputPropsIfHasProps<Schema, Props>;

// TODO: More containers
// TODO: Audio
// TODO: Metadata
// TODO: Validating inputs
// TODO: Web file system API
// TODO: Apply defaultCodec

const internalRenderMediaOnWeb = async <
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
>({
	composition,
	inputProps,
	delayRenderTimeoutInMilliseconds,
	logLevel,
	mediaCacheSizeInBytes,
	schema,
	codec,
	container,
	signal,
	onProgress,
	hardwareAcceleration,
	keyframeIntervalInSeconds,
	videoBitrate,
	frameRange,
	transparent,
	onArtifact,
	onFrame,
}: InternalRenderMediaOnWebOptions<Schema, Props>) => {
	const cleanupFns: (() => void)[] = [];
	const format = containerToMediabunnyContainer(container);

	if (
		codec &&
		!format.getSupportedCodecs().includes(codecToMediabunnyCodec(codec))
	) {
		return Promise.reject(
			new Error(`Codec ${codec} is not supported for container ${container}`),
		);
	}

	const resolved = await Internals.resolveVideoConfig({
		calculateMetadata:
			(composition.calculateMetadata as CalculateMetadataFunction<
				InferProps<AnyZodObject, Record<string, unknown>>
			>) ?? null,
		signal: signal ?? new AbortController().signal,
		defaultProps: composition.defaultProps ?? {},
		inputProps: inputProps ?? {},
		compositionId: composition.id,
		compositionDurationInFrames: composition.durationInFrames ?? null,
		compositionFps: composition.fps ?? null,
		compositionHeight: composition.height ?? null,
		compositionWidth: composition.width ?? null,
	});

	const realFrameRange = getRealFrameRange(
		resolved.durationInFrames,
		frameRange,
	);

	if (signal?.aborted) {
		return Promise.reject(new Error('renderMediaOnWeb() was cancelled'));
	}

	const {delayRenderScope, div, cleanupScaffold, timeUpdater, collectAssets} =
		await createScaffold({
			width: resolved.width,
			height: resolved.height,
			fps: resolved.fps,
			durationInFrames: resolved.durationInFrames,
			Component: composition.component,
			resolvedProps: resolved.props,
			id: resolved.id,
			delayRenderTimeoutInMilliseconds,
			logLevel,
			mediaCacheSizeInBytes,
			schema: schema ?? null,
			audioEnabled: true,
			videoEnabled: true,
			initialFrame: 0,
			defaultCodec: resolved.defaultCodec,
			defaultOutName: resolved.defaultOutName,
		});

	const artifactsHandler = handleArtifacts({
		ref: collectAssets,
		onArtifact,
	});

	cleanupFns.push(() => {
		cleanupScaffold();
	});

	const output = new Output({
		format,
		target: new BufferTarget(),
	});

	try {
		if (signal?.aborted) {
			throw new Error('renderMediaOnWeb() was cancelled');
		}

		await waitForReady({
			timeoutInMilliseconds: delayRenderTimeoutInMilliseconds,
			scope: delayRenderScope,
			signal,
			apiName: 'renderMediaOnWeb',
		});

		if (signal?.aborted) {
			throw new Error('renderMediaOnWeb() was cancelled');
		}

		cleanupFns.push(() => {
			if (output.state === 'finalized' || output.state === 'canceled') {
				return;
			}

			output.cancel();
		});

		const videoSampleSource = new VideoSampleSource({
			codec: codecToMediabunnyCodec(codec),
			bitrate:
				typeof videoBitrate === 'number'
					? videoBitrate
					: getQualityForWebRendererQuality(videoBitrate),
			sizeChangeBehavior: 'deny',
			hardwareAcceleration,
			latencyMode: 'quality',
			keyFrameInterval: keyframeIntervalInSeconds,
			alpha: transparent ? 'keep' : 'discard',
		});

		cleanupFns.push(() => {
			videoSampleSource.close();
		});

		output.addVideoTrack(videoSampleSource);

		await output.start();

		if (signal?.aborted) {
			throw new Error('renderMediaOnWeb() was cancelled');
		}

		const progress: RenderMediaOnWebProgress = {
			renderedFrames: 0,
			encodedFrames: 0,
		};

		const throttledOnProgress = createThrottledProgressCallback(onProgress);

		for (let i = realFrameRange[0]; i <= realFrameRange[1]; i++) {
			timeUpdater.current?.update(i);
			await waitForReady({
				timeoutInMilliseconds: delayRenderTimeoutInMilliseconds,
				scope: delayRenderScope,
				signal,
				apiName: 'renderMediaOnWeb',
			});

			if (signal?.aborted) {
				throw new Error('renderMediaOnWeb() was cancelled');
			}

			const imageData = await createFrame({
				div,
				width: resolved.width,
				height: resolved.height,
			});

			await artifactsHandler.handle({imageData, frame: i});

			if (signal?.aborted) {
				throw new Error('renderMediaOnWeb() was cancelled');
			}

			const timestamp = Math.round(
				((i - realFrameRange[0]) / resolved.fps) * 1_000_000,
			);
			const videoFrame = new VideoFrame(imageData, {
				timestamp,
			});
			progress.renderedFrames++;
			throttledOnProgress?.({...progress});

			// Process frame through onFrame callback if provided
			let frameToEncode = videoFrame;
			if (onFrame) {
				const returnedFrame = await onFrame(videoFrame);
				frameToEncode = validateVideoFrame({
					originalFrame: videoFrame,
					returnedFrame,
					expectedWidth: resolved.width,
					expectedHeight: resolved.height,
					expectedTimestamp: timestamp,
				});
			}

			await videoSampleSource.add(new VideoSample(frameToEncode));
			progress.encodedFrames++;
			throttledOnProgress?.({...progress});

			frameToEncode.close();

			if (signal?.aborted) {
				throw new Error('renderMediaOnWeb() was cancelled');
			}
		}

		// Call progress one final time to ensure final state is reported
		onProgress?.({...progress});

		videoSampleSource.close();
		await output.finalize();

		return output.target.buffer as ArrayBuffer;
	} finally {
		cleanupFns.forEach((fn) => fn());
	}
};

export const renderMediaOnWeb = <
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
>(
	options: RenderMediaOnWebOptions<Schema, Props>,
) => {
	const container = options.container ?? 'mp4';
	const codec = options.codec ?? getDefaultVideoCodecForContainer(container);

	return internalRenderMediaOnWeb<Schema, Props>({
		...options,
		delayRenderTimeoutInMilliseconds:
			options.delayRenderTimeoutInMilliseconds ?? 30000,
		logLevel: options.logLevel ?? 'info',
		schema: options.schema ?? undefined,
		mediaCacheSizeInBytes: options.mediaCacheSizeInBytes ?? null,
		codec,
		container,
		signal: options.signal ?? null,
		onProgress: options.onProgress ?? null,
		hardwareAcceleration: options.hardwareAcceleration ?? 'no-preference',
		keyframeIntervalInSeconds: options.keyframeIntervalInSeconds ?? 5,
		videoBitrate: options.videoBitrate ?? 'medium',
		frameRange: options.frameRange ?? null,
		transparent: options.transparent ?? false,
		onArtifact: options.onArtifact ?? null,
		onFrame: options.onFrame ?? null,
	});
};
