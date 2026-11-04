import type {CropRectangle} from 'mediabunny';
import {captureDragImages} from './drag-image';
import type {CaptureFormat} from './messages';
import {
	assertCanEncodeCapture,
	canEncodeCapture,
	CanvasCaptureRecorder,
	getScaledCanvasSize,
	type HtmlInCanvasElement,
	type HtmlInCanvasRenderingContext2D,
	resetCanvas,
	syncCanvasSize,
	syncDisplayCanvasSize,
} from './recorder';

const maxCanvasDimension = 32_767;
const maxEncodedDimension = 32_766;

// The capture window in viewport CSS pixels, independent of page scrolling.
export type CaptureCrop = CropRectangle;

export type CapturePreflight = {
	readonly sourceSize: {readonly width: number; readonly height: number};
	readonly outputSize: {readonly width: number; readonly height: number};
};

type WrappedPage = {
	readonly canvas: HtmlInCanvasElement;
	readonly content: HTMLElement;
	readonly getSize: () => {readonly width: number; readonly height: number};
	readonly getViewportOrigin: () => {
		readonly left: number;
		readonly top: number;
	};
	readonly restore: () => void;
};

const getPageSize = (
	content: HTMLElement,
	minimum: {readonly width: number; readonly height: number},
) => ({
	// Ink overflow from animated/transformed descendants must not feed back
	// into their containing block and enlarge the page on every paint.
	width: Math.max(minimum.width, window.innerWidth),
	height: Math.max(
		minimum.height,
		window.innerHeight,
		...[...content.children].map((child) => {
			if (!(child instanceof HTMLElement)) {
				return 0;
			}

			const {position} = getComputedStyle(child);
			return position === 'fixed' || position === 'absolute'
				? 0
				: child.offsetTop + child.offsetHeight;
		}),
	),
});

const getWholePageSize = () => ({
	width: Math.max(
		document.documentElement.scrollWidth,
		document.body.scrollWidth,
		window.innerWidth,
	),
	height: Math.max(
		document.documentElement.scrollHeight,
		document.body.scrollHeight,
		window.innerHeight,
	),
});

const validateCaptureSize = ({
	width,
	height,
	crop,
	scale,
}: {
	readonly width: number;
	readonly height: number;
	readonly crop: CaptureCrop | null;
	readonly scale: number;
}) => {
	const resolvedCrop = crop ?? {
		left: 0,
		top: 0,
		width,
		height,
	};
	// The page display is viewport-sized. Only the selected output uses `scale`.
	const displayWidth = Math.max(
		1,
		Math.round(window.innerWidth * window.devicePixelRatio),
	);
	const displayHeight = Math.max(
		1,
		Math.round(window.innerHeight * window.devicePixelRatio),
	);
	const outputSize = getScaledCanvasSize(
		resolvedCrop.width,
		resolvedCrop.height,
		scale,
	);
	if (displayWidth > maxCanvasDimension || displayHeight > maxCanvasDimension) {
		throw new Error(
			`The display canvas would be ${displayWidth}×${displayHeight} pixels; its maximum side is ${maxCanvasDimension.toLocaleString()} pixels. Reduce the scale or page size.`,
		);
	}

	if (
		outputSize.width > maxEncodedDimension ||
		outputSize.height > maxEncodedDimension
	) {
		throw new Error(
			`The encoded frame would be ${outputSize.width}×${outputSize.height} pixels at ${scale}× scale; its maximum even side is ${maxEncodedDimension.toLocaleString()} pixels. Reduce the scale or select a smaller area.`,
		);
	}

	return outputSize;
};

export const getCapturePreflight = ({
	scale,
	crop,
}: {
	readonly scale: number;
	readonly crop: CaptureCrop | null;
}): CapturePreflight => {
	const sourceSize = getWholePageSize();
	return {
		sourceSize,
		outputSize: validateCaptureSize({
			...sourceSize,
			crop,
			scale,
		}),
	};
};

// Bound both the longest edge and pixel count to keep output around 4K.
export const getSuggestedMaximumCaptureScale = (
	width: number,
	height: number,
) =>
	Math.max(
		0.1,
		Math.floor(
			Math.min(
				30,
				3840 / Math.max(width, height),
				Math.sqrt((3840 * 2160) / (width * height)),
			) * 10,
		) / 10,
	);

export const getMaximumCaptureScale = async (
	crop: CaptureCrop | null,
): Promise<number | null> => {
	const sourceSize = getWholePageSize();
	const selectedSize = crop ?? sourceSize;
	const canEncodeScale = async (step: number) => {
		let outputSize: CapturePreflight['outputSize'];
		try {
			outputSize = validateCaptureSize({
				...sourceSize,
				crop,
				scale: step / 10,
			});
		} catch {
			return false;
		}

		if (await canEncodeCapture('mp4', outputSize)) {
			return true;
		}

		return canEncodeCapture('webm', outputSize);
	};

	let maximum = Math.round(
		getSuggestedMaximumCaptureScale(selectedSize.width, selectedSize.height) *
			10,
	);
	if (await canEncodeScale(maximum)) {
		return maximum / 10;
	}

	// Search in slider steps, retaining only resolutions the browser accepted.
	let minimum = 0;
	maximum--;
	while (minimum < maximum) {
		const candidate = Math.ceil((minimum + maximum) / 2);
		if (await canEncodeScale(candidate)) {
			minimum = candidate;
		} else {
			maximum = candidate - 1;
		}
	}

	return minimum === 0 ? null : minimum / 10;
};

const wrapWholePage = (): WrappedPage => {
	const {body} = document;
	const minimumSize = getWholePageSize();
	const bodyRect = body.getBoundingClientRect();
	const pageLeft = bodyRect.left + window.scrollX;
	const pageTop = bodyRect.top + window.scrollY;
	const spacer = document.createElement('div');
	const canvas = document.createElement('canvas') as HtmlInCanvasElement;
	const content = document.createElement('div');
	canvas.setAttribute('content', 'drawable');
	canvas.layoutSubtree = true;
	canvas.setAttribute('layoutsubtree', '');
	content.setAttribute('drawable', '');
	canvas.style.display = 'block';
	canvas.style.position = 'fixed';
	canvas.style.left = '0';
	canvas.style.top = '0';
	content.style.position = 'absolute';
	content.style.inset = '0';
	content.style.display = 'block';
	canvas.style.width = `${window.innerWidth}px`;
	canvas.style.height = `${window.innerHeight}px`;
	spacer.style.width = `${minimumSize.width}px`;
	spacer.style.height = `${minimumSize.height}px`;
	content.style.width = `${minimumSize.width}px`;
	content.style.height = `${minimumSize.height}px`;

	const pageNodes = [...body.childNodes];
	body.appendChild(spacer);
	spacer.appendChild(canvas);
	canvas.appendChild(content);
	// Keep both parents connected so moveBefore() preserves scroll positions,
	// focus, and other DOM state when moving the page into the capture subtree.
	for (const child of pageNodes) {
		content.moveBefore(child, null);
	}

	// Plain nested canvases can be clipped at the origin during HTML-in-canvas
	// capture. Mark them as drawable to use Chromium's nested canvas paint path.
	const originalCanvasContent = new Map<HTMLCanvasElement, string | null>();
	const markCanvasesDrawable = (element: Element) => {
		const canvases = [
			...(element instanceof HTMLCanvasElement ? [element] : []),
			...element.querySelectorAll('canvas'),
		];
		for (const nestedCanvas of canvases) {
			if (nestedCanvas.getAttribute('content') === 'drawable') {
				continue;
			}

			if (!originalCanvasContent.has(nestedCanvas)) {
				originalCanvasContent.set(
					nestedCanvas,
					nestedCanvas.getAttribute('content'),
				);
			}

			nestedCanvas.setAttribute('content', 'drawable');
		}
	};

	markCanvasesDrawable(content);
	const canvasObserver = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			for (const node of mutation.addedNodes) {
				if (node instanceof Element) {
					markCanvasesDrawable(node);
				}
			}
		}
	});
	canvasObserver.observe(content, {childList: true, subtree: true});

	const initialSize = getPageSize(content, minimumSize);
	spacer.style.width = `${initialSize.width}px`;
	spacer.style.height = `${initialSize.height}px`;
	content.style.width = `${initialSize.width}px`;
	content.style.height = `${initialSize.height}px`;

	// Leave nodes which are added to <body> while recording in place. Frameworks
	// use this pattern for portals and keep <body> as the expected parent. Moving
	// such a node into `content` makes a later framework-owned removal throw a
	// NotFoundError because the node is no longer a child of <body>.

	return {
		canvas,
		content,
		getViewportOrigin: () => ({
			left: pageLeft - window.scrollX,
			top: pageTop - window.scrollY,
		}),
		getSize: () => {
			const size = getPageSize(content, minimumSize);
			const width = `${size.width}px`;
			const height = `${size.height}px`;
			if (spacer.style.width !== width) {
				spacer.style.width = width;
			}

			if (spacer.style.height !== height) {
				spacer.style.height = height;
			}

			if (content.style.width !== width) {
				content.style.width = width;
			}

			if (content.style.height !== height) {
				content.style.height = height;
			}

			return size;
		},
		restore: () => {
			canvasObserver.disconnect();
			for (const [nestedCanvas, originalContent] of originalCanvasContent) {
				if (originalContent === null) {
					nestedCanvas.removeAttribute('content');
				} else {
					nestedCanvas.setAttribute('content', originalContent);
				}
			}

			originalCanvasContent.clear();

			while (content.firstChild) {
				body.moveBefore(content.firstChild, spacer);
			}

			spacer.remove();
		},
	};
};

const getFilename = (format: CaptureFormat) => {
	const host = location.hostname.replace(/[^a-z0-9.-]+/gi, '-') || 'page';
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
	return `remotion-capture-${host}-${timestamp}.${format}`;
};

export class PageCapture {
	readonly #wrapped: WrappedPage;
	readonly #scale: number;
	readonly #format: CaptureFormat;
	readonly #crop: CaptureCrop | null;
	readonly #recorder: CanvasCaptureRecorder;
	readonly #context: HtmlInCanvasRenderingContext2D;
	readonly #captureCanvas: OffscreenCanvas;
	readonly #captureContext: OffscreenCanvasRenderingContext2D;
	readonly #matteColors: readonly string[];
	readonly #resizeObserver: ResizeObserver;
	readonly #dragImages: ReturnType<typeof captureDragImages>;
	#restored = false;
	#paintError: unknown = null;

	constructor({
		scale,
		format,
		crop,
	}: {
		readonly scale: number;
		readonly format: CaptureFormat;
		readonly crop: CaptureCrop | null;
	}) {
		this.#scale = scale;
		this.#format = format;
		this.#crop = crop;
		this.#matteColors = [
			'#fff',
			window.getComputedStyle(document.documentElement).backgroundColor,
			window.getComputedStyle(document.body).backgroundColor,
		];
		this.#wrapped = wrapWholePage();
		const context = this.#wrapped.canvas.getContext(
			'2d',
		) as HtmlInCanvasRenderingContext2D | null;
		if (!context || typeof context.drawElementImage !== 'function') {
			this.#wrapped.restore();
			throw new Error(
				'The required HTML-in-canvas APIs are unavailable. Open chrome://flags/#canvas-draw-element, set Canvas Draw Element to Enabled, then fully quit and reopen the browser.',
			);
		}

		this.#context = context;
		this.#captureCanvas = new OffscreenCanvas(2, 2);
		const captureContext = this.#captureCanvas.getContext('2d');
		if (!captureContext) {
			this.#wrapped.restore();
			throw new Error('Could not create an OffscreenCanvas 2D context.');
		}

		this.#captureContext = captureContext;
		try {
			const sourceSize = this.#wrapped.getSize();
			this.#assertValidSize(sourceSize.width, sourceSize.height);
			syncDisplayCanvasSize(
				this.#wrapped.canvas,
				window.innerWidth,
				window.innerHeight,
				window.devicePixelRatio,
			);
			const initialCrop = this.#crop ?? {left: 0, top: 0, ...sourceSize};
			syncCanvasSize(
				this.#captureCanvas,
				initialCrop.width,
				initialCrop.height,
				this.#scale,
			);
		} catch (error) {
			this.#wrapped.restore();
			throw error;
		}

		this.#recorder = new CanvasCaptureRecorder({
			format,
			getContentRect: this.#getRecordingRect,
			getDensity: () => this.#scale,
			getFilename: () => getFilename(format),
		});
		this.#wrapped.canvas.addEventListener('paint', this.#onPaint);
		window.addEventListener('scroll', this.#requestPaint, true);
		this.#resizeObserver = new ResizeObserver(this.#requestPaint);
		this.#resizeObserver.observe(this.#wrapped.content);
		this.#dragImages = captureDragImages({
			density: Math.max(window.devicePixelRatio, scale),
			requestPaint: this.#requestPaint,
		});
	}

	start = async () => {
		const {width, height} = this.#wrapped.getSize();
		const outputSize = this.#assertValidSize(width, height);
		await assertCanEncodeCapture(this.#format, outputSize);
		await this.#recorder.startRecording();
		this.#requestPaint();
	};

	preview = async () => {
		// Wait for the drawable subtree to paint before reading its pixels.
		await new Promise<void>((resolve, reject) => {
			let timeout = 0;
			const onPaint = () => {
				clearTimeout(timeout);
				resolve();
			};

			timeout = window.setTimeout(() => {
				this.#wrapped.canvas.removeEventListener('paint', onPaint);
				reject(new Error('The shot preview did not paint in time.'));
			}, 5000);
			this.#wrapped.canvas.addEventListener('paint', onPaint, {once: true});
			this.#requestPaint();
		});
		if (this.#paintError) {
			throw this.#paintError;
		}

		this.#draw();
		return this.#captureCanvas.convertToBlob({type: 'image/png'});
	};

	stop = async () => {
		try {
			if (this.#paintError) {
				throw this.#paintError;
			}

			this.#draw();
			const file = await this.#recorder.stopRecording();
			if (!file) {
				throw new Error('No canvas recording was available to open.');
			}

			return file;
		} finally {
			this.restore();
		}
	};

	restore = () => {
		if (this.#restored) {
			return;
		}

		this.#restored = true;
		this.#dragImages.dispose();
		this.#resizeObserver.disconnect();
		this.#wrapped.canvas.removeEventListener('paint', this.#onPaint);
		window.removeEventListener('scroll', this.#requestPaint, true);
		this.#recorder.dispose();
		this.#wrapped.restore();
	};

	#assertValidSize = (width: number, height: number) => {
		return validateCaptureSize({
			width,
			height,
			crop: this.#crop,
			scale: this.#scale,
		});
	};

	#requestPaint = () => {
		this.#wrapped.canvas.requestPaint?.();
	};

	#getRecordingRect = () => {
		const crop = this.#crop;
		if (!crop) {
			const {left, top} = this.#wrapped.getViewportOrigin();
			const {width, height} = this.#wrapped.getSize();
			return new DOMRect(left, top, width, height);
		}

		return new DOMRect(crop.left, crop.top, crop.width, crop.height);
	};

	#draw = () => {
		if (this.#restored) {
			return;
		}

		const {width, height} = this.#wrapped.getSize();
		if (width <= 0 || height <= 0) {
			return;
		}

		this.#assertValidSize(width, height);
		const origin = this.#wrapped.getViewportOrigin();
		const crop = this.#crop ?? {...origin, width, height};
		try {
			// Rasterize only the output rectangle. Drawing with offsets clips the
			// page's paint record without allocating a full-page bitmap.
			syncCanvasSize(
				this.#wrapped.canvas,
				crop.width,
				crop.height,
				this.#scale,
			);
			syncCanvasSize(this.#captureCanvas, crop.width, crop.height, this.#scale);
			resetCanvas(this.#context, this.#wrapped.canvas);
			this.#context.scale(
				this.#wrapped.canvas.width / crop.width,
				this.#wrapped.canvas.height / crop.height,
			);
			this.#context.drawElementImage!(
				this.#wrapped.content,
				origin.left - crop.left,
				origin.top - crop.top,
				width,
				height,
				{preserveElementGeometry: true},
			);
			resetCanvas(this.#captureContext, this.#captureCanvas);
			for (const color of this.#matteColors) {
				this.#captureContext.fillStyle = color;
				this.#captureContext.fillRect(
					0,
					0,
					this.#captureCanvas.width,
					this.#captureCanvas.height,
				);
			}

			this.#captureContext.drawImage(this.#wrapped.canvas, 0, 0);
			this.#dragImages.draw(this.#captureContext, this.#getRecordingRect(), {
				canvas: this.#wrapped.canvas,
				content: this.#wrapped.content,
				rect: new DOMRect(crop.left, crop.top, crop.width, crop.height),
				backgroundColors: this.#matteColors,
			});
			this.#recorder.addFrame(this.#captureCanvas);
		} finally {
			// Only the final viewport pass is presented on screen. Its geometry
			// update keeps hit testing aligned with the visible page after scrolling.
			this.#wrapped.canvas.style.width = `${window.innerWidth}px`;
			this.#wrapped.canvas.style.height = `${window.innerHeight}px`;
			syncDisplayCanvasSize(
				this.#wrapped.canvas,
				window.innerWidth,
				window.innerHeight,
				window.devicePixelRatio,
			);
			resetCanvas(this.#context, this.#wrapped.canvas);
			this.#context.scale(
				this.#wrapped.canvas.width / window.innerWidth,
				this.#wrapped.canvas.height / window.innerHeight,
			);
			this.#context.drawElementImage!(
				this.#wrapped.content,
				origin.left,
				origin.top,
				width,
				height,
			);
		}
	};

	#onPaint = () => {
		try {
			this.#draw();
		} catch (error) {
			if (this.#paintError === null) {
				// eslint-disable-next-line no-console -- Surface capture failures in the page DevTools console.
				console.error(
					'[Remotion Canvas Capture] Failed to paint a frame',
					error,
				);
				this.#paintError = error;
			}
		}
	};
}
