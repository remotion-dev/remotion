import {type ComponentType} from 'react';
import type {LogLevel} from 'remotion';
import type {AnyZodObject} from 'zod';
import {createScaffold} from './create-scaffold';
import type {PropsIfHasProps} from './props-if-has-props';
import {takeScreenshot} from './take-screenshot';
import {waitForReady} from './wait-for-ready';

type LooseComponentType<T> = ComponentType<T> | ((props: T) => React.ReactNode);

export type RenderStillOnWebImageFormat = 'png' | 'jpeg' | 'webp';

type MandatoryRenderStillOnWebOptions<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> = {
	component: LooseComponentType<Props>;
	width: number;
	height: number;
	fps: number;
	durationInFrames: number;
	frame: number;
	imageFormat: RenderStillOnWebImageFormat;
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
	component: Component,
	width,
	height,
	fps,
	durationInFrames,
	frame,
	delayRenderTimeoutInMilliseconds,
	logLevel,
	inputProps,
	id,
	schema,
	imageFormat,
	mediaCacheSizeInBytes,
}: InternalRenderStillOnWebOptions<Schema, Props>) {
	const {delayRenderScope, div, cleanupScaffold} = await createScaffold({
		width,
		height,
		delayRenderTimeoutInMilliseconds,
		logLevel,
		inputProps: inputProps ?? {},
		id,
		mediaCacheSizeInBytes,
		audioEnabled: false,
		Component,
		videoEnabled: true,
		durationInFrames,
		fps,
		schema: schema ?? null,
		initialFrame: frame,
	});

	try {
		await waitForReady({
			timeoutInMilliseconds: delayRenderTimeoutInMilliseconds,
			scope: delayRenderScope,
		});

		const imageData = await takeScreenshot({div, width, height, imageFormat});

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
