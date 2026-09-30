type Canvas2DWithDrawElement = CanvasRenderingContext2D & {
	drawElementImage: (
		element: Element,
		dx: number,
		dy: number,
		dwidth: number,
		dheight: number,
	) => DOMMatrix | void;
};

type HTMLCanvasWithLayoutSubtree = HTMLCanvasElement & {
	layoutSubtree?: boolean;
	requestPaint?: () => void;
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
	ctx: Canvas2DWithDrawElement;
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

	const maybeCtx = layoutCanvas.getContext(
		'2d',
	) as Canvas2DWithDrawElement | null;
	if (!maybeCtx || typeof maybeCtx.drawElementImage !== 'function') {
		return null;
	}

	if (typeof layoutCanvas.requestPaint !== 'function') {
		return null;
	}

	const wasDrawable = div.hasAttribute('drawable');
	div.setAttribute('drawable', '');
	wrapper.removeChild(div);
	layoutCanvas.appendChild(div);
	wrapper.appendChild(layoutCanvas);

	return {layoutCanvas, ctx: maybeCtx, wasDrawable};
};

const waitForPaint = (
	layoutCanvas: HTMLCanvasWithLayoutSubtree,
): Promise<void> => {
	return new Promise((resolve) => {
		layoutCanvas.addEventListener('paint', () => resolve(), {once: true});
		layoutCanvas.requestPaint!();
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
	const {ctx, layoutCanvas} = htmlInCanvasContext;

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
