import {withResolvers} from './with-resolvers';

type Canvas2DWithDrawElement = CanvasRenderingContext2D & {
	drawElementImage: (
		element: Element,
		dx: number,
		dy: number,
		dwidth: number,
		dheight: number,
	) => void;
};

export type HTMLCanvasWithLayoutSubtree = HTMLCanvasElement & {
	layoutSubtree?: boolean;
	requestPaint?: () => void;
	captureElementImage?: (
		element: Element,
	) => Transferable & {close: () => void};
};

export const supportsNativeHtmlInCanvas = (): boolean => {
	if (typeof document === 'undefined') {
		return false;
	}

	const ctx = document
		.createElement('canvas')
		.getContext('2d') as Canvas2DWithDrawElement | null;
	return typeof ctx?.drawElementImage === 'function';
};

export const containsLayoutSubtreeCanvas = (element: HTMLElement): boolean => {
	return Array.from(element.querySelectorAll('canvas')).some(
		(canvas) =>
			(canvas as HTMLCanvasWithLayoutSubtree).layoutSubtree === true ||
			canvas.getAttribute('content') === 'drawable',
	);
};

export type HtmlInCanvasContext = {
	layoutCanvas: HTMLCanvasWithLayoutSubtree;
	ctx: Canvas2DWithDrawElement | null;
	wasDrawable: boolean;
};

/**
 * Sets up a persistent drawable canvas that wraps the scaffold div.
 * Must be called once before rendering begins; the canvas stays in the DOM for the
 * lifetime of the render.
 */
export const setupHtmlInCanvas = ({
	wrapper,
	div,
	width,
	height,
}: {
	wrapper: HTMLDivElement;
	div: HTMLDivElement;
	width: number;
	height: number;
}): HtmlInCanvasContext | null => {
	if (!supportsNativeHtmlInCanvas()) {
		return null;
	}

	const layoutCanvas = document.createElement(
		'canvas',
	) as HTMLCanvasWithLayoutSubtree;
	layoutCanvas.setAttribute('content', 'drawable');
	layoutCanvas.layoutSubtree = true;

	layoutCanvas.width = width;
	layoutCanvas.height = height;
	layoutCanvas.style.position = 'absolute';
	layoutCanvas.style.top = '0';
	layoutCanvas.style.left = '0';
	layoutCanvas.style.width = `${width}px`;
	layoutCanvas.style.height = `${height}px`;
	// The wrapper has visibility:hidden which is inherited. Override it so
	// Chromium's paint pipeline creates a paint record for the layoutsubtree
	// children. The spec says children "behave as if visible" but in practice
	// inherited visibility:hidden can suppress the internal snapshot.
	layoutCanvas.style.visibility = 'visible';

	if (typeof layoutCanvas.requestPaint !== 'function') {
		return null;
	}

	const wasDrawable = div.hasAttribute('drawable');
	div.setAttribute('drawable', '');
	wrapper.removeChild(div);
	layoutCanvas.appendChild(div);
	wrapper.appendChild(layoutCanvas);

	return {layoutCanvas, ctx: null, wasDrawable};
};

export const waitForPaint = (
	layoutCanvas: HTMLCanvasWithLayoutSubtree,
	signal: AbortSignal | null = null,
): Promise<void> => {
	const {promise, resolve, reject} = withResolvers<void>();
	const painted = () => resolve();
	const aborted = () => reject(new Error('renderMediaOnWeb() was cancelled'));
	if (signal?.aborted) {
		aborted();
	} else {
		layoutCanvas.addEventListener('paint', painted, {once: true});
		signal?.addEventListener('abort', aborted, {once: true});
		try {
			layoutCanvas.requestPaint!();
		} catch (error) {
			reject(error);
		}
	}

	return promise.finally(() => {
		layoutCanvas.removeEventListener('paint', painted);
		signal?.removeEventListener('abort', aborted);
	});
};

/**
 * Triggers a fresh paint record via requestPaint(), waits for the paint event,
 * then captures the element into an OffscreenCanvas using drawElementImage.
 *
 * The caller is responsible for ensuring the frame content is ready (via
 * waitForReady) before calling this function.
 */
export const drawWithHtmlInCanvas = async ({
	htmlInCanvasContext,
	element,
	scaledWidth,
	scaledHeight,
}: {
	htmlInCanvasContext: HtmlInCanvasContext;
	element: HTMLElement;
	scaledWidth: number;
	scaledHeight: number;
}): Promise<OffscreenCanvasRenderingContext2D> => {
	const {layoutCanvas} = htmlInCanvasContext;
	// Delay acquiring a context so video exports can transfer this canvas to a worker.
	const ctx =
		htmlInCanvasContext.ctx ??
		(layoutCanvas.getContext('2d') as Canvas2DWithDrawElement | null);
	if (!ctx) {
		throw new Error('Could not get HTML-in-canvas context');
	}

	htmlInCanvasContext.ctx = ctx;

	if (
		layoutCanvas.width !== scaledWidth ||
		layoutCanvas.height !== scaledHeight
	) {
		layoutCanvas.width = scaledWidth;
		layoutCanvas.height = scaledHeight;
	}

	await waitForPaint(layoutCanvas);

	ctx.reset();
	ctx.drawElementImage(element, 0, 0, scaledWidth, scaledHeight);

	const offscreen = new OffscreenCanvas(scaledWidth, scaledHeight);
	const offCtx = offscreen.getContext('2d');
	if (!offCtx) {
		throw new Error('Could not get offscreen context');
	}

	offCtx.drawImage(layoutCanvas, 0, 0);
	return offCtx;
};

export const teardownHtmlInCanvas = ({
	htmlInCanvasContext,
	wrapper,
	div,
}: {
	htmlInCanvasContext: HtmlInCanvasContext;
	wrapper: HTMLDivElement;
	div: HTMLDivElement;
}) => {
	const {layoutCanvas, wasDrawable} = htmlInCanvasContext;
	layoutCanvas.removeChild(div);
	wrapper.removeChild(layoutCanvas);
	wrapper.appendChild(div);
	if (!wasDrawable) {
		div.removeAttribute('drawable');
	}
};
