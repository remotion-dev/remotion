import {
	Internals,
	type CalculateMetadataFunction,
	type LogLevel,
} from 'remotion';
import type {AnyZodObject} from 'zod';
import type {OnArtifact} from './artifact';
import {handleArtifacts} from './artifact';
import {createScaffold} from './create-scaffold';
import type {
	CompositionCalculateMetadataOrExplicit,
	InferProps,
} from './props-if-has-props';
import type {InputPropsIfHasProps} from './render-media-on-web';
import {sendUsageEvent} from './send-telemetry-event';
import {takeScreenshot} from './take-screenshot';
import {waitForReady} from './wait-for-ready';

export type RenderStillOnWebImageFormat = 'png' | 'jpeg' | 'webp';

type MandatoryRenderStillOnWebOptions<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> = {
	frame: number;
	imageFormat: RenderStillOnWebImageFormat;
} & {
	composition: CompositionCalculateMetadataOrExplicit<Schema, Props>;
};

type OptionalRenderStillOnWebOptions<Schema extends AnyZodObject> = {
	delayRenderTimeoutInMilliseconds: number;
	logLevel: LogLevel;
	schema: Schema | undefined;
	mediaCacheSizeInBytes: number | null;
	signal: AbortSignal | null;
	onArtifact: OnArtifact | null;
	licenseKey: string | null;
};

type InternalRenderStillOnWebOptions<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> = MandatoryRenderStillOnWebOptions<Schema, Props> &
	OptionalRenderStillOnWebOptions<Schema> &
	InputPropsIfHasProps<Schema, Props>;

export type RenderStillOnWebOptions<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> = MandatoryRenderStillOnWebOptions<Schema, Props> &
	Partial<OptionalRenderStillOnWebOptions<Schema>> &
	InputPropsIfHasProps<Schema, Props>;

async function internalRenderStillOnWeb<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
>({
	frame,
	delayRenderTimeoutInMilliseconds,
	logLevel,
	inputProps,
	schema,
	imageFormat,
	mediaCacheSizeInBytes,
	composition,
	signal,
	onArtifact,
	licenseKey,
}: InternalRenderStillOnWebOptions<Schema, Props>) {
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

	if (signal?.aborted) {
		return Promise.reject(new Error('renderStillOnWeb() was cancelled'));
	}

	const {delayRenderScope, div, cleanupScaffold, collectAssets} =
		await createScaffold({
			width: resolved.width,
			height: resolved.height,
			delayRenderTimeoutInMilliseconds,
			logLevel,
			resolvedProps: resolved.props,
			id: resolved.id,
			mediaCacheSizeInBytes,
			audioEnabled: false,
			Component: composition.component,
			videoEnabled: true,
			durationInFrames: resolved.durationInFrames,
			fps: resolved.fps,
			schema: schema ?? null,
			initialFrame: frame,
			defaultCodec: resolved.defaultCodec,
			defaultOutName: resolved.defaultOutName,
		});

	const artifactsHandler = handleArtifacts();

	try {
		if (signal?.aborted) {
			throw new Error('renderStillOnWeb() was cancelled');
		}

		await waitForReady({
			timeoutInMilliseconds: delayRenderTimeoutInMilliseconds,
			scope: delayRenderScope,
			signal,
			apiName: 'renderStillOnWeb',
		});

		if (signal?.aborted) {
			throw new Error('renderStillOnWeb() was cancelled');
		}

		const imageData = await takeScreenshot({
			div,
			width: resolved.width,
			height: resolved.height,
			imageFormat,
		});

		const assets = collectAssets.current!.collectAssets();
		if (onArtifact) {
			await artifactsHandler.handle({imageData, frame, assets, onArtifact});
		}

		await sendUsageEvent({
			licenseKey,
			succeeded: true,
		});

		return imageData;
	} finally {
		cleanupScaffold();
	}
}

export const renderStillOnWeb = <
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
>(
	options: RenderStillOnWebOptions<Schema, Props>,
) => {
	return internalRenderStillOnWeb<Schema, Props>({
		...options,
		delayRenderTimeoutInMilliseconds:
			options.delayRenderTimeoutInMilliseconds ?? 30000,
		logLevel: options.logLevel ?? 'info',
		schema: options.schema ?? undefined,
		mediaCacheSizeInBytes: options.mediaCacheSizeInBytes ?? null,
		signal: options.signal ?? null,
		onArtifact: options.onArtifact ?? null,
		licenseKey: options.licenseKey ?? null,
	});
};
