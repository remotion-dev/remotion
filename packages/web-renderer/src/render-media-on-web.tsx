import {
	BufferTarget,
	Mp4OutputFormat,
	Output,
	QUALITY_HIGH,
	VideoSample,
	VideoSampleSource,
} from 'mediabunny';
import type {ComponentType} from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {Internals, type LogLevel} from 'remotion';
import type {AnyZodObject} from 'zod';
import {createScaffold} from './create-scaffold';
import type {
	CompositionCalculateMetadataOrExplicit,
	InferProps,
	PropsIfHasProps,
} from './props-if-has-props';
import {createFrame} from './take-screenshot';
import {waitForReady} from './wait-for-ready';

type LooseComponentType<T> = ComponentType<T> | ((props: T) => React.ReactNode);

type MandatoryRenderMediaOnWebOptions<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> = {
	component: LooseComponentType<Props>;
} & CompositionCalculateMetadataOrExplicit<Schema, Props> &
	PropsIfHasProps<Schema, Props>;

type OptionalRenderMediaOnWebOptions<Schema extends AnyZodObject> = {
	delayRenderTimeoutInMilliseconds: number;
	logLevel: LogLevel;
	schema: Schema | undefined;
	id: string | null;
	mediaCacheSizeInBytes: number | null;
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

const internalRenderMediaOnWeb = async <
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
>({
	width,
	height,
	fps,
	durationInFrames,
	component: Component,
	inputProps,
	id,
	delayRenderTimeoutInMilliseconds,
	logLevel,
	mediaCacheSizeInBytes,
	schema,
	calculateMetadata,
}: InternalRenderMediaOnWebOptions<Schema, Props>) => {
	const cleanupFns: (() => void)[] = [];

	const resolved = await Internals.resolveVideoConfig({
		calculateMetadata:
			(calculateMetadata as CalculateMetadataFunction<
				InferProps<AnyZodObject, Record<string, unknown>>
			>) ?? null,
		signal: new AbortController().signal,
		defaultProps: {},
		originalProps: inputProps ?? {},
		compositionId: id ?? 'default',
		compositionDurationInFrames: durationInFrames ?? null,
		compositionFps: fps ?? null,
		compositionHeight: height ?? null,
		compositionWidth: width ?? null,
	});

	const {delayRenderScope, div, cleanupScaffold, timeUpdater} =
		await createScaffold({
			width: resolved.width,
			height: resolved.height,
			fps: resolved.fps,
			durationInFrames: resolved.durationInFrames,
			Component,
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
		await waitForReady({
			timeoutInMilliseconds: delayRenderTimeoutInMilliseconds,
			scope: delayRenderScope,
		});

		const output = new Output({
			format: new Mp4OutputFormat(),
			target: new BufferTarget(),
		});

		cleanupFns.push(() => {
			output.cancel();
		});

		// For video, we use a CanvasSource for convenience, as we're rendering to a canvas
		const videoSampleSource = new VideoSampleSource({
			codec: 'avc',
			bitrate: QUALITY_HIGH,
			sizeChangeBehavior: 'deny',
		});

		cleanupFns.push(() => {
			videoSampleSource.close();
		});

		output.addVideoTrack(videoSampleSource);

		await output.start();

		for (let i = 0; i < resolved.durationInFrames; i++) {
			timeUpdater.current?.update(i);
			await waitForReady({
				timeoutInMilliseconds: delayRenderTimeoutInMilliseconds,
				scope: delayRenderScope,
			});

			const imageData = await createFrame({
				div,
				width: resolved.width,
				height: resolved.height,
			});
			await videoSampleSource.add(
				new VideoSample(
					new VideoFrame(imageData, {
						timestamp: (i / resolved.fps) * 1_000_000,
					}),
				),
			);
		}

		videoSampleSource.close();
		await output.finalize();

		const file = output.target.buffer;

		return file as ArrayBuffer;
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
	return internalRenderMediaOnWeb<Schema, Props>({
		...options,
		delayRenderTimeoutInMilliseconds:
			options.delayRenderTimeoutInMilliseconds ?? 30000,
		logLevel: options.logLevel ?? 'info',
		schema: options.schema ?? undefined,
		id: options.id ?? null,
		mediaCacheSizeInBytes: options.mediaCacheSizeInBytes ?? null,
	});
};
