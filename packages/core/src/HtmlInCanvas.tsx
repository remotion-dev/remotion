import React, {
	createContext,
	forwardRef,
	useCallback,
	useContext,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import type {SequenceControls} from './CompositionManager.js';
import {delayRender} from './delay-render.js';
import type {EffectsProp} from './effects/effect-types.js';
import {runEffectChain} from './effects/run-effect-chain.js';
import {useEffectChainState} from './effects/use-effect-chain-state.js';
import {addSequenceStackTraces} from './enable-sequence-stack-traces.js';
import {sequenceStyleSchema} from './sequence-field-schema.js';
import type {
	AbsoluteFillLayout,
	LayoutAndStyle,
	SequenceProps,
} from './Sequence.js';
import {Sequence} from './Sequence.js';
import {useCurrentFrame} from './use-current-frame.js';
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
		drawElementImage(element: ElementImage, dx: number, dy: number): DOMMatrix;
		drawElementImage(
			element: ElementImage,
			dx: number,
			dy: number,
			dwidth: number,
			dheight: number,
		): DOMMatrix;
		drawElementImage(
			element: ElementImage,
			sx: number,
			sy: number,
			swidth: number,
			sheight: number,
			dx: number,
			dy: number,
		): DOMMatrix;
		drawElementImage(
			element: ElementImage,
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
		typeof canvas.captureElementImage === 'function';
	return cachedSupport;
};

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
	'children' | 'durationInFrames' | keyof LayoutAndStyle
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
		readonly _experimentalEffects?: EffectsProp;
		readonly children: React.ReactNode;
		readonly onPaint?: HtmlInCanvasOnPaint;
		readonly onInit?: HtmlInCanvasOnInit;
	};
/* eslint-enable react/require-default-props */

const HtmlInCanvasAncestorContext = createContext(false);

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
			_experimentalEffects: effects = [],
			children,
			onPaint,
			onInit,
			_experimentalControls: controls,
			style,
			durationInFrames,
			...sequenceProps
		},
		ref,
	) => {
		const isInsideAncestorHtmlInCanvas = useContext(
			HtmlInCanvasAncestorContext,
		);

		assertHtmlInCanvasDimensions(width, height);
		const {continueRender, cancelRender} = useDelayRender();

		if (!isHtmlInCanvasSupported()) {
			cancelRender(
				new Error(
					'HTML in Canvas is not supported. Open this page in Chrome Canary with chrome://flags/#canvas-draw-element enabled.',
				),
			);
		}

		const {durationInFrames: videoDuration} = useVideoConfig();
		const resolvedDuration = durationInFrames ?? videoDuration;

		const frame = useCurrentFrame();

		const canvas2dRef = useRef<HTMLCanvasElement | null>(null);
		const divRef = useRef<HTMLDivElement | null>(null);

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
		const [offscreenCanvas] = useState(() => new OffscreenCanvas(1, 1));

		const chainState = useEffectChainState();

		// Refs so the paint handler always reads fresh values.
		const effectsRef = useRef(effects);
		effectsRef.current = effects;
		const frameRef = useRef(frame);
		frameRef.current = frame;
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

			offscreenCanvas.width = width;
			offscreenCanvas.height = height;

			try {
				const layoutCanvas = canvas2dRef.current;
				if (!layoutCanvas) {
					throw new Error('Canvas not found');
				}

				// `GPUQueue.copyElementImageToTexture` / related paths validate the
				// layout canvas has a rendering context. `runEffectChain` only runs
				// after `onPaint`, so acquire `2d` here before any capture or handler.
				const layout2d = layoutCanvas.getContext('2d');
				if (!layout2d) {
					throw new Error(
						'Failed to acquire 2D context for <HtmlInCanvas> layout canvas',
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
					const initImage = layoutCanvas.captureElementImage(element);
					const currentOnInit = onInitRef.current;
					if (currentOnInit) {
						const cleanup = await currentOnInit({
							canvas: offscreenCanvas,
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

				const elImage = layoutCanvas.captureElementImage(element);
				await handler({
					canvas: offscreenCanvas,
					element,
					elementImage: elImage!,
				});

				await runEffectChain({
					state: chainState.get(width, height)!,
					source: offscreenCanvas,
					effects: effectsRef.current,
					output: canvas2dRef.current!,
					frame: frameRef.current,
					width,
					height,
				});

				continueRender(handle);
			} catch (error) {
				cancelRender(error);
			}
		}, [
			chainState,
			continueRender,
			cancelRender,
			width,
			height,
			offscreenCanvas,
		]);

		// Set up layoutSubtree and persistent paint listener. Runs as a
		// layout effect so the listener is attached before the resize effect
		// below dispatches its first synthetic paint.
		useLayoutEffect(() => {
			const canvas = canvas2dRef.current;
			if (!canvas) {
				throw new Error('Canvas not found');
			}

			canvas.layoutSubtree = true;
			canvas.addEventListener('paint', onPaintCb);

			return () => {
				canvas.removeEventListener('paint', onPaintCb);
				unmountedRef.current = true;
				onInitCleanupRef.current?.();
				onInitCleanupRef.current = null;
			};
		}, [onPaintCb, cancelRender]);

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
		}, [onPaint]);

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
		}, [width, height, continueRender]);

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
			<Sequence
				durationInFrames={resolvedDuration}
				name="<HtmlInCanvas>"
				_experimentalControls={controls}
				_experimentalEffects={effects}
				layout="none"
				{...sequenceProps}
			>
				<HtmlInCanvasAncestorContext.Provider value>
					<canvas
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
			</Sequence>
		);
	},
);

HtmlInCanvasInner.displayName = 'HtmlInCanvas';

const HtmlInCanvasWrapped = wrapInSchema(
	HtmlInCanvasInner,
	sequenceStyleSchema,
);

export const HtmlInCanvas = Object.assign(HtmlInCanvasWrapped, {
	isSupported: isHtmlInCanvasSupported,
}) as React.ForwardRefExoticComponent<
	HtmlInCanvasProps & React.RefAttributes<HTMLCanvasElement>
> & {
	readonly isSupported: typeof isHtmlInCanvasSupported;
};

HtmlInCanvas.displayName = 'HtmlInCanvas';

addSequenceStackTraces(HtmlInCanvas);
