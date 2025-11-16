import {BufferTarget, Output, VideoSample, VideoSampleSource} from 'mediabunny';
import type {CalculateMetadataFunction} from 'remotion';
import {Internals, type LogLevel} from 'remotion';
import type {AnyZodObject} from 'zod';
import {createScaffold} from './create-scaffold';
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
	PropsIfHasProps,
} from './props-if-has-props';
import {createFrame} from './take-screenshot';
import {waitForReady} from './wait-for-ready';

type MandatoryRenderMediaOnWebOptions<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> = {
	composition: CompositionCalculateMetadataOrExplicit<Schema, Props>;
} & PropsIfHasProps<Schema, Props>;

export type RenderMediaOnWebProgress = {
	renderedFrames: number;
	encodedFrames: number;
	// TODO: encodedDoneIn, renderEstimatedTime, progress
	// TODO: throttling
};

export type RenderMediaOnWebProgressCallback = (
	progress: RenderMediaOnWebProgress,
) => void;

type OptionalRenderMediaOnWebOptions<Schema extends AnyZodObject> = {
	delayRenderTimeoutInMilliseconds: number;
	logLevel: LogLevel;
	schema: Schema | undefined;
	id: string | null;
	mediaCacheSizeInBytes: number | null;
	codec: WebRendererCodec;
	container: WebRendererContainer;
	signal: AbortSignal | null;
	onProgress: RenderMediaOnWebProgressCallback | null;
	hardwareAcceleration: 'no-preference' | 'prefer-hardware' | 'prefer-software';
	keyFrameInterval: number;
	videoBitrate: number | WebRendererQuality;
};

export type RenderMediaOnWebOptions<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> = MandatoryRenderMediaOnWebOptions<Schema, Props> &
	Partial<OptionalRenderMediaOnWebOptions<Schema>>;

type InternalRenderMediaOnWebOptions<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> = MandatoryRenderMediaOnWebOptions<Schema, Props> &
	OptionalRenderMediaOnWebOptions<Schema>;

// TODO: frameRange
// TODO: More containers
// TODO: Audio
// TODO: onFrame
// TODO: Metadata
// TODO: onArtifact
// TODO: Validating inputs
// TODO: Encoding quality
// TODO: Transparency
// TODO: Web file system API
const internalRenderMediaOnWeb = async <
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
>({
	composition,
	inputProps,
	id,
	delayRenderTimeoutInMilliseconds,
	logLevel,
	mediaCacheSizeInBytes,
	schema,
	codec,
	container,
	signal,
	onProgress,
	hardwareAcceleration,
	keyFrameInterval,
	videoBitrate,
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
		defaultProps: {},
		originalProps: inputProps ?? {},
		compositionId: id ?? 'default',
		compositionDurationInFrames: composition.durationInFrames ?? null,
		compositionFps: composition.fps ?? null,
		compositionHeight: composition.height ?? null,
		compositionWidth: composition.width ?? null,
	});

	if (signal?.aborted) {
		return Promise.reject(new Error('renderMediaOnWeb() was cancelled'));
	}

	const {delayRenderScope, div, cleanupScaffold, timeUpdater} =
		await createScaffold({
			width: resolved.width,
			height: resolved.height,
			fps: resolved.fps,
			durationInFrames: resolved.durationInFrames,
			Component: composition.component,
			inputProps: inputProps ?? {},
			id: id ?? 'default',
			delayRenderTimeoutInMilliseconds,
			logLevel,
			mediaCacheSizeInBytes,
			schema: schema ?? null,
			audioEnabled: true,
			videoEnabled: true,
			initialFrame: 0,
		});

	cleanupFns.push(() => {
		cleanupScaffold();
	});

	try {
		if (signal?.aborted) {
			throw new Error('renderMediaOnWeb() was cancelled');
		}

		await waitForReady({
			timeoutInMilliseconds: delayRenderTimeoutInMilliseconds,
			scope: delayRenderScope,
			signal,
		});

		if (signal?.aborted) {
			throw new Error('renderMediaOnWeb() was cancelled');
		}

		const output = new Output({
			format,
			target: new BufferTarget(),
		});

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
			keyFrameInterval,
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

		for (let i = 0; i < resolved.durationInFrames; i++) {
			timeUpdater.current?.update(i);
			await waitForReady({
				timeoutInMilliseconds: delayRenderTimeoutInMilliseconds,
				scope: delayRenderScope,
				signal,
			});

			if (signal?.aborted) {
				throw new Error('renderMediaOnWeb() was cancelled');
			}

			const imageData = await createFrame({
				div,
				width: resolved.width,
				height: resolved.height,
			});

			if (signal?.aborted) {
				throw new Error('renderMediaOnWeb() was cancelled');
			}

			const videoFrame = new VideoFrame(imageData, {
				timestamp: Math.round((i / resolved.fps) * 1_000_000),
			});
			progress.renderedFrames++;
			onProgress?.(progress);

			await videoSampleSource.add(new VideoSample(videoFrame));
			progress.encodedFrames++;
			onProgress?.(progress);

			videoFrame.close();

			if (signal?.aborted) {
				throw new Error('renderMediaOnWeb() was cancelled');
			}
		}

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
		id: options.id ?? null,
		mediaCacheSizeInBytes: options.mediaCacheSizeInBytes ?? null,
		codec,
		container,
		signal: options.signal ?? null,
		onProgress: options.onProgress ?? null,
		hardwareAcceleration: options.hardwareAcceleration ?? 'no-preference',
		keyFrameInterval: options.keyFrameInterval ?? 5,
		videoBitrate: options.videoBitrate ?? 'medium',
	});
};
