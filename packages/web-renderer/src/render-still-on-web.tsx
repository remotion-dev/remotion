import {LicensingInternals} from '@remotion/licensing';
import type {PreferredEffectBackend} from 'remotion';
import {
	Internals,
	type CalculateMetadataFunction,
	type LogLevel,
} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import type {$ZodObject} from 'zod/v4/core';
import type {WebRendererOnArtifact} from './artifact';
import {handleArtifacts} from './artifact';
import {createBackgroundKeepalive} from './background-keepalive';
import {checkForError, createScaffold} from './create-scaffold';
import {supportsNativeHtmlInCanvas} from './html-in-canvas';
import {makeInternalState} from './internal-state';
import type {CompositionCalculateMetadataOrExplicit} from './props-if-has-props';
import type {InputPropsIfHasProps} from './render-media-on-web';
import {
	onlyOneStillRenderAtATimeQueue,
	runWithRenderQueue,
} from './render-operations-queue';
import {
	createRenderStillOnWebResult,
	type RenderStillOnWebResult,
} from './render-still-screenshot-task';
import {createLayer, type HtmlInCanvasLayerOutcome} from './take-screenshot';
import {validateScale} from './validate-scale';
import {waitForReady} from './wait-for-ready';

export type {
	RenderStillOnWebEncodeOptions,
	RenderStillOnWebImageFormat,
	RenderStillOnWebResult,
} from './render-still-screenshot-task';

type MandatoryRenderStillOnWebOptions<
	Schema extends $ZodObject,
	Props extends Record<string, unknown>,
> = {
	frame: number;
} & {
	composition: CompositionCalculateMetadataOrExplicit<Schema, Props>;
};

type OptionalRenderImagesOnWebOptions<Schema extends $ZodObject> = {
	delayRenderTimeoutInMilliseconds: number;
	logLevel: LogLevel;
	schema: Schema | undefined;
	mediaCacheSizeInBytes: number | null;
	preferredEffectBackend: PreferredEffectBackend;
	signal: AbortSignal | null;
	onArtifact: WebRendererOnArtifact | null;
	scale: number;
	allowHtmlInCanvas: boolean;
	transparent: boolean;
};

type DeprecatedRenderImagesOnWebOptions = {
	/** @deprecated Still renders are included in every Remotion License and do not send usage telemetry. */
	licenseKey?: string | null;
	/** @deprecated Still renders are included in every Remotion License and do not send usage telemetry. */
	isProduction?: boolean;
};

type InternalRenderImagesOnWebOptions<
	Schema extends $ZodObject,
	Props extends Record<string, unknown>,
> = {
	frames: number[];
} & {
	composition: CompositionCalculateMetadataOrExplicit<Schema, Props>;
} & OptionalRenderImagesOnWebOptions<Schema> &
	InputPropsIfHasProps<Schema, Props>;

export type RenderStillOnWebOptions<
	Schema extends $ZodObject,
	Props extends Record<string, unknown>,
> = MandatoryRenderStillOnWebOptions<Schema, Props> &
	Partial<OptionalRenderImagesOnWebOptions<Schema>> &
	DeprecatedRenderImagesOnWebOptions &
	InputPropsIfHasProps<Schema, Props>;

export type RenderFramesOnWebOptions<
	Schema extends $ZodObject,
	Props extends Record<string, unknown>,
> = {
	frames: number[];
} & {
	composition: CompositionCalculateMetadataOrExplicit<Schema, Props>;
} & Partial<OptionalRenderImagesOnWebOptions<Schema>> &
	DeprecatedRenderImagesOnWebOptions &
	InputPropsIfHasProps<Schema, Props>;

async function internalRenderImagesOnWeb<
	Schema extends $ZodObject,
	Props extends Record<string, unknown>,
>(
	{
		frames: requestedFrames,
		delayRenderTimeoutInMilliseconds,
		logLevel,
		inputProps,
		schema,
		mediaCacheSizeInBytes,
		preferredEffectBackend,
		composition,
		signal,
		onArtifact,
		scale,
		allowHtmlInCanvas,
		transparent,
	}: InternalRenderImagesOnWebOptions<Schema, Props>,
	apiName: 'renderStillOnWeb' | 'renderFramesOnWeb',
) {
	validateScale(scale);

	const onHtmlInCanvasLayerOutcome = (outcome: HtmlInCanvasLayerOutcome) => {
		if (outcome.native) {
			Internals.Log.warn(
				{logLevel, tag: '@remotion/web-renderer'},
				'Using Chromium experimental HTML-in-canvas (drawElementImage) for this frame. Pixels may differ from the built-in DOM composer. Set allowHtmlInCanvas: false to force software rasterization. See https://remotion.dev/docs/client-side-rendering/html-in-canvas',
			);
		} else if (outcome.shouldWarn) {
			Internals.Log.warn(
				{logLevel, tag: '@remotion/web-renderer'},
				`Not using HTML-in-canvas: ${outcome.reason}`,
			);
		}
	};

	const resolved = await Internals.resolveVideoConfig({
		calculateMetadata:
			(composition.calculateMetadata as unknown as CalculateMetadataFunction<
				Record<string, unknown>
			>) ?? null,
		signal: signal ?? new AbortController().signal,
		defaultProps: composition.defaultProps ?? {},
		inputProps: inputProps ?? {},
		compositionId: composition.id,
		compositionDurationInFrames: composition.durationInFrames ?? null,
		compositionFps: composition.fps ?? null,
		compositionHeight: composition.height ?? null,
		compositionWidth: composition.width ?? null,
		schema: schema ?? null,
	});

	const frames =
		apiName === 'renderFramesOnWeb'
			? NoReactInternals.validateSelectedFrames({
					frames: requestedFrames,
					durationInFrames: resolved.durationInFrames,
				})
			: requestedFrames;

	if (signal?.aborted) {
		return Promise.reject(new Error(`${apiName}() was cancelled`));
	}

	using internalState = makeInternalState({
		signal,
		maskImageTimeoutInMilliseconds: delayRenderTimeoutInMilliseconds,
	});

	using scaffold = createScaffold({
		sampleRate: null,
		width: resolved.width,
		height: resolved.height,
		delayRenderTimeoutInMilliseconds,
		logLevel,
		resolvedProps: resolved.props,
		id: resolved.id,
		mediaCacheSizeInBytes,
		preferredEffectBackend,
		audioEnabled: false,
		Component: composition.component,
		videoEnabled: true,
		durationInFrames: resolved.durationInFrames,
		fps: resolved.fps,
		schema: schema ?? null,
		initialFrame: frames[0],
		defaultCodec: resolved.defaultCodec,
		defaultOutName: resolved.defaultOutName,
		useHtmlInCanvas: allowHtmlInCanvas,
		pixelDensity: scale,
	});

	const {
		delayRenderScope,
		timeUpdater,
		div,
		collectAssets,
		errorHolder,
		htmlInCanvasContext,
	} = scaffold;

	if (allowHtmlInCanvas && !htmlInCanvasContext) {
		if (!supportsNativeHtmlInCanvas()) {
			onHtmlInCanvasLayerOutcome({
				native: false,
				reason:
					'This browser does not expose CanvasRenderingContext2D.prototype.drawElementImage. In Chromium, enable chrome://flags/#canvas-draw-element and use a version that ships the API.',
				shouldWarn: false,
			});
		} else {
			onHtmlInCanvasLayerOutcome({
				native: false,
				reason:
					'drawElementImage is available but canvas.requestPaint() is missing. Use a Chromium version that ships requestPaint.',
				shouldWarn: true,
			});
		}
	} else if (!allowHtmlInCanvas) {
		onHtmlInCanvasLayerOutcome({
			native: false,
			reason: 'allowHtmlInCanvas is false; using the built-in DOM composer.',
			shouldWarn: false,
		});
	}

	const artifactsHandler = handleArtifacts();
	using keepalive = createBackgroundKeepalive({
		fps: resolved.fps,
		logLevel,
	});
	const waitForRenderReady = async () => {
		await waitForReady({
			timeoutInMilliseconds: delayRenderTimeoutInMilliseconds,
			scope: delayRenderScope,
			signal,
			apiName,
			internalState: null,
			keepalive,
		});
		checkForError(errorHolder);
	};

	const results: RenderStillOnWebResult[] = [];
	for (const [index, frame] of frames.entries()) {
		if (signal?.aborted) {
			throw new Error(`${apiName}() was cancelled`);
		}

		if (index > 0) {
			timeUpdater.current!.update(frame);
		}

		await waitForRenderReady();

		if (signal?.aborted) {
			throw new Error(`${apiName}() was cancelled`);
		}

		const capturedFrame = await createLayer({
			element: div,
			transparent,
			scale,
			logLevel,
			internalState,
			onlyBackgroundClipText: false,
			cutout: new DOMRect(0, 0, resolved.width, resolved.height),
			htmlInCanvasContext,
			onHtmlInCanvasLayerOutcome: htmlInCanvasContext
				? onHtmlInCanvasLayerOutcome
				: undefined,
			waitForPageResponsiveness: null,
		});

		const {canvas} = capturedFrame;

		const assets = collectAssets.current!.collectAssets();
		if (onArtifact) {
			await artifactsHandler.handle({
				imageData: canvas,
				frame,
				assets,
				onArtifact,
			});
		}

		results.push(createRenderStillOnWebResult({canvas, internalState}));
	}

	return results;
}

const renderImagesOnWeb = <
	Schema extends $ZodObject,
	Props extends Record<string, unknown>,
>(
	options: RenderFramesOnWebOptions<Schema, Props>,
	apiName: 'renderStillOnWeb' | 'renderFramesOnWeb',
): Promise<RenderStillOnWebResult[]> => {
	const logLevel =
		options.logLevel ?? globalThis.window?.remotion_logLevel ?? 'info';
	LicensingInternals.logDeprecatedStillRenderLicenseKey({
		licenseKey: options.licenseKey ?? null,
		api: `${apiName}()`,
		option: 'licenseKey',
		logLevel,
	});

	return runWithRenderQueue({
		queue: onlyOneStillRenderAtATimeQueue,
		signal: options.signal ?? null,
		createCancellationError: () => new Error(`${apiName}() was cancelled`),
		render: () =>
			internalRenderImagesOnWeb<Schema, Props>(
				{
					...options,
					delayRenderTimeoutInMilliseconds:
						options.delayRenderTimeoutInMilliseconds ?? 30000,
					logLevel,
					schema: options.schema ?? undefined,
					mediaCacheSizeInBytes: options.mediaCacheSizeInBytes ?? null,
					preferredEffectBackend: options.preferredEffectBackend ?? 'auto',
					signal: options.signal ?? null,
					onArtifact: options.onArtifact ?? null,
					scale: options.scale ?? 1,
					allowHtmlInCanvas: options.allowHtmlInCanvas ?? false,
					transparent: options.transparent ?? true,
				},
				apiName,
			),
	});
};

export const renderStillOnWeb = <
	Schema extends $ZodObject,
	Props extends Record<string, unknown>,
>(
	options: RenderStillOnWebOptions<Schema, Props>,
): Promise<RenderStillOnWebResult> => {
	return renderImagesOnWeb<Schema, Props>(
		{...options, frames: [options.frame]},
		'renderStillOnWeb',
	).then((results) => results[0]);
};

export const renderFramesOnWeb = <
	Schema extends $ZodObject,
	Props extends Record<string, unknown>,
>(
	options: RenderFramesOnWebOptions<Schema, Props>,
): Promise<RenderStillOnWebResult[]> => {
	return renderImagesOnWeb<Schema, Props>(options, 'renderFramesOnWeb');
};
