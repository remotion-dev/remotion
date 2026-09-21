import {calculateObjectFit, parseObjectFit} from './drawing/calculate-object-fit';

type Canvas2DWithDrawElement = CanvasRenderingContext2D & {
	drawElementImage: (
		element: Element,
		dx: number,
		dy: number,
		dwidth: number,
		dheight: number,
	) => DOMMatrix;
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
		(canvas) => (canvas as HTMLCanvasWithLayoutSubtree).layoutSubtree === true,
	);
};

export type HtmlInCanvasContext = {
	layoutCanvas: HTMLCanvasWithLayoutSubtree;
	ctx: Canvas2DWithDrawElement;
};

/**
 * Sets up a persistent layoutsubtree canvas that wraps the scaffold div.
 * The div becomes a direct child of the canvas, which is required for drawElementImage.
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

	wrapper.removeChild(div);
	layoutCanvas.appendChild(div);
	wrapper.appendChild(layoutCanvas);

	return {layoutCanvas, ctx: maybeCtx};
};

// drawElementImage paints a nested <canvas> at bitmap / devicePixelRatio from the
// element's origin, ignoring the CSS box and object-fit. Media canvases stay at
// the decoded frame size, so the picture lands in the corner. Redraw into a
// bitmap of the laid-out box times devicePixelRatio, then restore it.
const fitCanvasesForDrawElementImage = (
	element: HTMLElement,
	scaledWidth: number,
	scaledHeight: number,
) => {
	const elementRect = element.getBoundingClientRect();
	if (elementRect.width <= 0 || elementRect.height <= 0) {
		return () => undefined;
	}

	const scaleX = scaledWidth / elementRect.width;
	const scaleY = scaledHeight / elementRect.height;
	const deviceScale =
		element.ownerDocument.defaultView?.devicePixelRatio ||
		(typeof window !== 'undefined' ? window.devicePixelRatio : 1) ||
		1;
	const restores: Array<() => void> = [];

	for (const canvas of element.querySelectorAll('canvas')) {
		if ((canvas as HTMLCanvasWithLayoutSubtree).layoutSubtree === true) {
			continue;
		}

		const rect = canvas.getBoundingClientRect();
		const targetWidth = Math.round(rect.width * scaleX);
		const targetHeight = Math.round(rect.height * scaleY);
		const paintWidth = Math.round(targetWidth * deviceScale);
		const paintHeight = Math.round(targetHeight * deviceScale);
		if (
			targetWidth <= 0 ||
			targetHeight <= 0 ||
			(canvas.width === paintWidth && canvas.height === paintHeight)
		) {
			continue;
		}

		const context = canvas.getContext('2d');
		if (!context || canvas.width <= 0 || canvas.height <= 0) {
			continue;
		}

		const snapshot = document.createElement('canvas');
		snapshot.width = canvas.width;
		snapshot.height = canvas.height;
		const snapshotContext = snapshot.getContext('2d');
		if (!snapshotContext) {
			continue;
		}

		snapshotContext.drawImage(canvas, 0, 0);
		const previousWidth = canvas.width;
		const previousHeight = canvas.height;
		canvas.width = paintWidth;
		canvas.height = paintHeight;
		const fitted = calculateObjectFit({
			objectFit: parseObjectFit(getComputedStyle(canvas).objectFit),
			containerSize: {
				width: paintWidth,
				height: paintHeight,
				left: 0,
				top: 0,
			},
			intrinsicSize: {
				width: snapshot.width,
				height: snapshot.height,
			},
		});
		context.drawImage(
			snapshot,
			fitted.sourceX,
			fitted.sourceY,
			fitted.sourceWidth,
			fitted.sourceHeight,
			fitted.destX,
			fitted.destY,
			fitted.destWidth,
			fitted.destHeight,
		);
		restores.push(() => {
			canvas.width = previousWidth;
			canvas.height = previousHeight;
			canvas.getContext('2d')?.drawImage(snapshot, 0, 0);
		});
	}

	return () => {
		for (const restore of restores) {
			restore();
		}
	};
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

	const restoreCanvases = fitCanvasesForDrawElementImage(
		element,
		scaledWidth,
		scaledHeight,
	);
	try {
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
	} finally {
		restoreCanvases();
	}
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
	const {layoutCanvas} = htmlInCanvasContext;
	layoutCanvas.removeChild(div);
	wrapper.removeChild(layoutCanvas);
	wrapper.appendChild(div);
};
