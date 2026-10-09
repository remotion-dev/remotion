import {
	disableDragImageCaptureEvent,
	dragImageCaptureEvent,
	enableDragImageCaptureEvent,
} from './drag-image-events';
import type {
	HtmlInCanvasElement,
	HtmlInCanvasRenderingContext2D,
} from './recorder';

export const captureDragImages = ({
	density,
	requestPaint,
}: {
	readonly density: number;
	readonly requestPaint: () => void;
}) => {
	let dataTransfer: DataTransfer | null = null;
	let dragStart: DragEvent | null = null;
	let stagingCanvas: HTMLCanvasElement | null = null;
	let pendingDefaultPreview: {
		readonly element: HTMLElement;
		readonly x: number;
		readonly y: number;
	} | null = null;
	let preview: {
		readonly canvas: OffscreenCanvas;
		readonly width: number;
		readonly height: number;
		readonly x: number;
		readonly y: number;
	} | null = null;
	let clientX = 0;
	let clientY = 0;
	let visible = false;

	const getSnapshotSize = (width: number, height: number) => {
		const snapshotDensity = Math.min(
			density,
			8192 / width,
			8192 / height,
			Math.sqrt(16_777_216 / (width * height)),
		);
		return {
			width: Math.max(1, Math.ceil(width * snapshotDensity)),
			height: Math.max(1, Math.ceil(height * snapshotDensity)),
		};
	};

	const clear = () => {
		stagingCanvas?.remove();
		stagingCanvas = null;
		preview = null;
		pendingDefaultPreview = null;
		dataTransfer = null;
		dragStart = null;
		visible = false;
		requestPaint();
	};

	const onDragOver = (event: DragEvent) => {
		if (dataTransfer === null) {
			return;
		}

		clientX = event.clientX;
		clientY = event.clientY;
		visible = true;
		requestPaint();
	};

	const onDragLeave = (event: DragEvent) => {
		if (event.relatedTarget === null) {
			visible = false;
			requestPaint();
		}
	};

	const capturePreview = ({
		element,
		x,
		y,
		useIntrinsicImageSize,
	}: {
		readonly element: Element;
		readonly x: number;
		readonly y: number;
		readonly useIntrinsicImageSize: boolean;
	}) => {
		stagingCanvas?.remove();
		stagingCanvas = null;
		preview = null;
		pendingDefaultPreview = null;
		requestPaint();

		try {
			const rect = element.getBoundingClientRect();
			const isImage =
				useIntrinsicImageSize && element instanceof HTMLImageElement;
			const width = isImage ? element.naturalWidth : rect.width;
			const height = isImage ? element.naturalHeight : rect.height;
			if (width <= 0 || height <= 0) {
				return;
			}

			// Preserve temporary previews synchronously: sites often remove the
			// original on the next animation frame, before canvas can snapshot it.
			const clone = element.cloneNode(true) as Element;
			const sources = [element, ...element.querySelectorAll('*')];
			const clones = [clone, ...clone.querySelectorAll('*')];
			for (let i = 0; i < sources.length; i++) {
				const source = sources[i];
				const target = clones[i];
				if (!source || !target) {
					continue;
				}

				if (target.matches('script, iframe, object, embed, link, style')) {
					target.remove();
					continue;
				}

				for (const attribute of [...target.attributes]) {
					if (attribute.name.startsWith('on')) {
						target.removeAttribute(attribute.name);
					}
				}

				if (target instanceof HTMLElement || target instanceof SVGElement) {
					const computed = getComputedStyle(source);
					for (const property of computed) {
						target.style.setProperty(
							property,
							computed.getPropertyValue(property),
							'important',
						);
					}

					target.style.setProperty('animation', 'none', 'important');
					target.style.setProperty('transition', 'none', 'important');
				}

				if (
					source instanceof HTMLCanvasElement &&
					target instanceof HTMLCanvasElement
				) {
					target.getContext('2d')?.drawImage(source, 0, 0);
					target.setAttribute('content', 'drawable');
				} else if (
					source instanceof HTMLImageElement &&
					target instanceof HTMLImageElement
				) {
					target.removeAttribute('srcset');
					target.src = source.currentSrc || source.src;
					target.loading = 'eager';
				} else if (
					(source instanceof HTMLInputElement &&
						target instanceof HTMLInputElement) ||
					(source instanceof HTMLTextAreaElement &&
						target instanceof HTMLTextAreaElement) ||
					(source instanceof HTMLSelectElement &&
						target instanceof HTMLSelectElement)
				) {
					target.value = source.value;
				}
			}

			if (clone instanceof HTMLElement || clone instanceof SVGElement) {
				if (isImage) {
					// setDragImage(img) uses the image's intrinsic pixels, not its CSS.
					clone.style.cssText = 'all: initial !important;';
				}

				for (const [property, value] of Object.entries({
					position: 'relative',
					inset: 'auto',
					margin: '0',
					transform: 'none',
					translate: 'none',
					rotate: 'none',
					scale: 'none',
					width: `${width}px`,
					height: `${height}px`,
					'box-sizing': 'border-box',
					'max-width': 'none',
					'max-height': 'none',
				})) {
					clone.style.setProperty(property, value, 'important');
				}
			}

			const canvas = document.createElement('canvas') as HtmlInCanvasElement;
			canvas.setAttribute('content', 'drawable');
			canvas.layoutSubtree = true;
			canvas.inert = true;
			canvas.setAttribute('aria-hidden', 'true');
			// Hidden/offscreen staging canvases produce empty snapshots in Chrome.
			// Keep this in the viewport, then remove it in paint before it displays.
			canvas.style.cssText = `all: initial !important; position: fixed !important; left: 0 !important; top: 0 !important; width: ${width}px !important; height: ${height}px !important; pointer-events: none !important; z-index: -2147483647 !important;`;
			const snapshotSize = getSnapshotSize(width, height);
			canvas.width = snapshotSize.width;
			canvas.height = snapshotSize.height;
			const wrapper = document.createElement('div');
			wrapper.setAttribute('drawable', '');
			wrapper.style.cssText = `all: initial !important; display: block !important; width: ${width}px !important; height: ${height}px !important;`;
			wrapper.appendChild(clone);
			canvas.appendChild(wrapper);
			stagingCanvas = canvas;
			canvas.addEventListener(
				'paint',
				() => {
					if (stagingCanvas !== canvas) {
						return;
					}

					try {
						if (dragStart?.defaultPrevented) {
							clear();
							return;
						}

						const context = canvas.getContext(
							'2d',
						) as HtmlInCanvasRenderingContext2D | null;
						if (!context?.drawElementImage) {
							return;
						}

						context.scale(canvas.width / width, canvas.height / height);
						context.drawElementImage(wrapper, 0, 0, width, height);
						// A tainted source must never taint the recording canvas.
						context.getImageData(0, 0, 1, 1);
						const snapshot = new OffscreenCanvas(canvas.width, canvas.height);
						const snapshotContext = snapshot.getContext('2d');
						if (!snapshotContext) {
							return;
						}

						snapshotContext.drawImage(canvas, 0, 0);
						preview = {canvas: snapshot, width, height, x, y};
						requestPaint();
					} catch {
						// Unsupported previews should not interrupt the page recording.
					} finally {
						canvas.remove();
						stagingCanvas = null;
					}
				},
				{once: true},
			);
			document.documentElement.appendChild(canvas);
			canvas.requestPaint?.();
		} catch {
			stagingCanvas?.remove();
			stagingCanvas = null;
		}
	};

	const onDragStart = (event: DragEvent) => {
		clear();
		dataTransfer = event.dataTransfer;
		dragStart = event;
		clientX = event.clientX;
		clientY = event.clientY;
		visible = true;
		if (event.target instanceof HTMLElement && event.target.draggable) {
			const rect = event.target.getBoundingClientRect();
			// Wait for the page to paint changes made by dragstart handlers.
			// An explicit setDragImage() call cancels this default snapshot.
			pendingDefaultPreview = {
				element: event.target,
				x: event.clientX - rect.left,
				y: event.clientY - rect.top,
			};
			requestPaint();
		}

		setTimeout(() => {
			if (dragStart === event && event.defaultPrevented) {
				clear();
			}
		});
	};

	const onDragImage = (event: Event) => {
		if (
			!(event instanceof DragEvent) ||
			dataTransfer === null ||
			event.dataTransfer !== dataTransfer ||
			!(event.relatedTarget instanceof Element)
		) {
			return;
		}

		capturePreview({
			element: event.relatedTarget,
			x: event.clientX,
			y: event.clientY,
			useIntrinsicImageSize: true,
		});
	};

	window.addEventListener('dragstart', onDragStart, true);
	window.addEventListener('dragover', onDragOver, true);
	window.addEventListener('dragleave', onDragLeave, true);
	window.addEventListener('dragend', clear, true);
	window.addEventListener('drop', clear, true);
	document.addEventListener(dragImageCaptureEvent, onDragImage);
	document.dispatchEvent(new Event(enableDragImageCaptureEvent));

	return {
		draw: (
			context: OffscreenCanvasRenderingContext2D,
			rect: DOMRect,
			page: {
				readonly canvas: HTMLCanvasElement;
				readonly content: HTMLElement;
				readonly backgroundColors: readonly string[];
			},
		) => {
			if (dragStart?.defaultPrevented) {
				clear();
			}

			if (pendingDefaultPreview) {
				const {element, x, y} = pendingDefaultPreview;
				pendingDefaultPreview = null;
				const sourceRect = element.getBoundingClientRect();
				const style = getComputedStyle(element);
				const parentDisplay = element.parentElement
					? getComputedStyle(element.parentElement).display
					: '';
				const isolatesSource =
					element instanceof HTMLImageElement ||
					Number(style.opacity) < 1 ||
					style.isolation === 'isolate' ||
					style.mixBlendMode !== 'normal' ||
					style.transform !== 'none' ||
					style.translate !== 'none' ||
					style.rotate !== 'none' ||
					style.scale !== 'none' ||
					style.filter !== 'none' ||
					style.backdropFilter !== 'none' ||
					style.perspective !== 'none' ||
					style.clipPath !== 'none' ||
					style.maskImage !== 'none' ||
					style.position === 'fixed' ||
					style.position === 'sticky' ||
					/(layout|paint|strict|content)/.test(style.contain) ||
					/(transform|opacity|filter|perspective|clip-path|mask|mix-blend-mode)/.test(
						style.willChange,
					) ||
					(style.zIndex !== 'auto' &&
						(style.position !== 'static' || /(flex|grid)/.test(parentDisplay)));

				if (isolatesSource || !page.content.contains(element)) {
					// Isolated elements and images can have intentional transparency.
					capturePreview({element, x, y, useIntrinsicImageSize: false});
				} else if (sourceRect.width > 0 && sourceRect.height > 0) {
					// Chrome includes content behind non-isolated drag sources. Copy
					// the freshly painted page so translucent fills retain that backdrop.
					const pageRect = page.content.getBoundingClientRect();
					const size = getSnapshotSize(sourceRect.width, sourceRect.height);
					const snapshot = new OffscreenCanvas(size.width, size.height);
					const snapshotContext = snapshot.getContext('2d');
					if (snapshotContext && pageRect.width > 0 && pageRect.height > 0) {
						for (const color of page.backgroundColors) {
							snapshotContext.fillStyle = color;
							snapshotContext.fillRect(0, 0, size.width, size.height);
						}

						const sourceScaleX = page.canvas.width / pageRect.width;
						const sourceScaleY = page.canvas.height / pageRect.height;
						snapshotContext.drawImage(
							page.canvas,
							(sourceRect.left - pageRect.left) * sourceScaleX,
							(sourceRect.top - pageRect.top) * sourceScaleY,
							sourceRect.width * sourceScaleX,
							sourceRect.height * sourceScaleY,
							0,
							0,
							size.width,
							size.height,
						);
						preview = {
							canvas: snapshot,
							width: sourceRect.width,
							height: sourceRect.height,
							x,
							y,
						};
					}
				}
			}

			if (!preview || !visible) {
				return;
			}

			const scaleX = context.canvas.width / rect.width;
			const scaleY = context.canvas.height / rect.height;
			context.drawImage(
				preview.canvas,
				(clientX - rect.left - preview.x) * scaleX,
				(clientY - rect.top - preview.y) * scaleY,
				preview.width * scaleX,
				preview.height * scaleY,
			);
		},
		dispose: () => {
			document.dispatchEvent(new Event(disableDragImageCaptureEvent));
			document.removeEventListener(dragImageCaptureEvent, onDragImage);
			window.removeEventListener('dragstart', onDragStart, true);
			window.removeEventListener('dragover', onDragOver, true);
			window.removeEventListener('dragleave', onDragLeave, true);
			window.removeEventListener('dragend', clear, true);
			window.removeEventListener('drop', clear, true);
			clear();
		},
	};
};
