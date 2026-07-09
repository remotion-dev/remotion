import {
	Internals,
	type CalculateMetadataFunction,
	type LogLevel,
} from 'remotion';
import type {$ZodObject} from 'zod/v4/core';
import type {WebRendererOnArtifact} from './artifact';
import {handleArtifacts} from './artifact';
import {checkForError, createScaffold} from './create-scaffold';
import {supportsNativeHtmlInCanvas} from './html-in-canvas';
import {makeInternalState} from './internal-state';
import type {CompositionCalculateMetadataOrExplicit} from './props-if-has-props';
import type {InputPropsIfHasProps} from './render-media-on-web';
import {onlyOneRenderAtATimeQueue} from './render-operations-queue';
import {
	createRenderStillOnWebResult,
	type RenderStillOnWebResult,
} from './render-still-screenshot-task';
import {sendUsageEvent} from './send-telemetry-event';
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

type OptionalRenderStillOnWebOptions<Schema extends $ZodObject> = {
	delayRenderTimeoutInMilliseconds: number;
	logLevel: LogLevel;
	schema: Schema | undefined;
	mediaCacheSizeInBytes: number | null;
	signal: AbortSignal | null;
	onArtifact: WebRendererOnArtifact | null;
	licenseKey: string | null;
	scale: number;
	isProduction: boolean;
	allowHtmlInCanvas: boolean;
};

type InternalRenderStillOnWebOptions<
	Schema extends $ZodObject,
	Props extends Record<string, unknown>,
> = MandatoryRenderStillOnWebOptions<Schema, Props> &
	OptionalRenderStillOnWebOptions<Schema> &
	InputPropsIfHasProps<Schema, Props>;

export type RenderStillOnWebOptions<
	Schema extends $ZodObject,
	Props extends Record<string, unknown>,
> = MandatoryRenderStillOnWebOptions<Schema, Props> &
	Partial<OptionalRenderStillOnWebOptions<Schema>> &
	InputPropsIfHasProps<Schema, Props>;

async function internalRenderStillOnWeb<
	Schema extends $ZodObject,
	Props extends Record<string, unknown>,
>({
	frame,
	delayRenderTimeoutInMilliseconds,
	logLevel,
	inputProps,
	schema,
	mediaCacheSizeInBytes,
	composition,
	signal,
	onArtifact,
	licenseKey,
	scale,
	isProduction,
	allowHtmlInCanvas,
}: InternalRenderStillOnWebOptions<Schema, Props>) {
	validateScale(scale);

	const onHtmlInCanvasLayerOutcome = (outcome: HtmlInCanvasLayerOutcome) => {
		if (outcome.native) {
			Internals.Log.warn(
				{logLevel, tag: '@remotion/web-renderer'},
				'Using Chromium experimental HTML-in-canvas (drawElementImage) for this frame. Pixels may differ from the built-in DOM composer. Set allowHtmlInCanvas: false to force software rasterization. See https://github.com/WICG/html-in-canvas',
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
	});

	if (signal?.aborted) {
		return Promise.reject(new Error('renderStillOnWeb() was cancelled'));
	}

	using internalState = makeInternalState();

	using scaffold = createScaffold({
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
		allowHtmlInCanvas,
		pixelDensity: scale,
	});

	const {
		delayRenderScope,
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

	try {
		if (signal?.aborted) {
			throw new Error('renderStillOnWeb() was cancelled');
		}

		await waitForReady({
			timeoutInMilliseconds: delayRenderTimeoutInMilliseconds,
			scope: delayRenderScope,
			signal,
			apiName: 'renderStillOnWeb',
			internalState: null,
			keepalive: null,
		});
		checkForError(errorHolder);

		if (signal?.aborted) {
			throw new Error('renderStillOnWeb() was cancelled');
		}

		const capturedFrame = await createLayer({
			element: div,
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

		sendUsageEvent({
			licenseKey: licenseKey ?? null,
			succeeded: true,
			apiName: 'renderStillOnWeb',
			isStill: true,
			isProduction,
		});

		return createRenderStillOnWebResult({canvas, internalState});
	} catch (err) {
		if (!signal?.aborted) {
			sendUsageEvent({
				succeeded: false,
				licenseKey: licenseKey ?? null,
				apiName: 'renderStillOnWeb',
				isStill: true,
				isProduction,
			}).catch((err2) => {
				Internals.Log.error(
					{logLevel: 'error', tag: 'web-renderer'},
					'Failed to send usage event',
					err2,
				);
			});
		}

		throw err;
	}
}

export const renderStillOnWeb = <
	Schema extends $ZodObject,
	Props extends Record<string, unknown>,
>(
	options: RenderStillOnWebOptions<Schema, Props>,
): Promise<RenderStillOnWebResult> => {
	onlyOneRenderAtATimeQueue.ref = onlyOneRenderAtATimeQueue.ref
		.catch(() => Promise.resolve())
		.then(() =>
			internalRenderStillOnWeb<Schema, Props>({
				...options,
				delayRenderTimeoutInMilliseconds:
					options.delayRenderTimeoutInMilliseconds ?? 30000,
				logLevel: options.logLevel ?? window.remotion_logLevel ?? 'info',
				schema: options.schema ?? undefined,
				mediaCacheSizeInBytes: options.mediaCacheSizeInBytes ?? null,
				signal: options.signal ?? null,
				onArtifact: options.onArtifact ?? null,
				// Must allow undefined to print warning
				licenseKey: options.licenseKey ?? null,
				scale: options.scale ?? 1,
				isProduction: options.isProduction ?? true,
				allowHtmlInCanvas: options.allowHtmlInCanvas ?? false,
			}),
		);

	return onlyOneRenderAtATimeQueue.ref as Promise<RenderStillOnWebResult>;
};
