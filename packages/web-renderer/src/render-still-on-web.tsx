import {
	Internals,
	type CalculateMetadataFunction,
	type LogLevel,
} from 'remotion';
import type {AnyZodObject} from 'zod';
import {createScaffold} from './create-scaffold';
import type {
	CompositionCalculateMetadataOrExplicit,
	InferProps,
	PropsIfHasProps,
} from './props-if-has-props';
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
} & PropsIfHasProps<Schema, Props>;

type OptionalRenderStillOnWebOptions<Schema extends AnyZodObject> = {
	delayRenderTimeoutInMilliseconds: number;
	logLevel: LogLevel;
	schema: Schema | undefined;
	id: string | null;
	mediaCacheSizeInBytes: number | null;
};

type InternalRenderStillOnWebOptions<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> = MandatoryRenderStillOnWebOptions<Schema, Props> &
	OptionalRenderStillOnWebOptions<Schema>;

export type RenderStillOnWebOptions<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> = MandatoryRenderStillOnWebOptions<Schema, Props> &
	Partial<OptionalRenderStillOnWebOptions<Schema>>;

async function internalRenderStillOnWeb<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
>({
	frame,
	delayRenderTimeoutInMilliseconds,
	logLevel,
	inputProps,
	id,
	schema,
	imageFormat,
	mediaCacheSizeInBytes,
	composition,
}: InternalRenderStillOnWebOptions<Schema, Props>) {
	const resolved = await Internals.resolveVideoConfig({
		calculateMetadata:
			(composition.calculateMetadata as CalculateMetadataFunction<
				InferProps<AnyZodObject, Record<string, unknown>>
			>) ?? null,
		signal: new AbortController().signal,
		defaultProps: {},
		originalProps: inputProps ?? {},
		compositionId: id ?? 'default',
		compositionDurationInFrames: composition.durationInFrames ?? null,
		compositionFps: composition.fps ?? null,
		compositionHeight: composition.height ?? null,
		compositionWidth: composition.width ?? null,
	});

	const {delayRenderScope, div, cleanupScaffold} = await createScaffold({
		width: resolved.width,
		height: resolved.height,
		delayRenderTimeoutInMilliseconds,
		logLevel,
		inputProps: inputProps ?? {},
		id: id ?? 'default',
		mediaCacheSizeInBytes,
		audioEnabled: false,
		Component: composition.component,
		videoEnabled: true,
		durationInFrames: resolved.durationInFrames,
		fps: resolved.fps,
		schema: schema ?? null,
		initialFrame: frame,
	});

	try {
		await waitForReady({
			timeoutInMilliseconds: delayRenderTimeoutInMilliseconds,
			scope: delayRenderScope,
		});

		const imageData = await takeScreenshot({
			div,
			width: resolved.width,
			height: resolved.height,
			imageFormat,
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
		id: options.id ?? null,
		mediaCacheSizeInBytes: options.mediaCacheSizeInBytes ?? null,
	});
};
