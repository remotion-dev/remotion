import type {CropRectangle} from 'mediabunny';
import {
	CanvasCaptureRecorder,
	type HtmlInCanvasElement,
	type HtmlInCanvasRenderingContext2D,
	resetCanvas,
	syncCanvasSize,
} from './recorder';

const maxCanvasDimension = 32_767;

export type CaptureCrop = CropRectangle;

type WrappedElement = {
	readonly canvas: HtmlInCanvasElement;
	readonly content: Element;
	readonly getSize: () => {readonly width: number; readonly height: number};
	readonly restore: () => void;
};

const copyOuterLayout = ({
	from,
	to,
	width,
	height,
}: {
	readonly from: Element;
	readonly to: HTMLCanvasElement;
	readonly width: number;
	readonly height: number;
}) => {
	const computed = window.getComputedStyle(from);
	const properties = [
		'top',
		'right',
		'bottom',
		'left',
		'z-index',
		'float',
		'clear',
		'vertical-align',
		'align-self',
		'justify-self',
		'order',
		'flex',
		'grid-area',
		'margin-top',
		'margin-right',
		'margin-bottom',
		'margin-left',
	] as const;

	to.style.boxSizing = 'border-box';
	to.style.display = computed.display === 'inline' ? 'inline-block' : 'block';
	to.style.position =
		computed.position === 'static' ? 'relative' : computed.position;
	to.style.width = `${width}px`;
	to.style.height = `${height}px`;
	for (const property of properties) {
		to.style.setProperty(property, computed.getPropertyValue(property));
	}
};

const wrapElement = (element: Element): WrappedElement => {
	const parent = element.parentNode;
	if (!parent) {
		throw new Error('The selected element is no longer attached to the page.');
	}

	const rect = element.getBoundingClientRect();
	if (rect.width <= 0 || rect.height <= 0) {
		throw new Error('The selected element has no visible size.');
	}

	const marker = document.createComment('remotion-canvas-capture');
	const originalStyle = element.getAttribute('style');
	const canvas = document.createElement('canvas') as HtmlInCanvasElement;
	copyOuterLayout({
		from: element,
		to: canvas,
		width: rect.width,
		height: rect.height,
	});
	canvas.layoutSubtree = true;
	canvas.setAttribute('layoutsubtree', '');

	parent.insertBefore(marker, element);
	parent.replaceChild(canvas, element);
	canvas.appendChild(element);

	if (element instanceof HTMLElement || element instanceof SVGElement) {
		element.style.position = 'absolute';
		element.style.inset = '0';
		element.style.width = '100%';
		element.style.height = '100%';
		element.style.margin = '0';
	}

	return {
		canvas,
		content: element,
		getSize: () => ({width: rect.width, height: rect.height}),
		restore: () => {
			if (element instanceof HTMLElement || element instanceof SVGElement) {
				if (originalStyle === null) {
					element.removeAttribute('style');
				} else {
					element.setAttribute('style', originalStyle);
				}
			}

			if (canvas.parentNode) {
				canvas.parentNode.replaceChild(element, canvas);
			} else if (marker.parentNode) {
				marker.parentNode.insertBefore(element, marker.nextSibling);
			}

			marker.remove();
		},
	};
};

const getPageSize = (
	content: HTMLElement,
	minimum: {readonly width: number; readonly height: number},
) => ({
	width: Math.max(minimum.width, content.scrollWidth, window.innerWidth),
	height: Math.max(minimum.height, content.scrollHeight, window.innerHeight),
});

const wrapWholePage = (): WrappedElement => {
	const {body} = document;
	const minimumSize = {
		width: Math.max(
			document.documentElement.scrollWidth,
			body.scrollWidth,
			window.innerWidth,
		),
		height: Math.max(
			document.documentElement.scrollHeight,
			body.scrollHeight,
			window.innerHeight,
		),
	};
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

const getFilename = () => {
	const host = location.hostname.replace(/[^a-z0-9.-]+/gi, '-') || 'page';
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
	return `remotion-capture-${host}-${timestamp}.webm`;
};

export class ElementCapture {
	readonly #wrapped: WrappedElement;
	readonly #scale: number;
	readonly #crop: CaptureCrop | null;
	readonly #recorder: CanvasCaptureRecorder;
	readonly #context: HtmlInCanvasRenderingContext2D;
	readonly #resizeObserver: ResizeObserver;
	#restored = false;
	#paintError: unknown = null;

	constructor({
		element,
		wholePage,
		scale,
		crop,
	}: {
		readonly element: Element | null;
		readonly wholePage: boolean;
		readonly scale: number;
		readonly crop: CaptureCrop | null;
	}) {
		this.#scale = scale;
		this.#crop = crop;
		this.#wrapped = wholePage ? wrapWholePage() : wrapElement(element!);
		const context = this.#wrapped.canvas.getContext(
			'2d',
		) as HtmlInCanvasRenderingContext2D | null;
		if (!context || typeof context.drawElementImage !== 'function') {
			this.#wrapped.restore();
			throw new Error(
				'drawElementImage() is not available in this Chrome build.',
			);
		}

		this.#context = context;
		const sourceSize = this.#wrapped.getSize();
		this.#assertValidSize(sourceSize.width, sourceSize.height);
		syncCanvasSize(
			this.#wrapped.canvas,
			sourceSize.width,
			sourceSize.height,
			this.#scale,
		);

		this.#recorder = new CanvasCaptureRecorder({
			canvas: this.#wrapped.canvas,
			crop: this.#getMediabunnyCrop(sourceSize.width, sourceSize.height),
			getContentRect: this.#getRecordingRect,
			getDensity: () => this.#scale,
			getFilename,
		});
		this.#wrapped.canvas.addEventListener('paint', this.#onPaint);
		this.#resizeObserver = new ResizeObserver(this.#requestPaint);
		this.#resizeObserver.observe(this.#wrapped.content);
	}

	start = async () => {
		const {width, height} = this.#wrapped.getSize();
		this.#assertValidSize(width, height);
		syncCanvasSize(this.#wrapped.canvas, width, height, this.#scale);
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
		if (
			width * this.#scale > maxCanvasDimension ||
			height * this.#scale > maxCanvasDimension
		) {
			throw new Error(
				`The ${Math.round(width)}×${Math.round(height)} selection is too large at ${this.#scale}× scale.`,
			);
		}
	};

	#requestPaint = () => {
		this.#wrapped.canvas.requestPaint?.();
	};

	#resolveCrop = (sourceWidth: number, sourceHeight: number) => {
		if (!this.#crop) {
			return null;
		}

		const left = Math.max(0, Math.min(this.#crop.left, sourceWidth - 1));
		const top = Math.max(0, Math.min(this.#crop.top, sourceHeight - 1));
		return {
			left,
			top,
			width: Math.max(1, Math.min(this.#crop.width, sourceWidth - left)),
			height: Math.max(1, Math.min(this.#crop.height, sourceHeight - top)),
		};
	};

	#getMediabunnyCrop = (
		sourceWidth: number,
		sourceHeight: number,
	): CropRectangle | undefined => {
		const crop = this.#resolveCrop(sourceWidth, sourceHeight);
		if (!crop) {
			return undefined;
		}

		const left = Math.max(
			0,
			Math.min(
				Math.round(crop.left * this.#scale),
				this.#wrapped.canvas.width - 1,
			),
		);
		const top = Math.max(
			0,
			Math.min(
				Math.round(crop.top * this.#scale),
				this.#wrapped.canvas.height - 1,
			),
		);
		const right = Math.max(
			left + 1,
			Math.min(
				Math.round((crop.left + crop.width) * this.#scale),
				this.#wrapped.canvas.width,
			),
		);
		const bottom = Math.max(
			top + 1,
			Math.min(
				Math.round((crop.top + crop.height) * this.#scale),
				this.#wrapped.canvas.height,
			),
		);

		return {
			left,
			top,
			width: right - left,
			height: bottom - top,
		};
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
		syncCanvasSize(this.#wrapped.canvas, width, height, this.#scale);
		resetCanvas(this.#context, this.#wrapped.canvas);
		this.#context.scale(this.#scale, this.#scale);
		this.#context.drawElementImage!(this.#wrapped.content, 0, 0, width, height);

		this.#recorder.addFrame();
	};

	#onPaint = () => {
		try {
			this.#draw();
		} catch (error) {
			this.#paintError = error;
		}
	};
}
