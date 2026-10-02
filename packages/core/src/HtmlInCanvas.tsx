import React, {
	createContext,
	forwardRef,
	useCallback,
	useContext,
	useLayoutEffect,
	useMemo,
	useRef,
} from 'react';
import type {SequenceControls} from './CompositionManager.js';
import type {EffectsProp} from './effects/effect-types.js';
import {runEffectChain} from './effects/run-effect-chain.js';
import {useEffectChainState} from './effects/use-effect-chain-state.js';
import {
	useMemoizedEffectDefinitions,
	useMemoizedEffects,
} from './effects/use-memoized-effects.js';
import {addSequenceStackTraces} from './enable-sequence-stack-traces.js';
import {Freeze} from './freeze.js';
import type {
	InteractiveBaseProps,
	InteractiveCropProps,
} from './Interactive.js';
import {
	backgroundSchema,
	baseSchema,
	premountSchema,
	borderRadiusSchema,
	borderSchema,
	cropSchema,
	transformSchema,
	type InteractivitySchema,
} from './interactivity-schema.js';
import {resolveSequenceDuration} from './resolve-sequence-duration.js';
import {Sequence} from './Sequence.js';
import type {AbsoluteFillLayout} from './Sequence.js';
import {useCropStyle} from './use-crop-style.js';
import {useDelayRender} from './use-delay-render.js';
import {usePremounting} from './use-premounting.js';
import {useRemotionEnvironment} from './use-remotion-environment.js';
import {withInteractivitySchema} from './with-interactivity-schema.js';

// IDL: https://github.com/WICG/html-in-canvas#idl-changes
// WebGPU's `drawElementImageToTexture` is omitted — `GPUQueue` is not in
// lib.dom.d.ts and would require pulling in `@webgpu/types`.
declare global {
	interface DrawElementImageOptions {
		preserveElementGeometry?: boolean;
	}

	interface WebGLCopyElementImageConfig {
		sx?: GLfloat;
		sy?: GLfloat;
		swidth?: GLfloat;
		sheight?: GLfloat;
		width?: GLsizei;
		height?: GLsizei;
	}

	interface UpdateElementGeometryOptions {
		preserveHitTestOrder?: boolean;
		clip?: DOMRectInit;
		canvasTransform?: DOMMatrixInit;
	}

	interface ElementImage {
		readonly width: number;
		readonly height: number;
		close(): void;
	}

	interface CanvasRenderingContext2D {
		drawElementImage(
			element: Element | ElementImage,
			dx: number,
			dy: number,
			options?: DrawElementImageOptions,
		): void;
		drawElementImage(
			element: Element | ElementImage,
			dx: number,
			dy: number,
			dwidth: number,
			dheight: number,
			options?: DrawElementImageOptions,
		): void;
		drawElementImage(
			element: Element | ElementImage,
			sx: number,
			sy: number,
			swidth: number,
			sheight: number,
			dx: number,
			dy: number,
			options?: DrawElementImageOptions,
		): void;
		drawElementImage(
			element: Element | ElementImage,
			sx: number,
			sy: number,
			swidth: number,
			sheight: number,
			dx: number,
			dy: number,
			dwidth: number,
			dheight: number,
			options?: DrawElementImageOptions,
		): void;
	}

	interface OffscreenCanvasRenderingContext2D {
		drawElementImage(
			element: Element | ElementImage,
			dx: number,
			dy: number,
			options?: DrawElementImageOptions,
		): void;
		drawElementImage(
			element: Element | ElementImage,
			dx: number,
			dy: number,
			dwidth: number,
			dheight: number,
			options?: DrawElementImageOptions,
		): void;
		drawElementImage(
			element: Element | ElementImage,
			sx: number,
			sy: number,
			swidth: number,
			sheight: number,
			dx: number,
			dy: number,
			options?: DrawElementImageOptions,
		): void;
		drawElementImage(
			element: Element | ElementImage,
			sx: number,
			sy: number,
			swidth: number,
			sheight: number,
			dx: number,
			dy: number,
			dwidth: number,
			dheight: number,
			options?: DrawElementImageOptions,
		): void;
	}

	// Augmenting the base interface applies to both WebGL1 and WebGL2.
	interface WebGLRenderingContextBase {
		texElementSubImage2D(
			target: GLenum,
			level: GLint,
			xoffset: GLint,
			yoffset: GLint,
			element: Element | ElementImage,
			config?: WebGLCopyElementImageConfig,
		): void;

		// Older Chromium builds expose texElementImage2D during the migration.
		texElementImage2D(
			target: GLenum,
			level: GLint,
			internalformat: GLint,
			format: GLenum,
			type: GLenum,
			element: Element | ElementImage,
		): void;
		texElementImage2D(
			target: GLenum,
			level: GLint,
			internalformat: GLint,
			width: GLsizei,
			height: GLsizei,
			format: GLenum,
			type: GLenum,
			element: Element | ElementImage,
		): void;
		texElementImage2D(
			target: GLenum,
			level: GLint,
			internalformat: GLint,
			sx: GLfloat,
			sy: GLfloat,
			swidth: GLfloat,
			sheight: GLfloat,
			format: GLenum,
			type: GLenum,
			element: Element | ElementImage,
		): void;
		texElementImage2D(
			target: GLenum,
			level: GLint,
			internalformat: GLint,
			sx: GLfloat,
			sy: GLfloat,
			swidth: GLfloat,
			sheight: GLfloat,
			width: GLsizei,
			height: GLsizei,
			format: GLenum,
			type: GLenum,
			element: Element | ElementImage,
		): void;
	}

	interface HTMLCanvasElementEventMap {
		paint: Event;
	}

	interface HTMLCanvasElement {
		content: string;
		layoutSubtree?: boolean;
		onpaint: ((this: HTMLCanvasElement, ev: Event) => unknown) | null;
		requestPaint?(): void;
		captureElementImage(element: Element): ElementImage;
		updateElementGeometry(
			element: Element | ElementImage,
			options?: UpdateElementGeometryOptions,
		): void;
		clearElementGeometry(element: Element | ElementImage): void;
		getElementTransform(element: Element): DOMMatrix;
	}

	interface OffscreenCanvas {
		updateElementGeometry(
			element: Element | ElementImage,
			options?: UpdateElementGeometryOptions,
		): void;
		clearElementGeometry(element: Element | ElementImage): void;
	}
}

export type HtmlInCanvasOnPaintParams = {
	/**
	 * The `OffscreenCanvas` from {@link HTMLCanvasElement.transferControlToOffscreen}
	 * on the layout `<canvas>` (same logical canvas as the forwarded ref).
	 */
	readonly canvas: OffscreenCanvas;
	readonly element: HTMLDivElement;
	readonly elementImage: ElementImage;
	readonly pixelDensity: number;
};

// `transferControlToOffscreen()` may only be called once per canvas — a second
// call throws an `InvalidStateError`. The layout effect that needs the
// `OffscreenCanvas` can run more than once for the same canvas element: its
// dependencies (e.g. the paint callback) can change identity without the
// canvas remounting, and React StrictMode intentionally double-invokes
// effects. Cache the transferred `OffscreenCanvas` per canvas element so
// re-runs reuse it instead of throwing.
const transferredOffscreenCanvases = new WeakMap<
	HTMLCanvasElement,
	OffscreenCanvas
>();

const getTransferredOffscreenCanvas = (
	canvas: HTMLCanvasElement,
): OffscreenCanvas => {
	const existing = transferredOffscreenCanvases.get(canvas);
	if (existing) {
		return existing;
	}

	const offscreen = canvas.transferControlToOffscreen();
	transferredOffscreenCanvases.set(canvas, offscreen);
	return offscreen;
};

// Memoize the support check across the session — neither the platform
// capability nor the chrome://flags toggle can change between calls.
// SSR results are not cached so the check runs again once `document` exists.
let cachedSupport: boolean | null = null;

export const isHtmlInCanvasSupported = (): boolean => {
	if (cachedSupport !== null) {
		return cachedSupport;
	}

	if (typeof document === 'undefined') {
		return false;
	}

	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	cachedSupport =
		typeof ctx?.drawElementImage === 'function' &&
		typeof canvas.requestPaint === 'function' &&
		typeof canvas.captureElementImage === 'function' &&
		'transferControlToOffscreen' in HTMLCanvasElement.prototype;
	return cachedSupport;
};

const MINIMUM_CHROME_VERSION_FOR_NESTED_HTML_IN_CANVAS = 157;

export const isHtmlInCanvasNestingSupported = (): boolean => {
	if (!isHtmlInCanvasSupported() || typeof navigator === 'undefined') {
		return false;
	}

	const chromeVersion = navigator.userAgent.match(
		/(?:Chrome|Chromium)\/(\d+)/,
	)?.[1];
	return (
		chromeVersion !== undefined &&
		Number(chromeVersion) >= MINIMUM_CHROME_VERSION_FOR_NESTED_HTML_IN_CANVAS
	);
};

/** Generic fallback for consumers that cannot inspect the current browser. */
export const HTML_IN_CANVAS_UNSUPPORTED_MESSAGE =
	'HTML in Canvas requires Chrome 149 or newer with Canvas Draw Element enabled at chrome://flags/#canvas-draw-element.';

export const getHtmlInCanvasUnsupportedMessage = (): string => {
	if (typeof document === 'undefined') {
		return `HTML in Canvas is unavailable because there is no browser document. ${HTML_IN_CANVAS_UNSUPPORTED_MESSAGE}`;
	}

	const userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent;
	const chromiumVersion = userAgent.match(/(?:Chrome|Chromium)\/(\d+)/)?.[1];
	let browser = 'this browser';
	if (userAgent.includes('Edg/')) {
		browser = 'Microsoft Edge';
	} else if (userAgent.includes('Chromium/')) {
		browser = 'Chromium';
	} else if (chromiumVersion) {
		browser = 'Chrome';
	} else if (userAgent.includes('Firefox/')) {
		browser = 'Firefox';
	} else if (userAgent.includes('Safari/')) {
		browser = 'Safari';
	}

	if (chromiumVersion && Number(chromiumVersion) >= 149) {
		const flagUrl =
			browser === 'Microsoft Edge'
				? 'edge://flags/#canvas-draw-element'
				: 'chrome://flags/#canvas-draw-element';
		return `HTML in Canvas is unavailable. Enable Canvas Draw Element at ${flagUrl} and fully restart ${browser}.`;
	}

	if (chromiumVersion) {
		return `HTML in Canvas is not supported in ${browser} ${chromiumVersion}. Use a Chromium-based browser running version 149 or newer.`;
	}

	return `HTML in Canvas is not supported in ${browser}. Use Chrome 149 or newer.`;
};

export type HtmlInCanvasOnPaint = (
	params: HtmlInCanvasOnPaintParams,
) => void | Promise<void>;

export type HtmlInCanvasOnInitCleanup = () => void;

export type HtmlInCanvasOnInit = (
	params: HtmlInCanvasOnPaintParams,
) => HtmlInCanvasOnInitCleanup | Promise<HtmlInCanvasOnInitCleanup>;

export type HtmlInCanvasPixelDensity = number;

function assertHtmlInCanvasDimensions(width: unknown, height: unknown): void {
	if (typeof width !== 'number' || typeof height !== 'number') {
		throw new Error(
			`HtmlInCanvas: \`width\` and \`height\` must be numbers. Received width=${String(width)}, height=${String(height)}.`,
		);
	}

	if (!Number.isInteger(width) || width <= 0) {
		throw new Error(
			`HtmlInCanvas: \`width\` must be a positive integer. Received: ${String(width)}.`,
		);
	}

	if (!Number.isInteger(height) || height <= 0) {
		throw new Error(
			`HtmlInCanvas: \`height\` must be a positive integer. Received: ${String(height)}.`,
		);
	}
}

function resolveHtmlInCanvasPixelDensity(
	pixelDensity: HtmlInCanvasPixelDensity | undefined,
): number {
	if (pixelDensity === undefined) {
		return 1;
	}

	if (
		typeof pixelDensity !== 'number' ||
		!Number.isFinite(pixelDensity) ||
		pixelDensity <= 0
	) {
		throw new Error(
			`HtmlInCanvas: \`pixelDensity\` must be a positive finite number. Received: ${String(pixelDensity)}.`,
		);
	}

	return pixelDensity;
}

const isMissingPaintRecordError = (error: unknown): boolean => {
	return error instanceof DOMException && error.name === 'InvalidStateError';
};

const missingPaintRecordMessage =
	'HtmlInCanvas: Expected the element to be inside the viewport during rendering, but Chrome had no cached paint record for it.';

type HtmlInCanvasPaintTarget = HTMLCanvasElement | OffscreenCanvas;

const resizePaintTarget = ({
	target,
	width,
	height,
}: {
	target: HtmlInCanvasPaintTarget;
	width: number;
	height: number;
}) => {
	if (target.width !== width) {
		target.width = width;
	}

	if (target.height !== height) {
		target.height = height;
	}
};

const defaultOnPaint = ({
	canvas,
	elementImage,
}: Omit<HtmlInCanvasOnPaintParams, 'canvas'> & {
	readonly canvas: HtmlInCanvasPaintTarget;
}) => {
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Failed to acquire 2D context for <HtmlInCanvas> canvas');
	}

	ctx.reset();
	ctx.drawElementImage(elementImage, 0, 0);
};

/* eslint-disable react/require-default-props -- optional fields mirror `<Sequence>` / canvas hooks API */
export type HtmlInCanvasProps = Omit<InteractiveBaseProps, 'children'> &
	InteractiveCropProps &
	Omit<AbsoluteFillLayout, 'layout'> & {
		readonly durationInFrames?: number;
		readonly width: number;
		readonly height: number;
		readonly effects?: EffectsProp;
		readonly children: React.ReactNode;
		readonly onPaint?: HtmlInCanvasOnPaint;
		readonly onInit?: HtmlInCanvasOnInit;
		readonly pixelDensity?: HtmlInCanvasPixelDensity;
		// captureElementImage() only accepts immediate children of the layout canvas.
		readonly _remotionInternalCanvasSiblings?: React.ReactNode;
	};
/* eslint-enable react/require-default-props */

const HtmlInCanvasAncestorContext = createContext(false);

type HtmlInCanvasContentProps = {
	readonly width: number;
	readonly height: number;
	readonly effects: EffectsProp;
	readonly children: React.ReactNode;
	readonly canvasSiblings: React.ReactNode | null;
	readonly onPaint: HtmlInCanvasOnPaint | undefined;
	readonly onInit: HtmlInCanvasOnInit | undefined;
	readonly pixelDensity: HtmlInCanvasPixelDensity | undefined;
	readonly controls: SequenceControls | undefined;
	readonly style: React.CSSProperties | undefined;
};

const HtmlInCanvasContent = forwardRef<
	HTMLCanvasElement,
	HtmlInCanvasContentProps
>(
	(
		{
			width,
			height,
			effects,
			children,
			canvasSiblings,
			onPaint,
			onInit,
			pixelDensity,
			controls,
			style,
		},
		ref,
	) => {
		const isInsideAncestorHtmlInCanvas = useContext(
			HtmlInCanvasAncestorContext,
		);
		assertHtmlInCanvasDimensions(width, height);
		if (isInsideAncestorHtmlInCanvas && !isHtmlInCanvasNestingSupported()) {
			throw new Error(
				`Nested <HtmlInCanvas> components require Chrome ${MINIMUM_CHROME_VERSION_FOR_NESTED_HTML_IN_CANVAS} or newer with HTML-in-canvas enabled.`,
			);
		}

		const resolvedPixelDensity = resolveHtmlInCanvasPixelDensity(pixelDensity);
		const canvasWidth = Math.ceil(width * resolvedPixelDensity);
		const canvasHeight = Math.ceil(height * resolvedPixelDensity);
		const {delayRender, continueRender, cancelRender} = useDelayRender();
		const {isClientSideRendering, isRendering} = useRemotionEnvironment();
		const canRetryMissingPaintRecord = !isRendering || isClientSideRendering;
		const usesDirectLayoutCanvas =
			onPaint === undefined && onInit === undefined;

		if (!isHtmlInCanvasSupported()) {
			cancelRender(new Error(getHtmlInCanvasUnsupportedMessage()));
		}

		const canvas2dRef = useRef<HTMLCanvasElement | null>(null);
		const paintTargetRef = useRef<HtmlInCanvasPaintTarget | null>(null);
		const divRef = useRef<HTMLDivElement | null>(null);
		const canvasSizeKey = `${width}x${height}@${resolvedPixelDensity}-${usesDirectLayoutCanvas ? 'direct' : 'offscreen'}`;

		const setLayoutCanvasRef = useCallback(
			(node: HTMLCanvasElement | null) => {
				canvas2dRef.current = node;
				if (typeof ref === 'function') {
					ref(node);
				} else if (ref) {
					(ref as React.RefObject<HTMLCanvasElement | null>).current = node;
				}
			},
			[ref],
		);

		const chainState = useEffectChainState();

		const memoizedEffects = useMemoizedEffects({
			effects,
			overrideId: controls?.overrideId ?? null,
		});

		// Refs so the paint handler always reads fresh values.
		const effectsRef = useRef(memoizedEffects);
		effectsRef.current = memoizedEffects;
		const onPaintRef = useRef(onPaint);
		onPaintRef.current = onPaint;
		const onInitRef = useRef(onInit);
		onInitRef.current = onInit;
		const initializedRef = useRef(false);
		const onInitCleanupRef = useRef<HtmlInCanvasOnInitCleanup | null>(null);
		const unmountedRef = useRef(false);

		const onPaintCb = useCallback(async () => {
			const element = divRef.current;

			if (!element) {
				throw new Error('Canvas or scene element not found');
			}

			const paintTarget = paintTargetRef.current;
			if (!paintTarget) {
				throw new Error(
					'HtmlInCanvas: paint target is not ready because the canvas is remounting',
				);
			}

			resizePaintTarget({
				target: paintTarget,
				width: canvasWidth,
				height: canvasHeight,
			});

			try {
				const placeholderCanvas = canvas2dRef.current;
				if (!placeholderCanvas) {
					throw new Error('Canvas not found');
				}

				const handle = delayRender('onPaint');
				if (!initializedRef.current) {
					const currentOnInit = onInitRef.current;
					if (!currentOnInit) {
						initializedRef.current = true;
					} else {
						// `onInit` may be async (e.g. WebGPU
						// `requestAdapter`/`requestDevice`). Do not reuse this capture for
						// `onPaint`: awaiting initialization can invalidate its paint context.
						let initImage: ElementImage;
						try {
							initImage = placeholderCanvas.captureElementImage(element);
						} catch (error) {
							if (
								isMissingPaintRecordError(error) &&
								canRetryMissingPaintRecord
							) {
								// The web renderer explicitly drives additional paint cycles, so a
								// transient missing record can be retried without failing the render.
								continueRender(handle);
								return;
							}

							if (isMissingPaintRecordError(error)) {
								throw new Error(missingPaintRecordMessage);
							}

							throw error;
						}

						initializedRef.current = true;
						try {
							if (paintTarget instanceof HTMLCanvasElement) {
								throw new Error(
									'HtmlInCanvas: onInit requires an OffscreenCanvas paint target',
								);
							}

							const cleanup = await currentOnInit({
								canvas: paintTarget,
								element,
								elementImage: initImage,
								pixelDensity: resolvedPixelDensity,
							});
							if (typeof cleanup !== 'function') {
								throw new Error(
									'HtmlInCanvas: when `onInit` is provided, it must return a cleanup function, or a Promise that resolves to one.',
								);
							}

							if (unmountedRef.current) {
								cleanup();
							} else {
								onInitCleanupRef.current = cleanup;
							}
						} finally {
							initImage.close();
						}
					}
				}

				let elImage: ElementImage;
				try {
					elImage = placeholderCanvas.captureElementImage(element);
				} catch (error) {
					// `captureElementImage` throws `InvalidStateError` when the
					// element is outside the viewport (no cached paint record).
					// Skip this paint cycle — the canvas retains its last state.
					if (isMissingPaintRecordError(error) && canRetryMissingPaintRecord) {
						continueRender(handle);
						return;
					}

					if (isMissingPaintRecordError(error)) {
						throw new Error(missingPaintRecordMessage);
					}

					throw error;
				}

				try {
					const currentOnPaint = onPaintRef.current;
					if (currentOnPaint) {
						if (paintTarget instanceof HTMLCanvasElement) {
							throw new Error(
								'HtmlInCanvas: onPaint requires an OffscreenCanvas paint target',
							);
						}

						const paintResult = currentOnPaint({
							canvas: paintTarget,
							element,
							elementImage: elImage,
							pixelDensity: resolvedPixelDensity,
						});
						if (paintResult) {
							await paintResult;
						}
					} else {
						defaultOnPaint({
							canvas: paintTarget,
							element,
							elementImage: elImage,
							pixelDensity: resolvedPixelDensity,
						});
					}

					// `null` once unmounted, e.g. when an async `onPaint` resolves late.
					const state = chainState.get(canvasWidth, canvasHeight);
					if (state) {
						await runEffectChain({
							state,
							source: paintTarget,
							effects: effectsRef.current,
							output: paintTarget,
							width: canvasWidth,
							height: canvasHeight,
						});
					}
				} finally {
					elImage.close();
				}

				continueRender(handle);
			} catch (error) {
				cancelRender(error);
			}
		}, [
			canvasHeight,
			canvasWidth,
			chainState,
			continueRender,
			cancelRender,
			delayRender,
			resolvedPixelDensity,
			canRetryMissingPaintRecord,
		]);

		// Default paint handlers draw synchronously on the layout canvas itself.
		// Custom handlers retain the transferred OffscreenCanvas API.
		useLayoutEffect(() => {
			const placeholder = canvas2dRef.current;
			if (!placeholder) {
				throw new Error('Canvas not found');
			}

			placeholder.setAttribute('content', 'drawable');
			placeholder.layoutSubtree = true;
			divRef.current?.setAttribute('drawable', '');

			const paintTarget = usesDirectLayoutCanvas
				? placeholder
				: getTransferredOffscreenCanvas(placeholder);

			paintTargetRef.current = paintTarget;
			resizePaintTarget({
				target: paintTarget,
				width: canvasWidth,
				height: canvasHeight,
			});

			initializedRef.current = false;
			unmountedRef.current = false;

			placeholder.addEventListener('paint', onPaintCb);

			return () => {
				placeholder.removeEventListener('paint', onPaintCb);
				paintTargetRef.current = null;
				initializedRef.current = false;
				unmountedRef.current = true;
				onInitCleanupRef.current?.();
				onInitCleanupRef.current = null;
			};
		}, [
			onPaintCb,
			cancelRender,
			canvasWidth,
			canvasHeight,
			usesDirectLayoutCanvas,
		]);

		const onPaintChangedRef = useRef(false);
		useLayoutEffect(() => {
			if (!onPaintChangedRef.current) {
				onPaintChangedRef.current = true;
				return;
			}

			const canvas = canvas2dRef.current;
			if (!canvas) {
				return;
			}

			canvas.requestPaint?.();
		}, [onPaint, memoizedEffects]);

		useLayoutEffect(() => {
			const canvas = canvas2dRef.current;
			if (!canvas) {
				return;
			}

			const handle = delayRender('waiting for first paint after canvas resize');
			canvas.addEventListener(
				'paint',
				() => {
					continueRender(handle);
				},
				{once: true},
			);

			return () => {
				continueRender(handle);
			};
		}, [width, height, continueRender, delayRender, canvasSizeKey]);

		const innerStyle = useMemo(() => {
			return {
				width,
				height,
			};
		}, [width, height]);

		const canvasStyle = useMemo(() => {
			return {
				width,
				height,
				...(style ?? {}),
			};
		}, [height, style, width]);

		return (
			<HtmlInCanvasAncestorContext.Provider value>
				<canvas
					key={canvasSizeKey}
					ref={setLayoutCanvasRef}
					width={canvasWidth}
					height={canvasHeight}
					style={canvasStyle}
				>
					<div ref={divRef} style={innerStyle}>
						{children}
					</div>
					{canvasSiblings}
				</canvas>
			</HtmlInCanvasAncestorContext.Provider>
		);
	},
);

HtmlInCanvasContent.displayName = 'HtmlInCanvasContent';

const HtmlInCanvasInner = forwardRef<
	HTMLCanvasElement,
	HtmlInCanvasProps & {
		readonly controls: SequenceControls | undefined;
	}
>(
	(
		{
			width,
			height,
			effects = [],
			children,
			onPaint,
			onInit,
			pixelDensity,
			_remotionInternalCanvasSiblings,
			controls,
			style,
			cropLeft,
			cropRight,
			cropTop,
			cropBottom,
			durationInFrames,
			premountFor,
			postmountFor,
			styleWhilePremounted,
			styleWhilePostmounted,
			name,
			...sequenceProps
		},
		ref,
	) => {
		const memoizedEffectDefinitions = useMemoizedEffectDefinitions(effects);
		const actualRef = useRef<HTMLCanvasElement | null>(null);
		const setCanvasRef = useCallback(
			(node: HTMLCanvasElement | null) => {
				actualRef.current = node;
				if (typeof ref === 'function') {
					ref(node);
				} else if (ref) {
					(ref as React.RefObject<HTMLCanvasElement | null>).current = node;
				}
			},
			[ref],
		);

		const {
			effectivePremountFor,
			effectivePostmountFor,
			freezeFrame,
			isPremountingOrPostmounting,
			premountingActive,
			postmountingActive,
			premountingStyle,
		} = usePremounting({
			from: sequenceProps.from ?? 0,
			durationInFrames: resolveSequenceDuration({
				durationInFrames,
				playbackRate: sequenceProps.playbackRate,
				loop: sequenceProps.loop,
			}),
			premountFor: premountFor ?? null,
			postmountFor: postmountFor ?? null,
			style: style ?? null,
			styleWhilePremounted: styleWhilePremounted ?? null,
			styleWhilePostmounted: styleWhilePostmounted ?? null,
			hideWhilePremounted: 'opacity',
		});
		const croppedStyle = useCropStyle({
			cropLeft,
			cropRight,
			cropTop,
			cropBottom,
			style: premountingStyle,
			componentName: '<HtmlInCanvas />',
		});

		return (
			<Freeze
				frame={freezeFrame}
				active={isPremountingOrPostmounting}
				_remotionInternalIsPremounting={premountingActive}
			>
				<Sequence
					layout="none"
					durationInFrames={durationInFrames}
					name={name ?? '<HtmlInCanvas>'}
					_remotionInternalDocumentationLink="https://www.remotion.dev/docs/remotion/html-in-canvas"
					controls={controls}
					_remotionInternalEffects={memoizedEffectDefinitions}
					{...sequenceProps}
					_remotionInternalPremountDisplay={effectivePremountFor || null}
					_remotionInternalPostmountDisplay={effectivePostmountFor || null}
					_remotionInternalIsPremounting={premountingActive}
					_remotionInternalIsPostmounting={postmountingActive}
				>
					<HtmlInCanvasContent
						ref={setCanvasRef}
						width={width}
						height={height}
						effects={effects}
						onPaint={onPaint}
						onInit={onInit}
						pixelDensity={pixelDensity}
						canvasSiblings={_remotionInternalCanvasSiblings ?? null}
						controls={controls}
						style={croppedStyle ?? undefined}
					>
						{children}
					</HtmlInCanvasContent>
				</Sequence>
			</Freeze>
		);
	},
);

HtmlInCanvasInner.displayName = 'HtmlInCanvas';

export const htmlInCanvasSchema = {
	...baseSchema,
	...premountSchema,
	pixelDensity: {
		type: 'number',
		min: 1,
		max: 3,
		step: 0.1,
		default: 1,
		description: 'Pixel density',
		hiddenFromList: false,
	},
	...transformSchema,
	...backgroundSchema,
	...borderSchema,
	...borderRadiusSchema,
	...cropSchema,
} as const satisfies InteractivitySchema;

const HtmlInCanvasWrapped = withInteractivitySchema({
	Component: HtmlInCanvasInner,
	componentName: '<HtmlInCanvas>',
	componentIdentity: 'dev.remotion.remotion.HtmlInCanvas',
	schema: htmlInCanvasSchema,
	supportsEffects: true,
});

export const HtmlInCanvas = Object.assign(HtmlInCanvasWrapped, {
	isSupported: isHtmlInCanvasSupported,
	isNestingSupported: isHtmlInCanvasNestingSupported,
}) as React.ForwardRefExoticComponent<
	HtmlInCanvasProps & React.RefAttributes<HTMLCanvasElement>
> & {
	readonly isSupported: typeof isHtmlInCanvasSupported;
	readonly isNestingSupported: typeof isHtmlInCanvasNestingSupported;
};

HtmlInCanvas.displayName = 'HtmlInCanvas';

addSequenceStackTraces(HtmlInCanvas);
