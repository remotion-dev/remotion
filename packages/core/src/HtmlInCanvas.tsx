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
import {delayRender} from './delay-render.js';
import type {EffectsProp} from './effects/effect-types.js';
import {runEffectChain} from './effects/run-effect-chain.js';
import {useEffectChainState} from './effects/use-effect-chain-state.js';
import {
	useMemoizedEffectDefinitions,
	useMemoizedEffects,
} from './effects/use-memoized-effects.js';
import {addSequenceStackTraces} from './enable-sequence-stack-traces.js';
import {
	durationInFramesField,
	fromField,
	hiddenField,
	sequenceVisualStyleSchema,
} from './sequence-field-schema.js';
import type {
	AbsoluteFillLayout,
	LayoutAndStyle,
	SequenceProps,
} from './Sequence.js';
import {Sequence} from './Sequence.js';
import {useDelayRender} from './use-delay-render.js';
import {useVideoConfig} from './use-video-config.js';
import {wrapInSchema} from './wrap-in-schema.js';

// IDL: https://github.com/WICG/html-in-canvas#idl-changes
// WebGPU's `copyElementImageToTexture` is omitted — `GPUQueue` is not in
// lib.dom.d.ts and would require pulling in `@webgpu/types`.
declare global {
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
		): DOMMatrix;
		drawElementImage(
			element: Element | ElementImage,
			dx: number,
			dy: number,
			dwidth: number,
			dheight: number,
		): DOMMatrix;
		drawElementImage(
			element: Element | ElementImage,
			sx: number,
			sy: number,
			swidth: number,
			sheight: number,
			dx: number,
			dy: number,
		): DOMMatrix;
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
		): DOMMatrix;
	}

	interface OffscreenCanvasRenderingContext2D {
		drawElementImage(
			element: Element | ElementImage,
			dx: number,
			dy: number,
		): DOMMatrix;
		drawElementImage(
			element: Element | ElementImage,
			dx: number,
			dy: number,
			dwidth: number,
			dheight: number,
		): DOMMatrix;
		drawElementImage(
			element: Element | ElementImage,
			sx: number,
			sy: number,
			swidth: number,
			sheight: number,
			dx: number,
			dy: number,
		): DOMMatrix;
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
		): DOMMatrix;
	}

	// Augmenting the base interface applies to both WebGL1 and WebGL2.
	interface WebGLRenderingContextBase {
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
		layoutSubtree?: boolean;
		onpaint: ((this: HTMLCanvasElement, ev: Event) => unknown) | null;
		requestPaint?(): void;
		captureElementImage(element: Element): ElementImage;
		getElementTransform(
			element: Element | ElementImage,
			drawTransform: DOMMatrix,
		): DOMMatrix;
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

/** Shown when {@link isHtmlInCanvasSupported} is false: APIs are absent (old Chrome and/or flag off). */
export const HTML_IN_CANVAS_UNSUPPORTED_MESSAGE =
	'HTML in Canvas is not supported. Two common causes: Chrome is older than version 148 (update Chrome), or the HTML-in-Canvas flag is disabled at chrome://flags/#canvas-draw-element (enable it and restart Chrome).';

export type HtmlInCanvasOnPaint = (
	params: HtmlInCanvasOnPaintParams,
) => void | Promise<void>;

export type HtmlInCanvasOnInitCleanup = () => void;

export type HtmlInCanvasOnInit = (
	params: HtmlInCanvasOnPaintParams,
) => HtmlInCanvasOnInitCleanup | Promise<HtmlInCanvasOnInitCleanup>;

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

const defaultOnPaint: HtmlInCanvasOnPaint = ({
	canvas,
	element,
	elementImage,
}) => {
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Failed to acquire 2D context for <HtmlInCanvas> canvas');
	}

	ctx.reset();
	const transform = ctx.drawElementImage(elementImage, 0, 0);
	element.style.transform = transform.toString();
};

/* eslint-disable react/require-default-props -- optional fields mirror `<Sequence>` / canvas hooks API */
export type HtmlInCanvasProps = Omit<
	SequenceProps,
	| 'children'
	| 'durationInFrames'
	| keyof LayoutAndStyle
	| '_remotionInternalEffects'
	| '_remotionInternalRefForOutline'
> &
	Omit<
		AbsoluteFillLayout,
		| 'layout'
		| 'styleWhilePostmounted'
		| 'postmountFor'
		| 'premountFor'
		| 'styleWhilePremounted'
	> & {
		readonly durationInFrames?: number;
		readonly width: number;
		readonly height: number;
		readonly effects?: EffectsProp;
		readonly children: React.ReactNode;
		readonly onPaint?: HtmlInCanvasOnPaint;
		readonly onInit?: HtmlInCanvasOnInit;
	};
/* eslint-enable react/require-default-props */

const HtmlInCanvasAncestorContext = createContext(false);

type HtmlInCanvasContentProps = {
	readonly width: number;
	readonly height: number;
	readonly effects: EffectsProp;
	readonly children: React.ReactNode;
	readonly onPaint: HtmlInCanvasOnPaint | undefined;
	readonly onInit: HtmlInCanvasOnInit | undefined;
	readonly controls: SequenceControls | undefined;
	readonly style: React.CSSProperties | undefined;
};

const HtmlInCanvasContent = forwardRef<
	HTMLCanvasElement,
	HtmlInCanvasContentProps
>(
	(
		{width, height, effects, children, onPaint, onInit, controls, style},
		ref,
	) => {
		const isInsideAncestorHtmlInCanvas = useContext(
			HtmlInCanvasAncestorContext,
		);

		assertHtmlInCanvasDimensions(width, height);
		const {continueRender, cancelRender} = useDelayRender();

		if (!isHtmlInCanvasSupported()) {
			cancelRender(new Error(HTML_IN_CANVAS_UNSUPPORTED_MESSAGE));
		}

		const canvas2dRef = useRef<HTMLCanvasElement | null>(null);
		const offscreenRef = useRef<OffscreenCanvas | null>(null);
		const divRef = useRef<HTMLDivElement | null>(null);
		const canvasSizeKey = `${width}x${height}`;

		const setLayoutCanvasRef = useCallback(
			(node: HTMLCanvasElement | null) => {
				canvas2dRef.current = node;
				if (typeof ref === 'function') {
					ref(node);
				} else if (ref) {
					(ref as React.MutableRefObject<HTMLCanvasElement | null>).current =
						node;
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

			const offscreen = offscreenRef.current;
			if (!offscreen) {
				throw new Error(
					'HtmlInCanvas: offscreen canvas not ready (transferControlToOffscreen failed or canvas is remounting)',
				);
			}

			offscreen.width = width;
			offscreen.height = height;

			try {
				const placeholderCanvas = canvas2dRef.current;
				if (!placeholderCanvas) {
					throw new Error('Canvas not found');
				}

				// `GPUQueue.copyElementImageToTexture` / related paths validate the
				// linked offscreen surface has a rendering context. Acquire `2d` here
				// before any capture or handler (must not call getContext on placeholder).
				const offscreen2d = offscreen.getContext('2d');
				if (!offscreen2d) {
					throw new Error(
						'Failed to acquire 2D context for <HtmlInCanvas> offscreen canvas',
					);
				}

				const handle = delayRender('onPaint');
				if (!initializedRef.current) {
					initializedRef.current = true;
					// `onInit` may be async (e.g. WebGPU `requestAdapter`/`requestDevice`).
					// Capture an `ElementImage` here only for `onInit` consumers — do NOT
					// reuse it for the paint handler below, because awaiting `onInit`
					// can invalidate the capture's paint context, leaving subsequent
					// uploads (e.g. `copyElementImageToTexture`) failing with
					// "No context found for ElementImage" on the very first paint.
					const initImage = placeholderCanvas.captureElementImage(element);
					const currentOnInit = onInitRef.current;
					if (currentOnInit) {
						const cleanup = await currentOnInit({
							canvas: offscreen,
							element,
							elementImage: initImage!,
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
					}
				}

				const handler = onPaintRef.current ?? defaultOnPaint;

				const elImage = placeholderCanvas.captureElementImage(element);
				await handler({
					canvas: offscreen,
					element,
					elementImage: elImage!,
				});

				await runEffectChain({
					state: chainState.get(width, height)!,
					source: offscreen,
					effects: effectsRef.current,
					output: offscreen,
					width,
					height,
				});

				continueRender(handle);
			} catch (error) {
				cancelRender(error);
			}
		}, [chainState, continueRender, cancelRender, width, height]);

		// Transfer control once per layout canvas instance, then listen for paint on
		// the placeholder (capture) while drawing on the linked offscreen surface.
		useLayoutEffect(() => {
			const placeholder = canvas2dRef.current;
			if (!placeholder) {
				throw new Error('Canvas not found');
			}

			placeholder.layoutSubtree = true;

			const offscreen = placeholder.transferControlToOffscreen();
			offscreenRef.current = offscreen;
			offscreen.width = width;
			offscreen.height = height;

			initializedRef.current = false;
			unmountedRef.current = false;

			placeholder.addEventListener('paint', onPaintCb);

			return () => {
				placeholder.removeEventListener('paint', onPaintCb);
				offscreenRef.current = null;
				initializedRef.current = false;
				unmountedRef.current = true;
				onInitCleanupRef.current?.();
				onInitCleanupRef.current = null;
			};
		}, [onPaintCb, cancelRender, width, height]);

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
		}, [width, height, continueRender, canvasSizeKey]);

		const innerStyle = useMemo(() => {
			return {
				width,
				height,
			};
		}, [width, height]);

		if (isInsideAncestorHtmlInCanvas) {
			throw new Error(
				'<HtmlInCanvas> effects cannot be nested together. Chrome will only display the outer effect. Consider merging the effects into one if you can.',
			);
		}

		return (
			<HtmlInCanvasAncestorContext.Provider value>
				<canvas
					key={canvasSizeKey}
					ref={setLayoutCanvasRef}
					width={width}
					height={height}
					style={style}
				>
					<div ref={divRef} style={innerStyle}>
						{children}
					</div>
				</canvas>
			</HtmlInCanvasAncestorContext.Provider>
		);
	},
);

HtmlInCanvasContent.displayName = 'HtmlInCanvasContent';

const HtmlInCanvasInner = forwardRef<
	HTMLCanvasElement,
	HtmlInCanvasProps & {
		readonly _experimentalControls: SequenceControls | undefined;
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
			_experimentalControls: controls,
			style,
			durationInFrames,
			name,
			...sequenceProps
		},
		ref,
	) => {
		const {durationInFrames: videoDuration} = useVideoConfig();
		const resolvedDuration = durationInFrames ?? videoDuration;

		const memoizedEffectDefinitions = useMemoizedEffectDefinitions(effects);
		const actualRef = useRef<HTMLCanvasElement | null>(null);
		const setCanvasRef = useCallback(
			(node: HTMLCanvasElement | null) => {
				actualRef.current = node;
				if (typeof ref === 'function') {
					ref(node);
				} else if (ref) {
					(ref as React.MutableRefObject<HTMLCanvasElement | null>).current =
						node;
				}
			},
			[ref],
		);

		return (
			<Sequence
				durationInFrames={resolvedDuration}
				name={name ?? '<HtmlInCanvas>'}
				_remotionInternalDocumentationLink={
					name === undefined
						? 'https://www.remotion.dev/docs/remotion/html-in-canvas'
						: undefined
				}
				_experimentalControls={controls}
				_remotionInternalEffects={memoizedEffectDefinitions}
				_remotionInternalRefForOutline={actualRef}
				layout="none"
				{...sequenceProps}
			>
				<HtmlInCanvasContent
					ref={setCanvasRef}
					width={width}
					height={height}
					effects={effects}
					onPaint={onPaint}
					onInit={onInit}
					controls={controls}
					style={style}
				>
					{children}
				</HtmlInCanvasContent>
			</Sequence>
		);
	},
);

HtmlInCanvasInner.displayName = 'HtmlInCanvas';

const htmlInCanvasSchema = {
	durationInFrames: durationInFramesField,
	from: fromField,
	...sequenceVisualStyleSchema,
	hidden: hiddenField,
};

const HtmlInCanvasWrapped = wrapInSchema({
	Component: HtmlInCanvasInner,
	schema: htmlInCanvasSchema,
	supportsEffects: true,
});

export const HtmlInCanvas = Object.assign(HtmlInCanvasWrapped, {
	isSupported: isHtmlInCanvasSupported,
}) as React.ForwardRefExoticComponent<
	HtmlInCanvasProps & React.RefAttributes<HTMLCanvasElement>
> & {
	readonly isSupported: typeof isHtmlInCanvasSupported;
};

HtmlInCanvas.displayName = 'HtmlInCanvas';

addSequenceStackTraces(HtmlInCanvas);
