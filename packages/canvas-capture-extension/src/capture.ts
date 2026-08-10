import type {CropRectangle} from 'mediabunny';
import type {CaptureFormat} from './messages';
import {
	assertCanEncodeCapture,
	CanvasCaptureRecorder,
	getScaledCanvasSize,
	type HtmlInCanvasElement,
	type HtmlInCanvasOffscreenRenderingContext2D,
	type HtmlInCanvasRenderingContext2D,
	resetCanvas,
	syncCanvasSize,
	syncDisplayCanvasSize,
} from './recorder';

const maxCanvasDimension = 32_767;
const maxEncodedDimension = 32_766;

export type CaptureCrop = CropRectangle;

export type CapturePreflight = {
	readonly sourceSize: {readonly width: number; readonly height: number};
	readonly outputSize: {readonly width: number; readonly height: number};
};

type WrappedPage = {
	readonly canvas: HtmlInCanvasElement;
	readonly content: HTMLElement;
	readonly getSize: () => {readonly width: number; readonly height: number};
	readonly restore: () => void;
};

const getPageSize = (
	content: HTMLElement,
	minimum: {readonly width: number; readonly height: number},
) => ({
	width: Math.max(minimum.width, content.scrollWidth, window.innerWidth),
	height: Math.max(minimum.height, content.scrollHeight, window.innerHeight),
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

const resolveCrop = (
	crop: CaptureCrop | null,
	sourceWidth: number,
	sourceHeight: number,
) => {
	if (!crop) {
		return null;
	}

	const left = Math.max(0, Math.min(crop.left, sourceWidth - 1));
	const top = Math.max(0, Math.min(crop.top, sourceHeight - 1));
	return {
		left,
		top,
		width: Math.max(1, Math.min(crop.width, sourceWidth - left)),
		height: Math.max(1, Math.min(crop.height, sourceHeight - top)),
	};
};

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
	const resolvedCrop = resolveCrop(crop, width, height) ?? {
		left: 0,
		top: 0,
		width,
		height,
	};
	const displayWidth = Math.max(1, Math.round(width * window.devicePixelRatio));
	const displayHeight = Math.max(
		1,
		Math.round(height * window.devicePixelRatio),
	);
	const outputSize = getScaledCanvasSize(
		resolvedCrop.width,
		resolvedCrop.height,
		scale,
	);
	if (displayWidth > maxCanvasDimension || displayHeight > maxCanvasDimension) {
		throw new Error(
			`The display canvas would be ${displayWidth}×${displayHeight} pixels; its maximum side is ${maxCanvasDimension.toLocaleString()} pixels.`,
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

const wrapWholePage = (): WrappedPage => {
	const {body} = document;
	const minimumSize = getWholePageSize();
	const canvas = document.createElement('canvas') as HtmlInCanvasElement;
	const content = document.createElement('div');
	canvas.layoutSubtree = true;
	canvas.setAttribute('layoutsubtree', '');
	canvas.style.display = 'block';
	canvas.style.position = 'relative';
	content.style.position = 'absolute';
	content.style.inset = '0';
	content.style.display = 'block';

	for (const child of [...body.childNodes]) {
		content.appendChild(child);
	}

	body.appendChild(canvas);
	canvas.appendChild(content);
	const initialSize = getPageSize(content, minimumSize);
	canvas.style.width = `${initialSize.width}px`;
	canvas.style.height = `${initialSize.height}px`;
	content.style.width = `${initialSize.width}px`;
	content.style.height = `${initialSize.height}px`;

	let movingNode = false;
	const observer = new MutationObserver((records) => {
		if (movingNode) {
			return;
		}

		for (const record of records) {
			for (const node of record.addedNodes) {
				if (node === canvas || node.parentNode !== body) {
					continue;
				}

				movingNode = true;
				content.appendChild(node);
				movingNode = false;
			}
		}
	});
	observer.observe(body, {childList: true});

	return {
		canvas,
		content,
		getSize: () => {
			const size = getPageSize(content, minimumSize);
			canvas.style.width = `${size.width}px`;
			canvas.style.height = `${size.height}px`;
			content.style.width = `${size.width}px`;
			content.style.height = `${size.height}px`;
			return size;
		},
		restore: () => {
			observer.disconnect();
			while (content.firstChild) {
				body.insertBefore(content.firstChild, canvas);
			}

			canvas.remove();
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
	readonly #captureContext: HtmlInCanvasOffscreenRenderingContext2D;
	readonly #matteColors: readonly string[];
	readonly #resizeObserver: ResizeObserver;
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
		if (
			!context ||
			typeof context.drawElementImage !== 'function' ||
			typeof this.#wrapped.canvas.captureElementImage !== 'function'
		) {
			this.#wrapped.restore();
			throw new Error(
				'The required HTML-in-canvas APIs are unavailable. Open chrome://flags/#canvas-draw-element, set Canvas Draw Element to Enabled, then fully quit and reopen the browser.',
			);
		}

		this.#context = context;
		this.#captureCanvas = new OffscreenCanvas(2, 2);
		const captureContext = this.#captureCanvas.getContext(
			'2d',
		) as HtmlInCanvasOffscreenRenderingContext2D | null;
		if (
			!captureContext ||
			typeof captureContext.drawElementImage !== 'function'
		) {
			this.#wrapped.restore();
			throw new Error(
				'Could not create an HTML-in-canvas OffscreenCanvas 2D context.',
			);
		}

		this.#captureContext = captureContext;
		try {
			const sourceSize = this.#wrapped.getSize();
			this.#assertValidSize(sourceSize.width, sourceSize.height);
			syncDisplayCanvasSize(
				this.#wrapped.canvas,
				sourceSize.width,
				sourceSize.height,
				window.devicePixelRatio,
			);
			const initialCrop = this.#resolveCrop(
				sourceSize.width,
				sourceSize.height,
			) ?? {left: 0, top: 0, ...sourceSize};
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
		this.#resizeObserver = new ResizeObserver(this.#requestPaint);
		this.#resizeObserver.observe(this.#wrapped.content);
	}

	start = async () => {
		const {width, height} = this.#wrapped.getSize();
		const outputSize = this.#assertValidSize(width, height);
		await assertCanEncodeCapture(this.#format, outputSize);
		syncDisplayCanvasSize(
			this.#wrapped.canvas,
			width,
			height,
			window.devicePixelRatio,
		);
		await this.#recorder.startRecording();
		this.#requestPaint();
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
		this.#resizeObserver.disconnect();
		this.#wrapped.canvas.removeEventListener('paint', this.#onPaint);
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

	#resolveCrop = (sourceWidth: number, sourceHeight: number) => {
		return resolveCrop(this.#crop, sourceWidth, sourceHeight);
	};

	#getRecordingRect = () => {
		const contentRect = this.#wrapped.content.getBoundingClientRect();
		const crop = this.#resolveCrop(contentRect.width, contentRect.height);
		if (!crop) {
			return contentRect;
		}

		return new DOMRect(
			contentRect.left + crop.left,
			contentRect.top + crop.top,
			crop.width,
			crop.height,
		);
	};

	#draw = () => {
		const {width, height} = this.#wrapped.getSize();
		if (width <= 0 || height <= 0) {
			return;
		}

		this.#assertValidSize(width, height);
		const crop = this.#resolveCrop(width, height) ?? {
			left: 0,
			top: 0,
			width,
			height,
		};
		syncDisplayCanvasSize(
			this.#wrapped.canvas,
			width,
			height,
			window.devicePixelRatio,
		);
		syncCanvasSize(this.#captureCanvas, crop.width, crop.height, this.#scale);
		resetCanvas(this.#context, this.#wrapped.canvas);
		const displayScaleX = this.#wrapped.canvas.width / width;
		const displayScaleY = this.#wrapped.canvas.height / height;
		this.#context.scale(displayScaleX, displayScaleY);
		this.#context.drawElementImage!(this.#wrapped.content, 0, 0, width, height);

		const elementImage = this.#wrapped.canvas.captureElementImage!(
			this.#wrapped.content,
		);
		try {
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

			this.#captureContext.drawElementImage!(
				elementImage,
				crop.left,
				crop.top,
				crop.width,
				crop.height,
				0,
				0,
				this.#captureCanvas.width,
				this.#captureCanvas.height,
			);

			this.#recorder.addFrame(this.#captureCanvas);
		} finally {
			elementImage.close();
		}
	};

	#onPaint = () => {
		try {
			this.#draw();
		} catch (error) {
			this.#paintError = error;
		}
	};
}
