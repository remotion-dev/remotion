type Canvas2DWithDrawElement = CanvasRenderingContext2D & {
	drawElementImage: (
		element: Element | ElementImage,
		dx: number,
		dy: number,
		dwidth: number,
		dheight: number,
	) => DOMMatrix;
};

type HTMLCanvasWithLayoutSubtree = HTMLCanvasElement & {
	captureElementImage?: (element: Element) => ElementImage;
	layoutSubtree?: boolean;
	requestPaint?: () => void;
};

let nestedHtmlInCanvasSupport: Promise<boolean> | null = null;
let forceDisableHtmlInCanvasForTesting = false;

export const setForceDisableHtmlInCanvasForTesting = (
	forceDisable: boolean,
) => {
	forceDisableHtmlInCanvasForTesting = forceDisable;
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

const runNestedHtmlInCanvasProbe = (): Promise<boolean> => {
	if (!supportsNativeHtmlInCanvas() || !document.body) {
		return Promise.resolve(false);
	}

	const outer = document.createElement('canvas') as HTMLCanvasWithLayoutSubtree;
	const inner = document.createElement('canvas') as HTMLCanvasWithLayoutSubtree;
	const outerTarget = document.createElement('div');
	const innerTarget = document.createElement('div');
	const outerCtx = outer.getContext('2d') as Canvas2DWithDrawElement | null;
	const innerCtx = inner.getContext('2d') as Canvas2DWithDrawElement | null;

	if (
		!outerCtx ||
		!innerCtx ||
		typeof outer.requestPaint !== 'function' ||
		typeof inner.requestPaint !== 'function'
	) {
		return Promise.resolve(false);
	}

	outer.layoutSubtree = true;
	inner.layoutSubtree = true;
	outer.width = 4;
	outer.height = 4;
	inner.width = 4;
	inner.height = 4;

	Object.assign(outer.style, {
		display: 'block',
		height: '4px',
		left: '0',
		pointerEvents: 'none',
		position: 'fixed',
		top: '0',
		visibility: 'visible',
		width: '4px',
		zIndex: '2147483647',
	});
	Object.assign(inner.style, {
		display: 'block',
		height: '4px',
		width: '4px',
	});
	Object.assign(outerTarget.style, {
		display: 'block',
		height: '4px',
		width: '4px',
	});
	Object.assign(innerTarget.style, {
		backgroundColor: 'rgb(255, 0, 0)',
		display: 'block',
		height: '4px',
		width: '4px',
	});

	inner.appendChild(innerTarget);
	outerTarget.appendChild(inner);
	outer.appendChild(outerTarget);
	document.body.appendChild(outer);

	return new Promise<boolean>((resolve) => {
		let innerPainted = false;
		let settled = false;
		let timeout: number | null = null;

		const settle = (supported: boolean) => {
			if (settled) {
				return;
			}

			settled = true;
			if (timeout !== null) {
				window.clearTimeout(timeout);
			}

			outer.remove();
			resolve(supported);
		};

		timeout = window.setTimeout(() => settle(false), 1000);

		inner.addEventListener('paint', () => {
			try {
				innerCtx.reset();
				const transform = innerCtx.drawElementImage(innerTarget, 0, 0, 4, 4);
				innerTarget.style.transform = transform.toString();
				innerPainted = true;
				requestAnimationFrame(() => outer.requestPaint!());
			} catch {
				settle(false);
			}
		});

		outer.addEventListener('paint', () => {
			if (!innerPainted) {
				return;
			}

			try {
				outerCtx.reset();
				if (typeof outer.captureElementImage !== 'function') {
					settle(false);
					return;
				}

				const elementImage = outer.captureElementImage(outerTarget);
				const transform = outerCtx.drawElementImage(elementImage, 0, 0, 4, 4);
				elementImage.close();
				outerTarget.style.transform = transform.toString();
				const pixel = outerCtx.getImageData(2, 2, 1, 1).data;
				settle(
					pixel[0] > 200 && pixel[1] < 20 && pixel[2] < 20 && pixel[3] > 200,
				);
			} catch {
				settle(false);
			}
		});

		inner.requestPaint!();
	});
};

export const supportsNestedHtmlInCanvas = (): Promise<boolean> => {
	if (forceDisableHtmlInCanvasForTesting) {
		return Promise.resolve(false);
	}

	if (!nestedHtmlInCanvasSupport) {
		nestedHtmlInCanvasSupport = runNestedHtmlInCanvasProbe();
	}

	return nestedHtmlInCanvasSupport;
};

const countLayoutSubtreeCanvases = (element: HTMLElement): number => {
	return Array.from(element.querySelectorAll('canvas')).filter(
		(canvas) => (canvas as HTMLCanvasWithLayoutSubtree).layoutSubtree === true,
	).length;
};

export const containsLayoutSubtreeCanvas = (element: HTMLElement): boolean => {
	return countLayoutSubtreeCanvases(element) > 0;
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
	waitForRenderReady,
	useElementImage,
}: {
	htmlInCanvasContext: HtmlInCanvasContext;
	element: HTMLElement;
	scaledWidth: number;
	scaledHeight: number;
	waitForRenderReady: () => Promise<void>;
	useElementImage: boolean;
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
	// Each nested layout canvas needs one paint to run its async effect and a
	// second paint to propagate the completed bitmap to its parent. One final
	// cycle records the fully composed tree on the web renderer's root canvas.
	const nestedPaintCycles = useElementImage
		? countLayoutSubtreeCanvases(element) * 2 + 1
		: 0;
	for (let i = 0; i < nestedPaintCycles; i++) {
		await new Promise<void>((resolve) =>
			requestAnimationFrame(() => resolve()),
		);
		await waitForRenderReady();
		await waitForPaint(layoutCanvas);
	}

	ctx.reset();
	if (useElementImage) {
		if (typeof layoutCanvas.captureElementImage !== 'function') {
			throw new Error('canvas.captureElementImage() is unavailable');
		}

		const elementImage = layoutCanvas.captureElementImage(element);
		try {
			ctx.drawElementImage(elementImage, 0, 0, scaledWidth, scaledHeight);
		} finally {
			elementImage.close();
		}
	} else {
		ctx.drawElementImage(element, 0, 0, scaledWidth, scaledHeight);
	}

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
	const {layoutCanvas} = htmlInCanvasContext;
	layoutCanvas.removeChild(div);
	wrapper.removeChild(layoutCanvas);
	wrapper.appendChild(div);
};
