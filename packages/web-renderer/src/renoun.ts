/* eslint-disable max-params */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-console */
/* eslint-disable eqeqeq */
/* eslint-disable no-eq-null */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable default-case */
/* eslint-disable func-names */
/* eslint-disable @typescript-eslint/no-use-before-define */
const graphemeSegmenter = new Intl.Segmenter(undefined, {
	granularity: 'grapheme',
});

/** Segment a string into user-perceived characters (grapheme clusters). */
function segmentGraphemes(text: string) {
	if (!text) return [];
	const segments = graphemeSegmenter.segment(text);
	const result: string[] = [];
	for (const segment of segments) {
		result.push(segment.segment);
	}

	return result;
}

type ParsedCssColor = {
	type: 'rgb' | 'hsl';
	values: [number, number, number];
	alpha: number;
};

function parseCssColor(input: string): ParsedCssColor | null {
	const string = input.trim();
	if (!string) return null;

	// transparent keyword
	if (/^transparent$/i.test(string)) {
		return {type: 'rgb', values: [0, 0, 0], alpha: 0};
	}

	// Hex formats: #RGB, #RGBA, #RRGGBB, #RRGGBBAA
	const hexMatch = string.match(/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
	if (hexMatch) {
		const hex = hexMatch[1];
		const to255 = (hexString: string) => parseInt(hexString, 16);

		let red: number;
		let green: number;
		let blue: number;
		let alpha = 1;

		if (hex.length === 3 || hex.length === 4) {
			// #RGB or #RGBA
			red = to255(hex[0] + hex[0]);
			green = to255(hex[1] + hex[1]);
			blue = to255(hex[2] + hex[2]);
			if (hex.length === 4) {
				alpha = to255(hex[3] + hex[3]) / 255;
			}
		} else {
			// #RRGGBB or #RRGGBBAA
			red = to255(hex.slice(0, 2));
			green = to255(hex.slice(2, 4));
			blue = to255(hex.slice(4, 6));
			if (hex.length === 8) {
				alpha = to255(hex.slice(6, 8)) / 255;
			}
		}

		return {
			type: 'rgb',
			values: [red, green, blue],
			alpha: clamp01(alpha),
		};
	}

	// rgb()/rgba()
	const rgbMatch = string.match(/^rgba?\((.*)\)$/i);
	if (rgbMatch) {
		const body = rgbMatch[1].trim();

		let colorPart = body;
		let alphaPart: string | undefined;

		if (body.includes('/')) {
			const split = body.split('/');
			colorPart = split[0].trim();
			alphaPart = split[1]?.trim();
		}

		const rawTokens: string[] = [];
		const tokenRegex = /[, \t\r\n]+/;
		let start = 0;
		for (let index = 0; index < colorPart.length; index++) {
			if (tokenRegex.test(colorPart[index])) {
				if (index > start) {
					const token = colorPart.slice(start, index).trim();
					if (token) rawTokens.push(token);
				}

				start = index + 1;
			}
		}

		if (start < colorPart.length) {
			const token = colorPart.slice(start).trim();
			if (token) rawTokens.push(token);
		}

		if (rawTokens.length !== 3 && rawTokens.length !== 4) {
			return null;
		}

		let mainTokens = rawTokens;
		if (!alphaPart && rawTokens.length === 4) {
			alphaPart = rawTokens[3];
			mainTokens = rawTokens.slice(0, 3);
		} else {
			mainTokens = rawTokens.slice(0, 3);
		}

		const toChannel = (token: string): number => {
			if (token.endsWith('%')) {
				const value = parseFloat(token);
				if (!Number.isFinite(value)) return 0;
				const clamped = Math.min(100, Math.max(0, value));
				return Math.round((clamped / 100) * 255);
			}

			const value = parseFloat(token);
			if (!Number.isFinite(value)) return 0;
			const clamped = Math.min(255, Math.max(0, value));
			return Math.round(clamped);
		};

		const [redRaw, greenRaw, blueRaw] = mainTokens;
		const red = toChannel(redRaw);
		const green = toChannel(greenRaw);
		const blue = toChannel(blueRaw);

		const alpha = alphaPart != null ? parseAlpha(alphaPart) : 1;

		return {
			type: 'rgb',
			values: [red, green, blue],
			alpha,
		};
	}

	// hsl()/hsla()
	const hslMatch = string.match(/^hsla?\((.*)\)$/i);
	if (hslMatch) {
		const body = hslMatch[1].trim();

		let colorPart = body;
		let alphaPart: string | undefined;

		if (body.includes('/')) {
			const split = body.split('/');
			colorPart = split[0].trim();
			alphaPart = split[1]?.trim();
		}

		const rawTokens: string[] = [];
		const tokenRegex = /[, \t\r\n]+/;
		let start = 0;
		for (let index = 0; index < colorPart.length; index++) {
			if (tokenRegex.test(colorPart[index])) {
				if (index > start) {
					const token = colorPart.slice(start, index).trim();
					if (token) rawTokens.push(token);
				}

				start = index + 1;
			}
		}

		if (start < colorPart.length) {
			const token = colorPart.slice(start).trim();
			if (token) rawTokens.push(token);
		}

		if (rawTokens.length !== 3 && rawTokens.length !== 4) {
			return null;
		}

		let mainTokens = rawTokens;
		if (!alphaPart && rawTokens.length === 4) {
			alphaPart = rawTokens[3];
			mainTokens = rawTokens.slice(0, 3);
		} else {
			mainTokens = rawTokens.slice(0, 3);
		}

		const [hueRaw, saturationRaw, lightnessRaw] = mainTokens;

		const parseHue = (token: string): number | null => {
			const match = token.match(/^(-?\d*\.?\d+)(deg|rad|turn|grad)?$/);
			if (!match) return null;
			const value = parseFloat(match[1]);
			if (!Number.isFinite(value)) return null;
			const unit = match[2] || 'deg';
			let degrees = value;
			switch (unit) {
				case 'turn':
					degrees = value * 360;
					break;
				case 'rad':
					degrees = (value * 180) / Math.PI;
					break;
				case 'grad':
					degrees = value * 0.9;
					break;
				case 'deg':
				default:
					break;
			}

			// Normalize to [0, 360)
			const normalized = ((degrees % 360) + 360) % 360;
			return normalized;
		};

		const parsePercent = (token: string): number | null => {
			if (!token.endsWith('%')) return null;
			const value = parseFloat(token);
			if (!Number.isFinite(value)) return null;
			return Math.min(100, Math.max(0, value));
		};

		const hue = parseHue(hueRaw);
		const saturation = parsePercent(saturationRaw);
		const lightness = parsePercent(lightnessRaw);
		if (hue == null || saturation == null || lightness == null) {
			return null;
		}

		const alpha = alphaPart != null ? parseAlpha(alphaPart) : 1;

		return {
			type: 'hsl',
			values: [hue, saturation, lightness],
			alpha,
		};
	}

	// Fallback: ask the browser's Canvas2D implementation to parse any modern
	// CSS color spaces (hwb(), lab(), lch(), oklab(), color(display-p3 ...),
	// named colors, etc.) that we don't handle explicitly above. This keeps the
	// parser aligned with the platform's supported color syntax without
	// re‑implementing every color space conversion by hand.
	const sampled = sampleCssColorViaCanvas(string);
	if (sampled) {
		return sampled;
	}

	return null;
}

let colorSamplingContext: CanvasRenderingContext2D | null | undefined;

function getColorSamplingContext(): CanvasRenderingContext2D | null {
	if (colorSamplingContext !== undefined) {
		return colorSamplingContext;
	}

	// Only available in real browser/DOM environments.
	if (typeof document === 'undefined') {
		colorSamplingContext = null;
		return null;
	}

	try {
		const canvas = document.createElement('canvas');
		canvas.width = 1;
		canvas.height = 1;
		const isP3 = window.matchMedia('(color-gamut: p3)').matches;
		const colorSpace = isP3 ? 'display-p3' : 'srgb';
		const context = canvas.getContext('2d', {colorSpace});

		if (!context || typeof context.getImageData !== 'function') {
			colorSamplingContext = null;
			return null;
		}

		colorSamplingContext = context;
		return context;
	} catch {
		colorSamplingContext = null;
		return null;
	}
}

function sampleCssColorViaCanvas(input: string): ParsedCssColor | null {
	const context = getColorSamplingContext();
	if (!context) return null;

	const trimmed = input.trim();
	if (!trimmed) return null;

	const {canvas} = context;
	if (!canvas) return null;

	// Reset to a known small size and clear previous contents.
	canvas.width = 1;
	canvas.height = 1;

	try {
		context.clearRect(0, 0, 1, 1);
		// Setting `fillStyle` to an unsupported value is ignored by the browser,
		// leaving the previous style in place. We detect this by:
		// 1. Setting a known color first
		// 2. Attempting to set the input color
		// 3. Reading back fillStyle to verify it was actually set
		// 4. Sampling the pixel and comparing against the known color
		context.fillStyle = '#000000';
		const initialFillStyle = context.fillStyle;
		context.fillStyle = trimmed;
		const actualFillStyle = context.fillStyle;

		// If fillStyle wasn't actually set (assignment was ignored), return null
		if (actualFillStyle === initialFillStyle) {
			if (typeof console !== 'undefined' && console.warn) {
				console.warn(
					`[screenshot] Invalid color value ignored: "${trimmed}". Falling back to null.`,
				);
			}

			return null;
		}

		context.fillRect(0, 0, 1, 1);

		const imageData = context.getImageData(0, 0, 1, 1);
		if (!imageData || !imageData.data || imageData.data.length < 4) {
			return null;
		}

		const {data} = imageData;
		const red = data[0] ?? 0;
		const green = data[1] ?? 0;
		const blue = data[2] ?? 0;
		const alphaByte = data[3] ?? 255;

		// Additional check: if the sampled color is exactly black (0,0,0) and we
		// didn't explicitly set black, it might indicate the assignment was ignored.
		// However, we already check fillStyle above, so this is just a safety check.
		// Note: We can't rely solely on pixel color comparison because the input
		// might legitimately be black.

		return {
			type: 'rgb',
			values: [red, green, blue],
			alpha: clamp01(alphaByte / 255),
		};
	} catch {
		return null;
	}
}

function clamp01(value: number): number {
	if (!Number.isFinite(value)) return 0;
	if (value <= 0) return 0;
	if (value >= 1) return 1;
	return value;
}

function parseAlpha(token: string): number {
	const trimmed = token.trim();
	if (!trimmed) return 1;
	if (trimmed.endsWith('%')) {
		const value = parseFloat(trimmed);
		if (!Number.isFinite(value)) return 1;
		return clamp01(value / 100);
	}

	const value = parseFloat(trimmed);
	if (!Number.isFinite(value)) return 1;
	return clamp01(value);
}

function normalizeCssColor(input: string | null | undefined): string | null {
	if (!input) return null;

	const parsed = parseCssColor(input.trim());
	if (!parsed) return null;

	const [channel1, channel2, channel3] = parsed.values;
	const {alpha} = parsed;

	const clamp = (value: number, min: number, max: number): number =>
		Math.min(max, Math.max(min, value));

	if (parsed.type === 'rgb') {
		const red = clamp(Math.round(channel1), 0, 255);
		const green = clamp(Math.round(channel2), 0, 255);
		const blue = clamp(Math.round(channel3), 0, 255);

		if (!Number.isFinite(alpha) || alpha >= 1) {
			return `rgb(${red}, ${green}, ${blue})`;
		}

		const alphaValue = clamp(alpha, 0, 1);
		return `rgba(${red}, ${green}, ${blue}, ${alphaValue})`;
	}

	// HSL – values are already normalized by parse-css-color
	const hue = channel1;
	const saturation = clamp(channel2, 0, 100);
	const lightness = clamp(channel3, 0, 100);

	if (!Number.isFinite(alpha) || alpha >= 1) {
		return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
	}

	const alphaValue = clamp(alpha, 0, 1);
	return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alphaValue})`;
}

function resolveCanvasColor(
	raw: string | null | undefined,
	style: CSSStyleDeclaration,
	fallback: string,
): string {
	const resolveToken = (
		token: string | null | undefined,
		depth: number,
	): string | null => {
		if (depth > 4) return null;
		let value = (token ?? '').trim();

		if (!value) {
			value = style.color || fallback;
		}

		if (/^currentcolor$/i.test(value)) {
			value = style.color || fallback;
		}

		// Simple var(--token[, fallback]) resolution against the owning style.
		if (/^var\(/i.test(value)) {
			const bodyMatch = value.match(/^var\((.*)\)$/i);
			if (!bodyMatch) {
				return null;
			}

			const body = bodyMatch[1];
			const parts = body.split(',');
			const name = (parts[0] ?? '').trim();
			const varFallback =
				parts.length > 1 ? parts.slice(1).join(',').trim() : undefined;

			if (!name || !name.startsWith('--')) {
				return resolveToken(varFallback ?? fallback, depth + 1);
			}

			const fromStyle = style.getPropertyValue(name);
			if (fromStyle && fromStyle.trim()) {
				return resolveToken(fromStyle, depth + 1);
			}

			return resolveToken(varFallback ?? fallback, depth + 1);
		}

		return value;
	};

	const resolved = resolveToken(raw, 0);
	if (!resolved) {
		const normalizedFallback = normalizeCssColor(fallback);
		return normalizedFallback ?? fallback;
	}

	const normalized = normalizeCssColor(resolved);
	return normalized ?? resolved;
}

/** Image format for encoded screenshot output. */
export type ImageFormat = 'png' | 'jpeg' | 'webp';

/** Options for rendering a screenshot to canvas. */
export interface RenderOptions {
	/**
	 * Canvas background color. Set to `null` (or omit) for a transparent canvas.
	 * When provided, the string is passed directly to `fillStyle`.
	 */
	backgroundColor?: string | null;

	/**
	 * Optional existing canvas to render into.
	 * When omitted, a new canvas element is created.
	 */
	canvas?: HTMLCanvasElement;

	/**
	 * Rendering scale factor. Defaults to `window.devicePixelRatio` (or `1`).
	 */
	scale?: number;

	/**
	 * Crop origin X (CSS pixels) relative to the element's left edge.
	 * Defaults to the element's left edge.
	 */
	x?: number;

	/**
	 * Crop origin Y (CSS pixels) relative to the element's top edge.
	 * Defaults to the element's top edge.
	 */
	y?: number;

	/**
	 * Output width in CSS pixels. Defaults to the element's width.
	 */
	width?: number;

	/**
	 * Output height in CSS pixels. Defaults to the element's height.
	 */
	height?: number;

	/**
	 * Controls how `position: fixed` elements outside the captured subtree are
	 * handled.
	 *
	 * - `none` – ignore all fixed elements outside `element`.
	 * - `intersecting` – include fixed elements whose bounding rect intersects the capture rect.
	 * - `all` – include all fixed elements that overlap the viewport.
	 */
	includeFixed?: 'none' | 'intersecting' | 'all';
}

/** Options for encoding a canvas to an image format. */
export interface EncodeOptions {
	/**
	 * Image format to encode. Defaults to `'png'`.
	 */
	format?: ImageFormat;

	/**
	 * Image quality for lossy formats (`jpeg`, `webp`). A number between `0` and `1`.
	 * Ignored for `png`. Defaults to `0.92`.
	 */
	quality?: number;
}

/** Combined options for one-shot screenshot methods that render and encode. */
export type ScreenshotOptions = RenderOptions & EncodeOptions;

/**
 * A promise-like object representing a screenshot capture. The underlying
 * render happens once; subsequent calls to `.canvas()`, `.blob()`, or `.url()`
 * reuse the same rendered canvas.
 */
export interface ScreenshotTask extends Promise<HTMLCanvasElement> {
	/** Returns the rendered canvas. */
	canvas(): Promise<HTMLCanvasElement>;

	/** Encodes the rendered canvas to a Blob. */
	blob(options?: EncodeOptions): Promise<Blob>;

	/**
	 * Encodes the rendered canvas to a Blob and creates an object URL.
	 * Remember to call `URL.revokeObjectURL(url)` when done to avoid memory leaks.
	 */
	url(options?: EncodeOptions): Promise<string>;
}

interface RenderEnvironment {
	/** The root element to render into the canvas. */
	rootElement: HTMLElement;

	/**
	 * The CSS pixel capture rectangle relative to the viewport that maps to the
	 * canvas area (before device pixel scaling).
	 */
	captureRect: DOMRect;

	/**
	 * Control behavior for `position: fixed` elements outside the subtree.
	 */
	includeFixed: 'none' | 'intersecting' | 'all';

	/**
	 * Optional precomputed list of all HTMLElement nodes in the document. When
	 * provided, this is reused for operations that need to scan the full DOM
	 * (for example, locating `position: fixed` elements) to avoid multiple
	 * `querySelectorAll('*')` passes.
	 */
	allElements?: HTMLElement[];

	/**
	 * Device pixel scale factor used for high-DPI rendering. This matches the
	 * scale applied to the main canvas so that any temporary buffers (for text
	 * masking, filters, etc.) can render at the same resolution.
	 */
	scale?: number;

	/**
	 * Optional precomputed snapshot of CSS counters for each Element in the
	 * document. This allows `counter()` / `counters()` functions in pseudo-element
	 * content and markers to be resolved without mutating state during painting.
	 */
	elementCounters?: WeakMap<Element, Map<string, number>>;

	/**
	 * When true, 3D transforms on descendant elements should be flattened
	 * (rendered as 2D) because we're already inside a 3D perspective group.
	 */
	flatten3DTransforms?: boolean;

	/**
	 * Set of elements to skip during rendering (used for Z-layer separation).
	 */
	skipElements?: Set<Element>;

	/**
	 * The color space to use for the canvas. Defaults to using match media query to determine the color space.
	 */
	colorSpace: PredefinedColorSpace;
}

// Cache for element computed styles. Many helpers (layout, stacking, fixed
// elements) need access to the same `getComputedStyle` result; caching avoids
// repeated JS↔layout engine crossings for the same element during a render.
const styleCache = new WeakMap<Element, CSSStyleDeclaration>();

function getStyle(element: Element): CSSStyleDeclaration | null {
	const cached = styleCache.get(element);
	if (cached) {
		return cached;
	}

	const {ownerDocument} = element;
	const defaultView = ownerDocument?.defaultView;
	if (!ownerDocument || !defaultView) {
		return null;
	}

	let computed: CSSStyleDeclaration | null = null;
	try {
		computed = defaultView.getComputedStyle(element);
	} catch {
		computed = null;
	}

	if (!computed) {
		return null;
	}

	styleCache.set(element, computed);
	return computed;
}

function createCanvasLayer(
	ownerDocument: Document,
	width: number,
	height: number,
): HTMLCanvasElement {
	const canvas = ownerDocument.createElement('canvas');
	canvas.width = Math.max(1, Math.floor(width));
	canvas.height = Math.max(1, Math.floor(height));
	return canvas;
}

/**
 * Encodes a canvas to a Blob with the specified format and quality.
 */
function encodeCanvasToBlob(
	canvas: HTMLCanvasElement,
	options: EncodeOptions = {},
): Promise<Blob> {
	const format = options.format ?? 'png';
	const mimeType =
		format === 'jpeg'
			? 'image/jpeg'
			: format === 'webp'
				? 'image/webp'
				: 'image/png';

	return new Promise<Blob>((resolve, reject) => {
		canvas.toBlob(
			(result) => {
				if (result) {
					resolve(result);
				} else {
					reject(new Error('Failed to encode canvas to blob'));
				}
			},
			mimeType,
			format === 'png' ? undefined : (options.quality ?? 0.92),
		);
	});
}

/**
 * Core render function that renders an element to a canvas.
 * This is the internal implementation used by all public APIs.
 */
async function renderToCanvas(
	target: Element | string,
	options: RenderOptions = {},
): Promise<HTMLCanvasElement> {
	if (typeof window === 'undefined') {
		throw new Error('screenshot can only be used in a browser environment');
	}

	// Resolve target to an Element
	const element: Element | null =
		typeof target === 'string' ? document.querySelector(target) : target;

	if (!element || element.nodeType !== Node.ELEMENT_NODE) {
		throw new Error('Invalid element provided to screenshot');
	}

	const {ownerDocument} = element;
	const {defaultView} = ownerDocument;

	if (!ownerDocument || !defaultView) {
		throw new Error('Element must be attached to a document with a window');
	}

	// Decide how to handle `position: fixed` overlays. Only precompute the
	// full document element list when we actually need to consider fixed
	// elements; this avoids an expensive `querySelectorAll('*')` on callers
	// that explicitly opt out of fixed overlays.
	const includeFixed = options.includeFixed ?? 'none';

	// Precompute list of all elements for operations that need to scan the full
	// DOM (for example, locating `position: fixed` elements) to avoid multiple
	// `querySelectorAll('*')` passes. Skip this entirely when fixed elements are
	// ignored.
	const allElements =
		includeFixed === 'none'
			? undefined
			: Array.from(ownerDocument.querySelectorAll<HTMLElement>('*'));

	await prepareResources(element as HTMLElement);

	const deviceScale = options.scale ?? defaultView.devicePixelRatio ?? 1;

	// Auto-detect the best available color space.
	// If the device supports P3 (e.g., MacBooks, iPhones), we use it to match the DOM.
	// Otherwise, we default to sRGB to ensure standard colors aren't washed out.
	const isP3 = defaultView.matchMedia('(color-gamut: p3)').matches;
	const colorSpace = isP3 ? 'display-p3' : 'srgb';

	const rootRect = element.getBoundingClientRect();
	const rootStyle = defaultView.getComputedStyle(element as HTMLElement);
	const rootClipsOverflow = isClippingOverflow(rootStyle);
	const shouldExpandOverflow =
		options.x == null &&
		options.y == null &&
		options.width == null &&
		options.height == null;

	const expandedRootRect = (() => {
		if (!shouldExpandOverflow) return rootRect;
		if (rootClipsOverflow) return rootRect;

		try {
			const descendants = Array.from(element.querySelectorAll('*'));
			if (!descendants.length) return rootRect;

			let minLeft = rootRect.left;
			let minTop = rootRect.top;
			let maxRight = rootRect.right;
			let maxBottom = rootRect.bottom;

			for (let i = 0; i < descendants.length; i++) {
				const node = descendants[i];
				const rect = node.getBoundingClientRect();
				if (!rect || rect.width === 0 || rect.height === 0) continue;

				const style = defaultView.getComputedStyle(node);
				const expand = computeShadowExpansion(style);

				const left = rect.left + expand.left;
				const top = rect.top + expand.top;
				const right = rect.right + expand.right;
				const bottom = rect.bottom + expand.bottom;

				if (left < minLeft) minLeft = left;
				if (top < minTop) minTop = top;
				if (right > maxRight) maxRight = right;
				if (bottom > maxBottom) maxBottom = bottom;
			}

			const width = Math.max(0, maxRight - minLeft);
			const height = Math.max(0, maxBottom - minTop);
			if (
				!Number.isFinite(width) ||
				!Number.isFinite(height) ||
				width === 0 ||
				height === 0
			) {
				return rootRect;
			}

			return {
				left: minLeft,
				top: minTop,
				width,
				height,
				right: maxRight,
				bottom: maxBottom,
				x: minLeft,
				y: minTop,
				toJSON: () => ({}),
			} as DOMRect;
		} catch {
			return rootRect;
		}
	})();
	const scrollX =
		defaultView.pageXOffset ??
		ownerDocument.documentElement?.scrollLeft ??
		ownerDocument.body?.scrollLeft ??
		0;
	const scrollY =
		defaultView.pageYOffset ??
		ownerDocument.documentElement?.scrollTop ??
		ownerDocument.body?.scrollTop ??
		0;

	// Work in document (layout) coordinates so that behavior remains stable
	// across desktop and mobile browsers whose visual viewport may shift
	// relative to the layout viewport (for example, when the URL bar shows /
	// hides in mobile Safari). All downstream layout helpers (`getLayoutRect`,
	// `getVisualRect`) are expressed in the same coordinate space.
	const rawX = (options.x ?? 0) + expandedRootRect.left + scrollX;
	const rawY = (options.y ?? 0) + expandedRootRect.top + scrollY;
	// Snap capture origin to the device pixel grid to avoid subpixel blurring
	const snapToDevice = (value: number) => {
		return Math.round(value * deviceScale) / deviceScale;
	};

	const x = snapToDevice(rawX);
	const y = snapToDevice(rawY);
	const rawWidth = Math.max(
		1,
		Math.ceil(options.width ?? expandedRootRect.width - (options.x ?? 0)),
	);
	const rawHeight = Math.max(
		1,
		Math.ceil(options.height ?? expandedRootRect.height - (options.y ?? 0)),
	);
	// Snap dimensions to device pixels to keep text crisp
	const width = snapToDevice(rawWidth);
	const height = snapToDevice(rawHeight);
	const canvas = options.canvas ?? ownerDocument.createElement('canvas');

	// Physical pixel size
	canvas.width = Math.max(1, Math.floor(width * deviceScale));
	canvas.height = Math.max(1, Math.floor(height * deviceScale));
	canvas.style.width = `${width}px`;
	canvas.style.height = `${height}px`;

	const context = canvas.getContext('2d', {colorSpace});
	if (!context) {
		throw new Error('2D canvas context not available');
	}

	// Fill background only when a non-null color is provided. By default the
	// canvas background is transparent so that captured content can be
	// composed over arbitrary page backgrounds without a white box.
	if (options.backgroundColor != null) {
		const {backgroundColor} = options;
		context.save();
		context.setTransform(1, 0, 0, 1, 0, 0);
		context.fillStyle = backgroundColor;
		context.fillRect(0, 0, canvas.width, canvas.height);
		context.restore();
	}

	// Normalized DOM→canvas coordinate system:
	// - one canvas unit == one CSS pixel
	// - origin at the crop rectangle's top-left corner
	// Apply the hi-DPI transform once so that subsequent drawing uses CSS units.
	context.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);
	context.imageSmoothingEnabled = true;
	context.save();
	context.translate(-x, -y);

	const captureRect: DOMRect = {
		left: x,
		top: y,
		width,
		height,
		right: x + width,
		bottom: y + height,
		x,
		y,
		toJSON: () => ({}),
	} as DOMRect;

	const env: RenderEnvironment = {
		rootElement: element as HTMLElement,
		scale: deviceScale,
		captureRect,
		includeFixed,
		allElements,
		colorSpace,
	};

	await renderDomTree(element as HTMLElement, context, env);

	if (env.includeFixed !== 'none') {
		await renderFixedPositionElements(context, env);
	}

	context.restore();

	return canvas;
}

function isClippingOverflow(style: CSSStyleDeclaration): boolean {
	const ox = style.overflowX || style.overflow;
	const oy = style.overflowY || style.overflow;
	const clips = (value: string | null) =>
		value !== null &&
		value !== '' &&
		value !== 'visible' &&
		value !== 'unset' &&
		value !== 'initial';
	return clips(ox) || clips(oy);
}

function computeShadowExpansion(style: CSSStyleDeclaration): {
	left: number;
	top: number;
	right: number;
	bottom: number;
} {
	let expandLeft = 0;
	let expandTop = 0;
	let expandRight = 0;
	let expandBottom = 0;

	const parseShadow = (shadow: string) => {
		const tokens = shadow.match(/-?\d*\.?\d+px/g);
		if (!tokens || tokens.length < 2) return null;
		const [ox, oy, blur = '0px', spread = '0px'] = tokens;
		return {
			offsetX: parseFloat(ox),
			offsetY: parseFloat(oy),
			blur: Math.max(0, parseFloat(blur)),
			spread: parseFloat(spread),
		};
	};

	const apply = (
		offsetX: number,
		offsetY: number,
		blur: number,
		spread: number,
	) => {
		const ext = Math.max(0, blur) + spread;
		const left = offsetX - ext;
		const right = offsetX + ext;
		const top = offsetY - ext;
		const bottom = offsetY + ext;
		if (left < expandLeft) expandLeft = left;
		if (top < expandTop) expandTop = top;
		if (right > expandRight) expandRight = right;
		if (bottom > expandBottom) expandBottom = bottom;
	};

	const shadows = style.boxShadow?.split(',') ?? [];
	for (const raw of shadows) {
		const shadow = parseShadow(raw);
		if (!shadow) continue;
		apply(shadow.offsetX, shadow.offsetY, shadow.blur, shadow.spread);
	}

	const textShadows = style.textShadow?.split(',') ?? [];
	for (const raw of textShadows) {
		const shadow = parseShadow(raw);
		if (!shadow) continue;
		apply(shadow.offsetX, shadow.offsetY, shadow.blur, 0);
	}

	return {
		left: Math.min(0, expandLeft),
		top: Math.min(0, expandTop),
		right: Math.max(0, expandRight),
		bottom: Math.max(0, expandBottom),
	};
}

/**
 * Creates a ScreenshotTask from a canvas promise, adding .canvas(), .blob(),
 * and .url() methods that all chain off the same underlying render.
 */
function createScreenshotTask(
	canvasPromise: Promise<HTMLCanvasElement>,
): ScreenshotTask {
	const task = canvasPromise as ScreenshotTask;

	task.canvas = () => canvasPromise;

	task.blob = async (options?: EncodeOptions) => {
		const canvas = await canvasPromise;
		return encodeCanvasToBlob(canvas, options);
	};

	task.url = async (options?: EncodeOptions) => {
		const blob = await task.blob(options);
		return URL.createObjectURL(blob);
	};

	return task;
}

/**
 * Renders a DOM element into a canvas using modern browser features.
 *
 * Returns a `ScreenshotTask` that is both a Promise and provides methods
 * to encode the rendered canvas. The underlying render happens once;
 * subsequent calls to `.canvas()`, `.blob()`, or `.url()` reuse the same result.
 *
 * This implementation targets evergreen browsers only and assumes a real DOM +
 * Canvas2D environment (not Node.js).
 *
 * @example
 * // Capture handle pattern - render once, encode multiple ways
 * const shot = screenshot(element, { scale: 2 })
 * const canvas = await shot.canvas()
 * const pngBlob = await shot.blob({ format: 'png' })
 * const webpUrl = await shot.url({ format: 'webp', quality: 0.9 })
 *
 * @example
 * // Direct await returns the canvas
 * const canvas = await screenshot(element)
 *
 * @example
 * // One-shot convenience methods
 * const canvas = await screenshot.canvas(element, { scale: 2 })
 * const blob = await screenshot.blob(element, { format: 'jpeg', quality: 0.85 })
 * const url = await screenshot.url(element, { format: 'png' })
 */
function screenshot(
	target: Element | string,
	options?: RenderOptions,
): ScreenshotTask {
	const canvasPromise = renderToCanvas(target, options);
	return createScreenshotTask(canvasPromise);
}

/**
 * One-shot method to render an element directly to a canvas.
 * @param target - Element or CSS selector to capture.
 * @param options - Render options.
 */
screenshot.canvas = function (
	target: Element | string,
	options?: RenderOptions,
): Promise<HTMLCanvasElement> {
	return renderToCanvas(target, options);
};

/**
 * One-shot method to render an element and encode it to a Blob.
 * @param target - Element or CSS selector to capture.
 * @param options - Render and encode options.
 */
screenshot.blob = async function (
	target: Element | string,
	options?: ScreenshotOptions,
): Promise<Blob> {
	const canvas = await renderToCanvas(target, options);
	return encodeCanvasToBlob(canvas, options);
};

/**
 * One-shot method to render an element and create an object URL.
 * Remember to call `URL.revokeObjectURL(url)` when done to avoid memory leaks.
 * @param target - Element or CSS selector to capture.
 * @param options - Render and encode options.
 */
screenshot.url = async function (
	target: Element | string,
	options?: ScreenshotOptions,
): Promise<string> {
	const blob = await screenshot.blob(target, options);
	return URL.createObjectURL(blob);
};

export {screenshot};

async function renderDomTree(
	root: HTMLElement,
	context: CanvasRenderingContext2D,
	env: RenderEnvironment,
): Promise<void> {
	await renderNode(root, context, env);
}

const filterGroupingElements = new WeakSet<Element>();
const maskGroupingElements = new WeakSet<Element>();
const opacityGroupingElements = new WeakSet<Element>();
const perspectiveGroupingElements = new Set<Element>();

async function renderNode(
	node: Node,
	context: CanvasRenderingContext2D,
	env: RenderEnvironment,
): Promise<void> {
	if (node.nodeType === Node.ELEMENT_NODE && node instanceof Element) {
		const element = node;

		// Skip elements that are being rendered separately (Z-layer elements)
		if (env.skipElements?.has(element)) {
			return;
		}

		const view = element.ownerDocument.defaultView;
		const style = getStyle(element);
		if (!style) return;

		// Special-case display: contents – CSS creates no box for the element
		// itself, but its children still participate in layout. Treat the element
		// as transparent and recurse directly into its subtree.
		if (style.display === 'contents') {
			const children = Array.from(element.childNodes);
			const childrenLength = children.length;
			for (let index = 0; index < childrenLength; index++) {
				await renderNode(children[index], context, env);
			}

			return;
		}

		if (style.visibility === 'hidden' || style.display === 'none') {
			return;
		}

		const rect = env.flatten3DTransforms
			? getUntransformedLayoutRect(element)
			: getLayoutRect(element, style);

		if (rect.width === 0 || rect.height === 0) {
			return;
		}

		const radii = getBorderRadii(style, rect);
		const hasRadius =
			radii.topLeft !== 0 ||
			radii.topRight !== 0 ||
			radii.bottomRight !== 0 ||
			radii.bottomLeft !== 0;

		const overflowX = style.overflowX || style.overflow;
		const overflowY = style.overflowY || style.overflow;
		const hidesOverflow = (value: string | null): boolean =>
			value !== null && value !== '' && value !== 'visible';

		const hasOverflowClip =
			hidesOverflow(overflowX) || hidesOverflow(overflowY);

		const rawOpacity = parseFloat(style.opacity || '1');
		// If we are currently rendering inside an opacity group (offscreen),
		// we treat the element as fully opaque (1.0) to avoid double-application.
		const isOpacityGroupingGuarded = opacityGroupingElements.has(element);
		const hasOpacity =
			!isOpacityGroupingGuarded &&
			Number.isFinite(rawOpacity) &&
			rawOpacity < 1 &&
			rawOpacity >= 0;

		// Use rawOpacity for the composite step, but 1.0 for internal drawing logic
		const opacityValue = hasOpacity ? rawOpacity : 1;

		const transformValue = style.transform || 'none';
		const hasTransform =
			Boolean(transformValue) &&
			transformValue !== 'none' &&
			!isUnsupported3DTransform(transformValue);

		// Handle 3D perspective transforms by rendering to offscreen canvas first,
		// then drawing with perspective-correct mesh subdivision.
		// Inside renderNode...

		// Handle 3D perspective transforms by rendering to offscreen canvas first,
		// then drawing with WebGL for perspective correctness.
		const has3DTransform =
			Boolean(transformValue) &&
			transformValue !== 'none' &&
			isUnsupported3DTransform(transformValue) &&
			!perspectiveGroupingElements.has(element) &&
			!env.flatten3DTransforms;

		if (has3DTransform) {
			const {ownerDocument} = element;
			const targetCanvas = context.canvas;

			if (ownerDocument && targetCanvas) {
				// For 3D transforms, we need the untransformed layout rect
				// because getBoundingClientRect returns the projected post-transform box
				const rect3D = getUntransformedLayoutRect(element);
				const visualRect = getVisualRect(element);

				// Get the actual corner positions from the browser using getClientRects or manual calculation
				// The browser's visualRect gives us the axis-aligned bounding box, not the actual corners
				// We need to compute corners from the transform
				const browserCorners = computeBrowserCorners(element, env.captureRect);

				// 1. Calculate the full 3D Matrix (including parent perspective)
				const originValue = style.transformOrigin || '50% 50%';
				let [originX, originY] = parseTransformOrigin(originValue, rect3D);
				let diffX = 0;
				let diffY = 0;

				// Get browser's computed transform matrix for comparison
				const browserMatrix = new DOMMatrix(style.transform);

				// Get perspective info separately
				const perspectiveInfo = getParentPerspective(element);

				// Find all child elements with translateZ transforms
				const zLayers = findZLayers(element);

				// Use browser matrix directly
				if (browserMatrix) {
					// 1. Project the theoretical rect3D onto the screen
					const projectedCorners = [
						{x: rect3D.left, y: rect3D.top},
						{x: rect3D.right, y: rect3D.top},
						{x: rect3D.right, y: rect3D.bottom},
						{x: rect3D.left, y: rect3D.bottom},
					];

					let minX = Infinity;
					let maxX = -Infinity;
					let minY = Infinity;
					let maxY = -Infinity;

					// Reuse the perspective logic to calculate the projected bounding box
					projectedCorners.forEach((corner) => {
						const xRel = corner.x - originX;
						const yRel = corner.y - originY;

						// Transform (Rotate only, as this is the base element)
						const p = browserMatrix.transformPoint(new DOMPoint(xRel, yRel, 0));

						let finalX = p.x + originX;
						let finalY = p.y + originY;

						// Apply Perspective
						if (perspectiveInfo) {
							const pOriginDeltaX = originX - perspectiveInfo.originX;
							const pOriginDeltaY = originY - perspectiveInfo.originY;

							const xPersp = p.x + pOriginDeltaX;
							const yPersp = p.y + pOriginDeltaY;
							const zPersp = p.z;

							const d = perspectiveInfo.distance;
							const scale = d / Math.max(d - zPersp, 0.001);

							finalX = xPersp * scale + perspectiveInfo.originX;
							finalY = yPersp * scale + perspectiveInfo.originY;
						}

						if (finalX < minX) minX = finalX;
						if (finalX > maxX) maxX = finalX;
						if (finalY < minY) minY = finalY;
						if (finalY > maxY) maxY = finalY;
					});

					// 2. Compare projected center vs actual browser visual center
					// visualRect is already in document coordinates (via getVisualRect
					// which uses toDocumentRect), so we don't add scroll again.
					const projectedCenterX = (minX + maxX) / 2;
					const projectedCenterY = (minY + maxY) / 2;

					const actualCenterX = visualRect.left + visualRect.width / 2;
					const actualCenterY = visualRect.top + visualRect.height / 2;

					diffX = actualCenterX - projectedCenterX;
					diffY = actualCenterY - projectedCenterY;

					// Create a mutable clone to store the corrected coordinates
					// We cast as DOMRect to satisfy the type checker downstream
					let calibratedRect = rect3D;

					// 3. Apply the correction if significant
					if (Math.abs(diffX) > 0.1 || Math.abs(diffY) > 0.1) {
						calibratedRect = {
							left: rect3D.left + diffX,
							top: rect3D.top + diffY,
							width: rect3D.width,
							height: rect3D.height,
							right: rect3D.right + diffX,
							bottom: rect3D.bottom + diffY,
							x: rect3D.x + diffX,
							y: rect3D.y + diffY,
							toJSON: () => ({}),
						} as DOMRect;

						originX += diffX;
						originY += diffY;
					}

					const {ownerDocument} = element;
					const baseScale = env.scale ?? 1;
					const basePadding = 50; // same as before

					// 1. Render the base card at z = 0
					const offscreenWidth = Math.max(
						1,
						Math.ceil((rect3D.width + basePadding * 2) * baseScale),
					);
					const offscreenHeight = Math.max(
						1,
						Math.ceil((rect3D.height + basePadding * 2) * baseScale),
					);

					const offscreen = createCanvasLayer(
						ownerDocument,
						offscreenWidth,
						offscreenHeight,
					);
					const offscreenContext = offscreen.getContext('2d', {
						colorSpace: env.colorSpace,
					});

					if (offscreenContext) {
						offscreenContext.imageSmoothingEnabled = true;
						offscreenContext.imageSmoothingQuality = 'high';

						// Position card so its rect3D maps into the padded offscreen
						offscreenContext.setTransform(
							baseScale,
							0,
							0,
							baseScale,
							(-rect3D.left + basePadding) * baseScale,
							(-rect3D.top + basePadding) * baseScale,
						);

						perspectiveGroupingElements.add(element);

						// Collect all Z-layer elements to skip them during the base card render
						// so they don't appear flattened at Z=0.
						const zElementsToSkip = new Set<Element>();
						zLayers.forEach((layers) => {
							layers.forEach((layer) => zElementsToSkip.add(layer.element));
						});

						try {
							// Render the whole card FLAT into the texture, skipping the 3D-positioned children
							await renderNode(element, offscreenContext, {
								...env,
								flatten3DTransforms: true,
								scale: baseScale,
								skipElements: zElementsToSkip,
							});
						} finally {
							perspectiveGroupingElements.delete(element);
						}

						// Warp the base card at z = 0
						renderTextureWithPerspective(
							context,
							offscreen,
							calibratedRect,
							env,
							visualRect,
							basePadding,
							browserCorners,
						);
					}

					// 2. Render the children with translateZ (z-layers)

					// Back-to-front: smaller z first, larger z last.
					const zLayerEntries = Array.from(zLayers.entries()).sort(
						([zA], [zB]) => zA - zB,
					);

					const zLayerTasks: Promise<void>[] = [];

					for (const [z, nodesAtZ] of zLayerEntries) {
						for (const node of nodesAtZ) {
							if (!(node.element instanceof HTMLElement)) continue;
							const zElement = node.element;

							zLayerTasks.push(
								// - Inside renderNode function, replace the Z-layer loop (approx lines 1150-1300)

								// ... inside the zLayers loop ...
								(async () => {
									// 1. Prepare for Measurement (Disable Transforms)
									const parentElement = element as HTMLElement;

									const childStyle = {
										transform: zElement.style.transform,
										transition: zElement.style.transition,
									};
									const parentStyle = {
										transform: parentElement.style.transform,
										transition: parentElement.style.transition,
									};

									// Temporarily disable 3D on both to establish the "Flat" baseline
									zElement.style.transition = 'none';
									zElement.style.transform = 'none';
									parentElement.style.transition = 'none';
									parentElement.style.transform = 'none';

									// A. Capture Precise Visual Position (The Single Source of Truth)
									// We use this for BOTH Texture Origin and 3D Placement.
									// This guarantees that what we draw matches where we place it.
									const childPreciseDoc = toDocumentRect(
										zElement,
										zElement.getBoundingClientRect(),
									);
									const parentPreciseDoc = toDocumentRect(
										parentElement,
										parentElement.getBoundingClientRect(),
									);

									// Calculate offset relative to parent (for 3D placement later)
									const relX = childPreciseDoc.left - parentPreciseDoc.left;
									const relY = childPreciseDoc.top - parentPreciseDoc.top;

									// Precompute the world matrix for this Z layer so we can:
									// - Estimate how much extra padding is needed once the layer is
									//   transformed in 3D space (to avoid clipping)
									// - Reuse it later when projecting corners for placement.
									const worldMatrix = browserMatrix.multiply(
										new DOMMatrix().translate(0, 0, z),
									);

									// 2. Texture Setup
									const textureScale = (baseScale ?? 1) * 2.0;

									// Dynamically compute how much padding this Z-layer needs based on
									// its 3D transform. This replaces the previous hardcoded padding
									// so extremely rotated layers still have enough room.
									let zLayerPadding = 60; // sensible fallback
									try {
										const dynamicPadding = calculateDynamicPadding(
											worldMatrix,
											childPreciseDoc.width,
											childPreciseDoc.height,
										);

										if (Number.isFinite(dynamicPadding) && dynamicPadding > 0) {
											// Keep at least the base card padding and clamp to avoid
											// accidentally creating enormous textures.
											zLayerPadding = Math.max(
												basePadding,
												Math.min(dynamicPadding, basePadding * 4),
											);
										}
									} catch {
										// If anything goes wrong, we fall back to the default value.
									}

									// Use Precise Visual size
									const logicalWidth =
										childPreciseDoc.width + zLayerPadding * 2;
									const logicalHeight =
										childPreciseDoc.height + zLayerPadding * 2;

									const layerWidth = Math.max(
										1,
										Math.ceil(logicalWidth * textureScale),
									);
									const layerHeight = Math.max(
										1,
										Math.ceil(logicalHeight * textureScale),
									);
									const correctedWidth = layerWidth / textureScale;
									const correctedHeight = layerHeight / textureScale;

									const layerCanvas = createCanvasLayer(
										zElement.ownerDocument,
										layerWidth,
										layerHeight,
									);
									const layerCtx = layerCanvas.getContext('2d', {
										colorSpace: env.colorSpace,
									});

									if (layerCtx) {
										layerCtx.imageSmoothingEnabled = true;
										layerCtx.imageSmoothingQuality = 'high';

										// TEXTURE ORIGIN: Match Precise Document Position
										// renderNode -> renderTextNode uses getClientRects() (Document Coords).
										// By setting origin to -childPreciseDoc.left, we align the canvas
										// exactly to where renderTextNode will draw.
										layerCtx.setTransform(
											textureScale,
											0,
											0,
											textureScale,
											(-childPreciseDoc.left + zLayerPadding) * textureScale,
											(-childPreciseDoc.top + zLayerPadding) * textureScale,
										);

										perspectiveGroupingElements.add(zElement);
										try {
											// Draw WHILE transforms are disabled.
											// This ensures renderTextNode sees the same coordinates we just measured.
											await renderNode(zElement, layerCtx, {
												...env,
												flatten3DTransforms: true,
												scale: textureScale,
											});
										} finally {
											perspectiveGroupingElements.delete(zElement);

											// Restore transforms AFTER drawing is complete
											zElement.style.transform = childStyle.transform;
											zElement.style.transition = childStyle.transition;
											parentElement.style.transform = parentStyle.transform;
											parentElement.style.transition = parentStyle.transition;
										}
									}

									// 3. Calculate 3D Placement (Relative Anchoring)
									// We use the Parent's Calibrated Origin + The Precise Relative Offset we measured.
									const parentCalibratedLeft = rect3D.left + diffX;
									const parentCalibratedTop = rect3D.top + diffY;

									const paddedRect = {
										left: parentCalibratedLeft + relX - zLayerPadding,
										top: parentCalibratedTop + relY - zLayerPadding,
										width: correctedWidth,
										height: correctedHeight,
										// DOMRect compat
										right:
											parentCalibratedLeft +
											relX -
											zLayerPadding +
											correctedWidth,
										bottom:
											parentCalibratedTop +
											relY -
											zLayerPadding +
											correctedHeight,
										x: parentCalibratedLeft + relX - zLayerPadding,
										y: parentCalibratedTop + relY - zLayerPadding,
										toJSON: () => ({}),
									} as DOMRect;

									// 4. Project Corners (Parent Pivot)
									const projectRect = (r: DOMRect) => {
										const corners = [
											{x: r.left, y: r.top},
											{x: r.right, y: r.top},
											{x: r.right, y: r.bottom},
											{x: r.left, y: r.bottom},
										];
										return corners.map((c) => {
											// Coords are already Absolute Document (from parentCalibratedLeft)
											const docX = c.x;
											const docY = c.y;

											// Pivot around Parent's Origin (matches CSS)
											const xRel = docX - originX;
											const yRel = docY - originY;

											const p = worldMatrix.transformPoint(
												new DOMPoint(xRel, yRel, 0),
											);

											if (perspectiveInfo) {
												const pOriginDeltaX = originX - perspectiveInfo.originX;
												const pOriginDeltaY = originY - perspectiveInfo.originY;
												const xPersp = p.x + pOriginDeltaX;
												const yPersp = p.y + pOriginDeltaY;
												const zPersp = p.z;
												const d = perspectiveInfo.distance;
												const scale = d / Math.max(d - zPersp, 0.001);

												// Output relative to Capture Rect
												return {
													x:
														xPersp * scale +
														perspectiveInfo.originX -
														env.captureRect.left,
													y:
														yPersp * scale +
														perspectiveInfo.originY -
														env.captureRect.top,
													w: 1 / scale,
												};
											}

											return {
												x: p.x + originX - env.captureRect.left,
												y: p.y + originY - env.captureRect.top,
												w: 1,
											};
										});
									};

									const finalCorners = projectRect(paddedRect);

									// 5. Render
									if (layerCanvas) {
										// getBoundingClientRect is viewport-relative; convert to document coords
										const visualRect = toDocumentRect(
											zElement,
											zElement.getBoundingClientRect(),
										);
										renderTextureWithPerspective(
											context,
											layerCanvas,
											paddedRect,
											env,
											visualRect,
											0,
											finalCorners,
										);
									}
								})(),
							);
						}
					}

					// Ensure all z-layers are drawn before leaving the 3D path
					await Promise.all(zLayerTasks);

					return;
				}
			}
		}

		const filterValue = style.filter || 'none';
		const hasCanvasFilterSupport =
			'filter' in context && typeof context.filter === 'string';
		const hasDeclaredFilter =
			Boolean(filterValue) && filterValue !== 'none' && hasCanvasFilterSupport;

		const isFilterGroupingGuarded = filterGroupingElements.has(element);
		const hasFilter = hasDeclaredFilter && !isFilterGroupingGuarded;

		// CSS masking support: treat `mask-*` longhands (and their -webkit-
		// variants) as layer-based alpha masks applied to the composited element +
		// descendants. We approximate the spec by grouping the element into an
		// offscreen buffer when any mask image is present and then modulating that
		// buffer's alpha using the mask bitmap before compositing it back into the
		// main context (optionally with filters).
		const isMaskGroupingGuarded = maskGroupingElements.has(element);
		const hasMaskLayer =
			!isMaskGroupingGuarded && elementHasMask(style as CSSStyleDeclaration);

		// When an element declares a CSS filter and/or mask, approximate CSS'
		// layer-based rendering model by rendering the element and its descendants
		// into an offscreen canvas first, applying the filter/mask to that
		// composited layer, and then drawing it back into the main context once.
		// This avoids applying effects independently to each draw call (background,
		// borders, text, etc.), which produces noticeably different semantics
		// compared to CSS.
		if (hasFilter || hasMaskLayer || hasOpacity) {
			const {ownerDocument} = element;
			const targetCanvas = context.canvas;

			if (ownerDocument && targetCanvas) {
				const scale = env.scale ?? 1;

				// For elements with transforms, use the visual rect (from BCR) to size
				// the offscreen buffer. This ensures scaled content isn't clipped.
				// For untransformed elements, use the layout rect.
				let offscreenRect = rect;
				if (hasTransform && element instanceof HTMLElement) {
					const visualRect = element.getBoundingClientRect();
					const scrollX = view?.scrollX ?? 0;
					const scrollY = view?.scrollY ?? 0;
					// Only use visual rect if it's larger (element is scaled up)
					if (
						visualRect.width > rect.width ||
						visualRect.height > rect.height
					) {
						offscreenRect = {
							left: visualRect.left + scrollX,
							top: visualRect.top + scrollY,
							width: visualRect.width,
							height: visualRect.height,
							right: visualRect.right + scrollX,
							bottom: visualRect.bottom + scrollY,
							x: visualRect.left + scrollX,
							y: visualRect.top + scrollY,
							toJSON: () => ({}),
						} as DOMRect;
					}
				}

				const offscreenWidth = Math.max(
					1,
					Math.ceil(offscreenRect.width * scale),
				);
				const offscreenHeight = Math.max(
					1,
					Math.ceil(offscreenRect.height * scale),
				);

				const offscreen = createCanvasLayer(
					ownerDocument,
					offscreenWidth,
					offscreenHeight,
				);

				const offscreenContext = offscreen.getContext('2d', {
					colorSpace: env.colorSpace,
				});

				if (offscreenContext) {
					offscreenContext.imageSmoothingEnabled =
						context.imageSmoothingEnabled;

					// Map DOM-space coordinates into the local offscreen buffer so the
					// element's rect is anchored at (0, 0) in pixel space.
					// Use offscreenRect to properly position scaled content.
					offscreenContext.setTransform(
						scale,
						0,
						0,
						scale,
						-offscreenRect.left * scale,
						-offscreenRect.top * scale,
					);

					// Guard this element so that the recursive render does not attempt to
					// create another filter/mask layer for the same node. Descendants
					// that also declare filters or masks continue to be grouped
					// independently.
					filterGroupingElements.add(element);
					if (hasMaskLayer) {
						maskGroupingElements.add(element);
					}

					if (hasOpacity) {
						opacityGroupingElements.add(element);
					}

					try {
						await renderNode(element, offscreenContext, env);
					} finally {
						filterGroupingElements.delete(element);
						if (hasMaskLayer) {
							maskGroupingElements.delete(element);
						}

						if (hasOpacity) {
							opacityGroupingElements.delete(element);
						}
					}

					// Apply CSS mask bitmap(s) into the grouped offscreen buffer before
					// compositing it back into the main context.
					if (hasMaskLayer) {
						await applyMaskToCanvas(
							offscreenContext,
							style,
							rect,
							radii,
							hasRadius,
							env,
						);
					}

					context.save();

					// Apply element opacity at the layer level so the filtered result is
					// blended once, matching CSS' stacking behavior more closely.
					if (hasOpacity) {
						context.globalAlpha *= opacityValue;
					}

					// For elements that also declare `mix-blend-mode`, approximate CSS
					// blending by applying the corresponding canvas composite operation
					// while compositing the filtered layer back into the main context.
					const hasOuterMixBlendMode =
						Boolean((style.mixBlendMode || '').trim()) &&
						style.mixBlendMode !== 'normal' &&
						style.mixBlendMode !== 'inherit';
					if (hasOuterMixBlendMode) {
						const compositeOperation = getCompositeOperationForMixBlendMode(
							style.mixBlendMode || 'normal',
						);
						if (compositeOperation) {
							context.globalCompositeOperation =
								compositeOperation as GlobalCompositeOperation;
						}
					}

					const previousTransform = context.getTransform();
					const previousFilter = hasFilter ? context.filter : undefined;

					if (hasFilter) {
						context.filter = scaleFilter(filterValue, env.scale ?? 1);
					}

					// Draw the composited layer back into the main canvas at the element's
					// visual position in pixel space so we don't re-apply the DOM→canvas
					// transform a second time. The offscreen buffer already contains fully
					// transformed pixels. Use offscreenRect to properly position scaled content.
					try {
						const scale = env.scale ?? 1;
						const {captureRect} = env;
						const destX = Math.round(
							(offscreenRect.left - captureRect.left) * scale,
						);
						const destY = Math.round(
							(offscreenRect.top - captureRect.top) * scale,
						);

						context.setTransform(1, 0, 0, 1, 0, 0);
						context.drawImage(offscreen, destX, destY);
						context.setTransform(previousTransform);
					} finally {
						if (hasFilter) {
							context.filter = previousFilter ?? 'none';
						}
					}

					context.restore();
					return;
				}
			}
		}

		const mixBlendModeValue = style.mixBlendMode;
		const mixBlendMode =
			typeof mixBlendModeValue === 'string'
				? mixBlendModeValue.trim().toLowerCase()
				: 'normal';
		// When this element is being rendered into an offscreen buffer for CSS
		// filter grouping, defer `mix-blend-mode` application to the outer paint
		// pass so that blending happens against the real backdrop instead of an
		// initially empty offscreen canvas.
		const hasMixBlendMode =
			!isFilterGroupingGuarded &&
			Boolean(mixBlendMode) &&
			mixBlendMode !== 'normal' &&
			mixBlendMode !== 'inherit';

		const isolationValue = style.isolation;
		const hasIsolation =
			typeof isolationValue === 'string' &&
			isolationValue.trim().toLowerCase() === 'isolate';

		const backdropFilterValue = style.backdropFilter || 'none';
		const hasBackdropFilter =
			Boolean(backdropFilterValue) && backdropFilterValue !== 'none';

		let backdropFilterCanvas: HTMLCanvasElement | null = null;
		let backdropFilterRect: DOMRect | null = null;

		if (hasBackdropFilter && typeof console !== 'undefined' && console.warn) {
			console.warn(
				`[screenshot] backdrop-filter is approximated and may not match browser rendering exactly. Filter: "${backdropFilterValue}"`,
			);
		}

		const hasClipPath =
			Boolean(style.clipPath) &&
			style.clipPath !== 'none' &&
			style.clipPath.trim() !== '';

		// Border-radius + clip-path clipping for the element itself; overflow
		// clipping for descendants is handled separately so borders remain visible.
		const shouldClip = hasRadius || hasClipPath;

		const needsSave =
			shouldClip ||
			hasOpacity ||
			hasTransform ||
			hasFilter ||
			hasMixBlendMode ||
			hasIsolation ||
			hasBackdropFilter;
		let overflowClipApplied = false;

		// Outer box shadows are rendered behind the element's own background and
		// border. They should not be clipped by border-radius/clip-path, but they
		// do need to respect transforms, opacity, filters, and mix-blend-mode.
		const paintOuterBoxShadow = () => {
			drawOuterBoxShadows(context, style, rect, radii, env.scale ?? 1, env);
		};

		// Handle backdrop-filter: capture content behind element and apply filter.
		// We avoid mutating the DOM node itself and keep all state local to this
		// render pass.
		if (hasBackdropFilter) {
			try {
				const scale = env.scale ?? 1;
				const {captureRect} = env;

				// Parse blur radius from filter to expand sample area for feathered edges
				const blurMatch = backdropFilterValue.match(
					/blur\(\s*(\d*\.?\d+)px\s*\)/i,
				);
				const blurRadiusCss = blurMatch ? parseFloat(blurMatch[1]) : 0;
				// Expand by 2x blur radius to ensure smooth feathering (blur extends ~2 std devs)
				const bleedPx = Math.ceil(blurRadiusCss * 2 * scale);

				// Convert DOM-space rect into canvas pixel coordinates relative to the
				// root capture rect, taking the device pixel ratio into account. This
				// keeps backdrop sampling aligned with the actual rendered pixels when
				// using hi-DPI scaling or non-zero crop origins.
				const baseLeftPx = Math.round((rect.left - captureRect.left) * scale);
				const baseTopPx = Math.round((rect.top - captureRect.top) * scale);
				const baseWidthPx = Math.max(1, Math.round(rect.width * scale));
				const baseHeightPx = Math.max(1, Math.round(rect.height * scale));

				// Expand sample area by blur bleed, clamped to canvas bounds
				const canvasWidth = context.canvas.width;
				const canvasHeight = context.canvas.height;
				const sampleLeftPx = Math.max(0, baseLeftPx - bleedPx);
				const sampleTopPx = Math.max(0, baseTopPx - bleedPx);
				const sampleRightPx = Math.min(
					canvasWidth,
					baseLeftPx + baseWidthPx + bleedPx,
				);
				const sampleBottomPx = Math.min(
					canvasHeight,
					baseTopPx + baseHeightPx + bleedPx,
				);
				const sampleWidthPx = sampleRightPx - sampleLeftPx;
				const sampleHeightPx = sampleBottomPx - sampleTopPx;

				// Calculate offset within the expanded sample where the original rect starts
				const offsetXPx = baseLeftPx - sampleLeftPx;
				const offsetYPx = baseTopPx - sampleTopPx;

				const samplePixels = sampleWidthPx * sampleHeightPx;
				const sampleTooLarge = samplePixels > 4_000_000; // ~4MP cap to avoid Safari main-thread hangs

				if (!sampleTooLarge && sampleWidthPx > 0 && sampleHeightPx > 0) {
					const previousTransform = context.getTransform();
					// `getImageData` operates in the canvas' pixel grid and ignores the
					// current transform, but resetting to identity here makes the mapping
					// between DOM coordinates and pixel coordinates explicit and future‑proof.
					context.setTransform(1, 0, 0, 1, 0, 0);

					const backdropImageData = context.getImageData(
						sampleLeftPx,
						sampleTopPx,
						sampleWidthPx,
						sampleHeightPx,
					);

					context.setTransform(previousTransform);

					if (backdropImageData) {
						const tempCanvas = document.createElement('canvas');
						tempCanvas.width = sampleWidthPx;
						tempCanvas.height = sampleHeightPx;
						const tempContext = tempCanvas.getContext('2d', {
							colorSpace: env.colorSpace,
						});

						if (tempContext) {
							// 1. Put the raw captured pixels into the first temp canvas
							tempContext.putImageData(backdropImageData, 0, 0);

							// OPTIMIZATION: Blur at reduced resolution for performance (esp. Safari).
							// Blur hides high-frequency detail, so downscaling before blur is visually equivalent.
							// More aggressive downscaling for larger blurs.
							const blurDownscale =
								blurRadiusCss >= 12 ? 0.125 : blurRadiusCss >= 6 ? 0.25 : 0.5;
							const smallWidth = Math.max(
								4,
								Math.round(sampleWidthPx * blurDownscale),
							);
							const smallHeight = Math.max(
								4,
								Math.round(sampleHeightPx * blurDownscale),
							);

							// 2. Create a SMALL canvas for downscaled source
							const smallCanvas = document.createElement('canvas');
							smallCanvas.width = smallWidth;
							smallCanvas.height = smallHeight;
							const smallCtx = smallCanvas.getContext('2d', {
								colorSpace: env.colorSpace,
							});

							// 3. Create another small canvas to receive blur (avoid self-draw issues)
							const blurredSmallCanvas = document.createElement('canvas');
							blurredSmallCanvas.width = smallWidth;
							blurredSmallCanvas.height = smallHeight;
							const blurredSmallCtx = blurredSmallCanvas.getContext('2d', {
								colorSpace: env.colorSpace,
							});

							// 4. Create final canvas at original resolution
							const filteredCanvas = document.createElement('canvas');
							filteredCanvas.width = sampleWidthPx;
							filteredCanvas.height = sampleHeightPx;
							const filteredCtx = filteredCanvas.getContext('2d', {
								colorSpace: env.colorSpace,
							});

							if (smallCtx && blurredSmallCtx && filteredCtx) {
								// 5. Downscale: draw source to small canvas
								smallCtx.drawImage(tempCanvas, 0, 0, smallWidth, smallHeight);

								// 6. Apply blur: draw to separate canvas with filter (avoids self-draw)
								blurredSmallCtx.filter = scaleFilter(
									backdropFilterValue,
									scale * blurDownscale,
								);
								blurredSmallCtx.drawImage(smallCanvas, 0, 0);

								// 7. Upscale: draw blurred result back to full resolution
								filteredCtx.drawImage(
									blurredSmallCanvas,
									0,
									0,
									sampleWidthPx,
									sampleHeightPx,
								);

								// 8. Use the upscaled canvas as the final source
								backdropFilterCanvas = filteredCanvas;
							} else {
								// Fallback if context creation fails
								backdropFilterCanvas = tempCanvas;
							}

							backdropFilterRect = {
								// Store the expanded rect position in DOM space. The offset within
								// the canvas accounts for the bleed area we added.
								left: rect.left - offsetXPx / scale,
								top: rect.top - offsetYPx / scale,
								width: sampleWidthPx / scale,
								height: sampleHeightPx / scale,
								right: rect.left - offsetXPx / scale + sampleWidthPx / scale,
								bottom: rect.top - offsetYPx / scale + sampleHeightPx / scale,
								x: rect.left - offsetXPx / scale,
								y: rect.top - offsetYPx / scale,
								toJSON: () => ({}),
							} as DOMRect;
						}
					}
				}
			} catch {
				// Ignore errors (e.g., CORS restrictions on getImageData)
				console.warn(
					`[screenshot] Could not capture backdrop for backdrop-filter. This may be due to canvas security restrictions.`,
				);
			}
		}

		if (needsSave) {
			context.save();

			if (hasOpacity) {
				context.globalAlpha *= opacityValue;
			}

			// Approximate CSS `filter` using the Canvas2D filter pipeline. For
			// elements with a filter we treat the element as a mini stacking
			// context: the filter is applied while painting the element background,
			// borders, contents and descendants, and then reset.
			if (hasFilter) {
				context.filter = filterValue;
			}

			// Approximate CSS `mix-blend-mode` using the Canvas2D
			// `globalCompositeOperation`. This is not a perfect match for the CSS
			// painting model (especially when combined with `isolation: isolate`),
			// but it preserves the most common visual blending behaviors.
			if (hasMixBlendMode) {
				const compositeOperation =
					getCompositeOperationForMixBlendMode(mixBlendMode);
				if (compositeOperation) {
					context.globalCompositeOperation =
						compositeOperation as GlobalCompositeOperation;
				}
			}

			// For SVG elements, skip transform application since we'll use visual position directly
			const isSvgElement = element instanceof SVGSVGElement;
			if (hasTransform && !isSvgElement) {
				applyElementTransform(context, element, rect);
			}

			// Paint outer (non-inset) box shadow before clipping so its blur can
			// extend outside the element's border box, matching CSS behavior.
			paintOuterBoxShadow();

			if (hasClipPath) {
				applyClipPath(context, style.clipPath, rect);
			}

			if (shouldClip) {
				// Clip the element's own painting to the rounded border box or
				// clip-path. Overflow clipping for contents is applied later.
				context.beginPath();

				const clipRect: DOMRect = rect;
				const clipRadii: BorderRadii | null = hasRadius ? radii : null;

				if (hasRadius && clipRadii) {
					pathRoundedRect(context, clipRect, clipRadii);
				} else {
					context.rect(
						clipRect.left,
						clipRect.top,
						clipRect.width,
						clipRect.height,
					);
				}

				context.clip();
			}
		} else {
			// Elements without local save/restore still need their outer shadows.
			paintOuterBoxShadow();
		}

		await renderElementNode(
			element,
			context,
			style,
			rect,
			radii,
			hasRadius,
			env,
			backdropFilterCanvas,
			backdropFilterRect,
		);

		// After painting the element's own background/border, apply overflow
		// clipping for descendants (children + pseudo-elements). CSS overflow
		// clips contents to the padding box but does not clip borders.
		if (hasOverflowClip) {
			const borderLeft = parseCssLength(style.borderLeftWidth);
			const borderTop = parseCssLength(style.borderTopWidth);
			const borderRight = parseCssLength(style.borderRightWidth);
			const borderBottom = parseCssLength(style.borderBottomWidth);

			const paddingRect: DOMRect = {
				left: rect.left + borderLeft,
				top: rect.top + borderTop,
				width: Math.max(0, rect.width - borderLeft - borderRight),
				height: Math.max(0, rect.height - borderTop - borderBottom),
				right: rect.right - borderRight,
				bottom: rect.bottom - borderBottom,
				x: 0,
				y: 0,
				toJSON: () => ({}),
			} as DOMRect;

			let clipRadii: BorderRadii | null = hasRadius ? radii : null;
			if (hasRadius && clipRadii) {
				clipRadii = shrinkBorderRadiiForInnerBox(
					clipRadii,
					borderLeft,
					borderTop,
					borderRight,
					borderBottom,
				);
			}

			context.save();
			context.beginPath();
			if (hasRadius && clipRadii) {
				pathRoundedRect(context, paddingRect, clipRadii);
			} else {
				context.rect(
					paddingRect.left,
					paddingRect.top,
					paddingRect.width,
					paddingRect.height,
				);
			}

			context.clip();
			overflowClipApplied = true;
		}

		let beforeStyle: CSSStyleDeclaration | null = null;
		let afterStyle: CSSStyleDeclaration | null = null;

		if (
			element instanceof HTMLElement &&
			view &&
			typeof view.getComputedStyle === 'function'
		) {
			beforeStyle = view.getComputedStyle(element, '::before');
			afterStyle = view.getComputedStyle(element, '::after');
		}

		if (element instanceof HTMLElement) {
			await renderPseudoElement(
				element,
				context,
				beforeStyle,
				style,
				rect,
				radii,
				hasRadius,
				env,
				'before',
			);
		}

		const children = Array.from(element.childNodes);
		const normalChildren: Node[] = [];
		const negativeZ: {node: Element; z: number; order: number}[] = [];
		const positiveZ: {node: Element; z: number; order: number}[] = [];

		let order = 0;
		const childrenLength = children.length;
		for (let index = 0; index < childrenLength; index++) {
			const child = children[index];
			order++;

			if (child.nodeType !== Node.ELEMENT_NODE || !(child instanceof Element)) {
				normalChildren.push(child);
				continue;
			}

			const childElement = child;
			const childStyle = getStyle(childElement);
			if (!childStyle) {
				continue;
			}

			if (childStyle.visibility === 'hidden' || childStyle.display === 'none') {
				continue;
			}

			const {position} = childStyle;
			const zIndexStr = childStyle.zIndex;
			const isPositioned =
				position === 'absolute' ||
				position === 'relative' ||
				position === 'fixed' ||
				position === 'sticky';

			// Treat `position: fixed` and positioned elements with a non-auto z-index
			// as simple stacking-context participants. This is an approximation of the
			// full CSS stacking spec but matches common UI layouts well enough without
			// introducing offscreen compositing.

			if (isPositioned && zIndexStr !== 'auto') {
				const parsed = parseInt(zIndexStr, 10);
				const zIndex = Number.isFinite(parsed) ? parsed : 0;
				if (zIndex < 0) {
					negativeZ.push({node: childElement, z: zIndex, order});
				} else {
					positiveZ.push({node: childElement, z: zIndex, order});
				}
			} else {
				normalChildren.push(child);
			}
		}

		negativeZ.sort(
			(itemA, itemB) => itemA.z - itemB.z || itemA.order - itemB.order,
		);
		positiveZ.sort(
			(itemA, itemB) => itemA.z - itemB.z || itemA.order - itemB.order,
		);

		const negativeZLength = negativeZ.length;
		for (let index = 0; index < negativeZLength; index++) {
			await renderNode(negativeZ[index].node, context, env);
		}

		const normalChildrenLength = normalChildren.length;
		for (let index = 0; index < normalChildrenLength; index++) {
			await renderNode(normalChildren[index], context, env);
		}

		const positiveZLength = positiveZ.length;
		for (let index = 0; index < positiveZLength; index++) {
			await renderNode(positiveZ[index].node, context, env);
		}

		if (element instanceof HTMLElement) {
			await renderPseudoElement(
				element,
				context,
				afterStyle,
				style,
				rect,
				radii,
				hasRadius,
				env,
				'after',
			);
		}

		if (overflowClipApplied) {
			context.restore();
		}

		// Draw outline after all contents and pseudo-elements, but before restoring
		// the local transform/opacity/filter state so that the outline participates
		// in the same transform as the element while not being clipped by
		// overflow:hidden/scroll.
		drawOutline(context, style, rect, radii, hasRadius);

		if (needsSave) {
			context.restore();
		}
	} else if (node.nodeType === Node.TEXT_NODE && node instanceof Text) {
		await renderTextNode(node, context, env);
	}
}

function calculateDynamicPadding(
	matrix: DOMMatrix,
	width: number,
	height: number,
): number {
	// Local corners
	const corners = [
		{x: 0, y: 0, z: 0},
		{x: width, y: 0, z: 0},
		{x: width, y: height, z: 0},
		{x: 0, y: height, z: 0},
	];

	let minX = Infinity;
	let maxX = -Infinity;
	let minY = Infinity;
	let maxY = -Infinity;

	// Transform corners to see their projected 2D extent relative to origin
	corners.forEach((p) => {
		const tf = matrix.transformPoint(new DOMPoint(p.x, p.y, p.z));
		if (tf.x < minX) minX = tf.x;
		if (tf.x > maxX) maxX = tf.x;
		if (tf.y < minY) minY = tf.y;
		if (tf.y > maxY) maxY = tf.y;
	});

	// Calculate required padding on each side
	// Note: We use Math.abs to cover rotation in any direction
	const padLeft = Math.abs(Math.min(0, minX));
	const padTop = Math.abs(Math.min(0, minY));
	const padRight = Math.max(0, maxX - width);
	const padBottom = Math.max(0, maxY - height);

	// Return the largest necessary padding + a safety buffer for shadows/blur
	return Math.ceil(Math.max(padLeft, padTop, padRight, padBottom)) + 20;
}

type BrowserCorner = {x: number; y: number};

function computeBrowserCorners(
	element: Element,
	captureRect: DOMRect,
): BrowserCorner[] {
	const anyElement = element as any;

	// getBoxQuads / getBoundingClientRect return viewport coords; captureRect is document coords.
	// Convert to document by adding scroll before subtracting captureRect.
	const scroll = getDocumentScrollOffsets(element);

	// Prefer the browser's exact painted quad.
	// Different browsers return different coordinate spaces:
	// - Chrome: viewport-space (need to add scroll)
	// - Firefox/Safari: document-space (do NOT add scroll)
	// Detect by comparing quad.p1.y to BCR.top - if close, it's viewport coords.
	if (typeof anyElement.getBoxQuads === 'function') {
		const quads = anyElement.getBoxQuads({box: 'border'}) as DOMQuad[];
		if (quads && quads.length > 0) {
			const quad = quads[0];
			const bcr = element.getBoundingClientRect();

			// Detect coordinate space: if quad.y is close to BCR.top, it's viewport coords
			// If quad.y is close to BCR.top + scroll, it's document coords
			const isViewportCoords = Math.abs(quad.p1.y - bcr.top) < 50;
			const scrollAdjustX = isViewportCoords ? scroll.x : 0;
			const scrollAdjustY = isViewportCoords ? scroll.y : 0;

			return [
				{
					x: quad.p1.x + scrollAdjustX - captureRect.left,
					y: quad.p1.y + scrollAdjustY - captureRect.top,
				},
				{
					x: quad.p2.x + scrollAdjustX - captureRect.left,
					y: quad.p2.y + scrollAdjustY - captureRect.top,
				},
				{
					x: quad.p3.x + scrollAdjustX - captureRect.left,
					y: quad.p3.y + scrollAdjustY - captureRect.top,
				},
				{
					x: quad.p4.x + scrollAdjustX - captureRect.left,
					y: quad.p4.y + scrollAdjustY - captureRect.top,
				},
			];
		}
	}

	// Fallback: axis-aligned bounding rect (viewport coordinates)
	const r = element.getBoundingClientRect();

	return [
		{
			x: r.left + scroll.x - captureRect.left,
			y: r.top + scroll.y - captureRect.top,
		},
		{
			x: r.right + scroll.x - captureRect.left,
			y: r.top + scroll.y - captureRect.top,
		},
		{
			x: r.right + scroll.x - captureRect.left,
			y: r.bottom + scroll.y - captureRect.top,
		},
		{
			x: r.left + scroll.x - captureRect.left,
			y: r.bottom + scroll.y - captureRect.top,
		},
	];
}

function isUnsupported3DTransform(transform: string): boolean {
	const lower = transform.toLowerCase();
	return (
		lower.indexOf('matrix3d(') !== -1 ||
		lower.indexOf('perspective(') !== -1 ||
		lower.indexOf('translate3d') !== -1 ||
		lower.indexOf('translatez') !== -1 ||
		lower.indexOf('scale3d') !== -1 ||
		lower.indexOf('scalez') !== -1 ||
		lower.indexOf('rotate3d') !== -1 ||
		lower.indexOf('rotatex') !== -1 ||
		lower.indexOf('rotatey') !== -1
	);
}

function applyElementTransform(
	context: CanvasRenderingContext2D,
	element: Element,
	layoutRect: DOMRect,
): void {
	const {ownerDocument} = element;
	const defaultView = ownerDocument?.defaultView;
	if (!ownerDocument || !defaultView) return;

	const style = defaultView.getComputedStyle(element);
	if (!style) return;

	const {transform} = style;
	if (!transform || transform === 'none') {
		return;
	}

	const originValue = style.transformOrigin || '50% 50%';
	const [originX, originY] = parseTransformOrigin(originValue, layoutRect);

	if (isUnsupported3DTransform(transform)) {
		const matrix3d = buildElement3DTransformMatrix(transform);
		if (!matrix3d) {
			return;
		}

		// CSS 3D transform model: transformed = origin + M * (point - origin)
		// We need to compute where each corner of the element ends up after 3D transform
		const transform3DPoint = (
			pageX: number,
			pageY: number,
		): {x: number; y: number} => {
			// Make point relative to transform origin
			const relX = pageX - originX;
			const relY = pageY - originY;
			// Transform through the 3D matrix
			const [tx, ty] = matrix3d.transformPoint(relX, relY, 0);
			// Translate back from origin
			return {x: originX + tx, y: originY + ty};
		};

		// Transform the three corners we need for affine approximation
		const topLeft = transform3DPoint(layoutRect.left, layoutRect.top);
		const topRight = transform3DPoint(
			layoutRect.left + layoutRect.width,
			layoutRect.top,
		);
		const bottomLeft = transform3DPoint(
			layoutRect.left,
			layoutRect.top + layoutRect.height,
		);

		// Derive the 2D affine transform [a, b, c, d, e, f] that maps:
		//   (rect.left, rect.top) → topLeft
		//   (rect.left + width, rect.top) → topRight
		//   (rect.left, rect.top + height) → bottomLeft
		//
		// Canvas transform(a,b,c,d,e,f) maps (x,y) to:
		//   x' = a*x + c*y + e
		//   y' = b*x + d*y + f

		const {width} = layoutRect;
		const {height} = layoutRect;

		if (width === 0 || height === 0) return;

		const a = (topRight.x - topLeft.x) / width;
		const b = (topRight.y - topLeft.y) / width;
		const c = (bottomLeft.x - topLeft.x) / height;
		const d = (bottomLeft.y - topLeft.y) / height;
		const e = topLeft.x - a * layoutRect.left - c * layoutRect.top;
		const f = topLeft.y - b * layoutRect.left - d * layoutRect.top;

		if (
			Number.isFinite(a) &&
			Number.isFinite(b) &&
			Number.isFinite(c) &&
			Number.isFinite(d) &&
			Number.isFinite(e) &&
			Number.isFinite(f)
		) {
			context.transform(a, b, c, d, e, f);
		}
	} else {
		// Apply pure 2D transforms around the same origin as CSS does:
		//   T(origin) · transform-list · T(-origin)
		context.translate(originX, originY);
		applyTransformList(context, transform, layoutRect);
		context.translate(-originX, -originY);
	}
}

function getCompositeOperationForMixBlendMode(mode: string): string | null {
	const lower = mode.trim().toLowerCase();
	if (!lower || lower === 'normal') return null;

	if (lower === 'plus-lighter') {
		return 'lighter';
	}

	// Most CSS blend modes are supported by Canvas2D with the same enum name.
	const supported = new Set<string>([
		'multiply',
		'screen',
		'overlay',
		'darken',
		'lighten',
		'color-dodge',
		'color-burn',
		'hard-light',
		'soft-light',
		'difference',
		'exclusion',
		'hue',
		'saturation',
		'color',
		'luminosity',
	]);

	if (supported.has(lower)) {
		return lower;
	}

	return null;
}

function parseTransformOrigin(origin: string, rect: DOMRect): [number, number] {
	const tokens = origin.split(/\s+/).filter(Boolean);
	const xToken = tokens[0] ?? '50%';
	const yToken = tokens[1] ?? '50%';

	const resolve = (token: string, size: number): number => {
		const lower = token.toLowerCase();
		if (lower === 'left' || lower === 'top') return 0;
		if (lower === 'right' || lower === 'bottom') return size;
		if (lower === 'center') return size / 2;
		if (token.endsWith('%')) {
			const value = parseFloat(token);
			if (Number.isFinite(value)) {
				return (value / 100) * size;
			}

			return size / 2;
		}

		const length = parseCssLength(token);
		// Treat any successfully parsed length (including 0) as an absolute offset
		// from the corresponding edge. Only fall back to the center when we cannot
		// parse a usable numeric value at all.
		if (!Number.isFinite(length)) {
			return size / 2;
		}

		return length;
	};

	const originX = rect.left + resolve(xToken, rect.width);
	const originY = rect.top + resolve(yToken, rect.height);
	return [originX, originY];
}

type TransformFunction =
	| {type: 'translate'; x: number; y: number}
	| {type: 'scale'; x: number; y: number}
	| {type: 'rotate'; angleRad: number}
	| {type: 'skewX'; angleRad: number}
	| {type: 'skewY'; angleRad: number}
	| {
			type: 'matrix';
			scaleX: number;
			skewY: number;
			skewX: number;
			scaleY: number;
			translateX: number;
			translateY: number;
	  };

function applyTransformList(
	context: CanvasRenderingContext2D,
	transform: string,
	rect?: DOMRect,
): void {
	const transformFunctions = parseTransformFunctions(transform, rect);
	if (!transformFunctions.length) return;

	const transformFunctionsLength = transformFunctions.length;
	for (let index = 0; index < transformFunctionsLength; index++) {
		const transformFunction = transformFunctions[index];
		switch (transformFunction.type) {
			case 'translate':
				context.translate(transformFunction.x, transformFunction.y);
				break;
			case 'scale':
				context.scale(transformFunction.x, transformFunction.y);
				break;
			case 'rotate':
				context.rotate(transformFunction.angleRad);
				break;
			case 'skewX':
				context.transform(1, 0, Math.tan(transformFunction.angleRad), 1, 0, 0);
				break;
			case 'skewY':
				context.transform(1, Math.tan(transformFunction.angleRad), 0, 1, 0, 0);
				break;
			case 'matrix':
				context.transform(
					transformFunction.scaleX,
					transformFunction.skewY,
					transformFunction.skewX,
					transformFunction.scaleY,
					transformFunction.translateX,
					transformFunction.translateY,
				);
				break;
		}
	}
}

function parseTransformFunctions(
	transform: string,
	rect?: DOMRect,
): TransformFunction[] {
	const result: TransformFunction[] = [];
	const normalized = transform.trim();
	if (!normalized || normalized === 'none') return result;

	const regex = /([a-zA-Z][a-zA-Z0-9]*)\(([^)]*)\)/g;
	let match: RegExpExecArray | null;

	while ((match = regex.exec(normalized))) {
		const fnName = match[1].toLowerCase();
		const argsString = match[2];
		const args: string[] = [];
		const tokenRegex = /[, \t\r\n]+/;
		let start = 0;
		for (let index = 0; index < argsString.length; index++) {
			if (tokenRegex.test(argsString[index])) {
				if (index > start) {
					const token = argsString.slice(start, index).trim();
					if (token) args.push(token);
				}

				start = index + 1;
			}
		}

		if (start < argsString.length) {
			const token = argsString.slice(start).trim();
			if (token) args.push(token);
		}

		if (!args.length) continue;

		// 3D → 2D collapse helpers. We approximate common 3D transforms whose
		// effect on the XY plane can be represented as a 2D affine matrix and
		// ignore the Z / perspective components. This covers patterns such as:
		// - translate3d(x, y, 0)
		// - matrix3d(a, b, 0, 0, c, d, 0, 0, 0, 0, 1, 0, e, f, 0, 1)
		// and provides a reasonable fallback for many library‑generated transforms.
		if (fnName === 'matrix3d') {
			if (args.length === 16) {
				const numbers = args.map((token) => parseFloat(token));
				if (numbers.every((value) => Number.isFinite(value))) {
					// CSS matrix3d is a 4×4 matrix. For points on the z=0 plane and
					// ignoring perspective (w=1), the projected 2D transform is:
					// x' = m11 * x + m21 * y + m41
					// y' = m12 * x + m22 * y + m42
					// Map that into the Canvas 2D matrix [a c e; b d f].
					const m11 = numbers[0];
					const m12 = numbers[1];
					const m21 = numbers[4];
					const m22 = numbers[5];
					const m41 = numbers[12];
					const m42 = numbers[13];

					result.push({
						type: 'matrix',
						scaleX: m11,
						skewY: m12,
						skewX: m21,
						scaleY: m22,
						translateX: m41,
						translateY: m42,
					});
				}
			}

			continue;
		}

		if (fnName === 'translate3d') {
			const translateX = parseTranslateComponent(
				args[0] || '0',
				rect?.width ?? 0,
			);
			const translateY = parseTranslateComponent(
				args[1] || '0',
				rect?.height ?? 0,
			);
			// translateZ has no 2D effect without perspective, so we ignore args[2].
			result.push({type: 'translate', x: translateX, y: translateY});
			continue;
		}

		if (fnName === 'translatez') {
			// Without perspective, Z‑only translation does not affect the 2D
			// projection. Treat as a no‑op.
			continue;
		}

		if (fnName === 'scale3d') {
			const scaleX = parseFloat(args[0] || '1');
			const scaleY = parseFloat(args[1] || args[0] || '1');
			if (!Number.isFinite(scaleX) || !Number.isFinite(scaleY)) continue;
			// Ignore Z scale – it has no direct 2D effect in our projection model.
			result.push({type: 'scale', x: scaleX, y: scaleY});
			continue;
		}

		if (fnName === 'scalez') {
			// Pure Z scale has no 2D effect without perspective.
			continue;
		}

		if (fnName === 'rotate3d') {
			// rotate3d(ax, ay, az, angle) – approximate only rotations whose axis is
			// predominantly along the Z axis as a 2D rotate(). Other axes require
			// full 3D projection and are treated as no‑ops here.
			if (args.length < 4) continue;

			const ax = parseFloat(args[0]);
			const ay = parseFloat(args[1]);
			const az = parseFloat(args[2]);
			const angleToken = args[3];

			if (
				!Number.isFinite(ax) ||
				!Number.isFinite(ay) ||
				!Number.isFinite(az)
			) {
				continue;
			}

			const angleRad = parseAngleToRadians(angleToken);
			if (angleRad == null) continue;

			const length = Math.sqrt(ax * ax + ay * ay + az * az);
			if (!(length > 0)) continue;

			const nx = ax / length;
			const ny = ay / length;
			const nz = az / length;

			const absNz = Math.abs(nz);
			const absNx = Math.abs(nx);
			const absNy = Math.abs(ny);

			// Axis must be mostly aligned with Z to behave like a screen‑space rotate.
			if (absNz < Math.max(absNx, absNy)) {
				continue;
			}

			const signedAngle = nz >= 0 ? angleRad : -angleRad;
			result.push({type: 'rotate', angleRad: signedAngle});
			continue;
		}

		if (fnName === 'rotatex' || fnName === 'rotatey') {
			// 3D rotations around the X/Y axes require a perspective projection to
			// look correct; there is no direct 2D Canvas equivalent. We currently
			// approximate them as no‑ops rather than introducing misleading skew.
			continue;
		}

		if (fnName === 'translate') {
			const translateX = parseTranslateComponent(
				args[0] || '0',
				rect?.width ?? 0,
			);
			const translateY = parseTranslateComponent(
				args[1] || '0',
				rect?.height ?? 0,
			);
			result.push({type: 'translate', x: translateX, y: translateY});
			continue;
		}

		if (fnName === 'translatex') {
			const translateX = parseTranslateComponent(
				args[0] || '0',
				rect?.width ?? 0,
			);
			const translateY = 0;
			result.push({type: 'translate', x: translateX, y: translateY});
			continue;
		}

		if (fnName === 'translatey') {
			const translateX = 0;
			const translateY = parseTranslateComponent(
				args[0] || '0',
				rect?.height ?? 0,
			);
			result.push({type: 'translate', x: translateX, y: translateY});
			continue;
		}

		if (fnName === 'scale' || fnName === 'scalex' || fnName === 'scaley') {
			const scaleX = fnName === 'scaley' ? 1 : parseFloat(args[0] || '1');
			const scaleY =
				fnName === 'scalex'
					? 1
					: parseFloat(args[fnName === 'scale' && args[1] ? 1 : 0] || '1');
			if (!Number.isFinite(scaleX) || !Number.isFinite(scaleY)) continue;
			result.push({type: 'scale', x: scaleX, y: scaleY});
			continue;
		}

		if (fnName === 'rotate') {
			const angleRad = parseAngleToRadians(args[0]);
			if (angleRad == null) continue;
			result.push({type: 'rotate', angleRad});
			continue;
		}

		if (fnName === 'skewx') {
			const angleRad = parseAngleToRadians(args[0]);
			if (angleRad == null) continue;
			result.push({type: 'skewX', angleRad});
			continue;
		}

		if (fnName === 'skewy') {
			const angleRad = parseAngleToRadians(args[0]);
			if (angleRad == null) continue;
			result.push({type: 'skewY', angleRad});
			continue;
		}

		if (fnName === 'matrix' && args.length === 6) {
			const scaleX = parseFloat(args[0]);
			const skewY = parseFloat(args[1]);
			const skewX = parseFloat(args[2]);
			const scaleY = parseFloat(args[3]);
			const translateX = parseFloat(args[4]);
			const translateY = parseFloat(args[5]);
			if (
				!Number.isFinite(scaleX) ||
				!Number.isFinite(skewY) ||
				!Number.isFinite(skewX) ||
				!Number.isFinite(scaleY) ||
				!Number.isFinite(translateX) ||
				!Number.isFinite(translateY)
			) {
				continue;
			}

			result.push({
				type: 'matrix',
				scaleX,
				skewY,
				skewX,
				scaleY,
				translateX,
				translateY,
			});
		}
	}

	return result;
}

function parseAngleToRadians(token: string | undefined): number | null {
	if (!token) return null;
	const match = token.trim().match(/^(-?\d*\.?\d+)(deg|rad|turn|grad)?$/);
	if (!match) return null;
	const value = parseFloat(match[1]);
	if (!Number.isFinite(value)) return null;
	const unit = match[2] || 'deg';
	let degrees = value;
	switch (unit) {
		case 'turn':
			degrees = value * 360;
			break;
		case 'rad':
			degrees = (value * 180) / Math.PI;
			break;
		case 'grad':
			degrees = value * 0.9;
			break;
		case 'deg':
		default:
			break;
	}

	return (degrees * Math.PI) / 180;
}

function parseTranslateComponent(token: string, boxSize: number): number {
	const trimmed = token.trim();
	if (!trimmed) return 0;

	// Percentages are relative to the corresponding box dimension, matching the
	// CSS transform spec for translate() when authored with percentages.
	if (trimmed.endsWith('%')) {
		const value = parseFloat(trimmed);
		if (Number.isFinite(value)) {
			return (value / 100) * boxSize;
		}

		return 0;
	}

	// Only treat bare numbers / px as CSS pixels; other units (em, vh, etc.)
	// are ignored here to avoid lying about units in CSS pixel space.
	const match = trimmed.match(/^(-?\d*\.?\d+)(px)?$/);
	if (!match) {
		return 0;
	}

	const number = parseFloat(match[1]);
	return Number.isFinite(number) ? number : 0;
}

class Matrix4 {
	matrix: number[];

	constructor() {
		// Row-major 4×4 identity matrix
		this.matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
	}

	static identity(): Matrix4 {
		return new Matrix4();
	}

	static translation(x: number, y: number, z: number): Matrix4 {
		const result = new Matrix4();
		result.matrix[12] = x;
		result.matrix[13] = y;
		result.matrix[14] = z;
		return result;
	}

	static scale(x: number, y: number, z: number): Matrix4 {
		const result = new Matrix4();
		result.matrix[0] = x;
		result.matrix[5] = y;
		result.matrix[10] = z;
		return result;
	}

	static rotationX(angleRad: number): Matrix4 {
		const cos = Math.cos(angleRad);
		const sin = Math.sin(angleRad);
		const result = new Matrix4();
		result.matrix = [1, 0, 0, 0, 0, cos, -sin, 0, 0, sin, cos, 0, 0, 0, 0, 1];
		return result;
	}

	static rotationY(angleRad: number): Matrix4 {
		const cos = Math.cos(angleRad);
		const sin = Math.sin(angleRad);
		const result = new Matrix4();
		result.matrix = [cos, 0, sin, 0, 0, 1, 0, 0, -sin, 0, cos, 0, 0, 0, 0, 1];
		return result;
	}

	static rotationZ(angleRad: number): Matrix4 {
		const cos = Math.cos(angleRad);
		const sin = Math.sin(angleRad);
		const result = new Matrix4();
		result.matrix = [cos, -sin, 0, 0, sin, cos, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
		return result;
	}

	static perspective(distance: number): Matrix4 {
		const result = new Matrix4();
		if (distance !== 0) {
			// Approximate CSS perspective: project points by dividing with 1 + z / distance.
			result.matrix[11] = -1 / distance;
		}

		return result;
	}

	multiply(other: Matrix4): Matrix4 {
		const a = this.matrix;
		const b = other.matrix;
		const result = new Array<number>(16);

		for (let row = 0; row < 4; row++) {
			const rowOffset = row * 4;
			for (let column = 0; column < 4; column++) {
				result[rowOffset + column] =
					a[rowOffset + 0] * b[column + 0] +
					a[rowOffset + 1] * b[column + 4] +
					a[rowOffset + 2] * b[column + 8] +
					a[rowOffset + 3] * b[column + 12];
			}
		}

		this.matrix = result;
		return this;
	}

	transformPoint(
		x: number,
		y: number,
		z: number,
	): [number, number, number, number] {
		const {matrix} = this;
		const w = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15];
		const inverseW = w !== 0 && Number.isFinite(w) ? 1 / w : 1;
		const transformedX =
			(matrix[0] * x + //
				matrix[4] * y +
				matrix[8] * z +
				matrix[12]) *
			inverseW;
		const transformedY =
			(matrix[1] * x + //
				matrix[5] * y +
				matrix[9] * z +
				matrix[13]) *
			inverseW;
		const transformedZ =
			(matrix[2] * x + //
				matrix[6] * y +
				matrix[10] * z +
				matrix[14]) *
			inverseW;

		return [transformedX, transformedY, transformedZ, w];
	}
}

function getParentPerspective(element: Element): {
	distance: number;
	originX: number;
	originY: number;
} | null {
	let ancestor = element.parentElement;
	while (ancestor) {
		const {ownerDocument} = ancestor;
		const defaultView = ownerDocument?.defaultView;
		if (!ownerDocument || !defaultView) break;

		let style: CSSStyleDeclaration | null = null;
		try {
			style = defaultView.getComputedStyle(ancestor);
		} catch {
			style = null;
		}

		if (style) {
			const perspectiveRaw = style.perspective || '';
			if (
				perspectiveRaw &&
				perspectiveRaw !== 'none' &&
				perspectiveRaw !== '0' &&
				perspectiveRaw !== '0px'
			) {
				const distance = parseCssLength(perspectiveRaw);
				if (Number.isFinite(distance) && distance !== 0) {
					// FIX: Use getUntransformedLayoutRect.
					// We must calculate the perspective origin relative to the
					// element's *layout* box, not its projected/transformed visual box.
					const rect = getUntransformedLayoutRect(ancestor);

					const originRaw = style.perspectiveOrigin || '50% 50%';
					const [originX, originY] = parseTransformOrigin(originRaw, rect);

					return {
						distance,
						originX,
						originY,
					};
				}
			}
		}

		ancestor = ancestor.parentElement;
	}

	return null;
}

function buildElement3DTransformMatrix(transform: string): Matrix4 | null {
	// 1. Start with Identity for the element's own transforms
	// This will accumulate rotate/scale/translate from the CSS 'transform' property
	const elementMatrix = Matrix4.identity();

	const normalized = transform.trim();
	if (normalized && normalized !== 'none') {
		// 2. Apply Element Transforms (Rotate, Scale, Translate)
		// CSS transforms are applied from left to right in the string, which corresponds
		// to multiplying matrices in that order: T = A * B * C
		const regex = /([a-zA-Z][a-zA-Z0-9]*)\(([^)]*)\)/g;
		let match: RegExpExecArray | null;

		const parseLength = (token: string): number => {
			const trimmed = token.trim();
			if (!trimmed) return 0;
			if (trimmed.endsWith('%')) return 0;
			return parseCssLength(trimmed);
		};

		while ((match = regex.exec(normalized))) {
			const functionName = match[1].toLowerCase();
			const argsString = match[2];
			// Split by comma or whitespace, filtering out empty strings
			const tokens = argsString.split(/[, \t\r\n]+/).filter((t) => t.trim());

			if (!tokens.length) continue;

			switch (functionName) {
				case 'translate':
				case 'translate3d': {
					const x = parseLength(tokens[0] || '0');
					const y = parseLength(tokens[1] || '0');
					const z = parseLength(tokens[2] || '0');
					elementMatrix.multiply(Matrix4.translation(x, y, z));
					break;
				}

				case 'translatex': {
					const x = parseLength(tokens[0] || '0');
					elementMatrix.multiply(Matrix4.translation(x, 0, 0));
					break;
				}

				case 'translatey': {
					const y = parseLength(tokens[0] || '0');
					elementMatrix.multiply(Matrix4.translation(0, y, 0));
					break;
				}

				case 'translatez': {
					const z = parseLength(tokens[0] || '0');
					elementMatrix.multiply(Matrix4.translation(0, 0, z));
					break;
				}

				case 'scale':
				case 'scale3d': {
					const scaleX = parseFloat(tokens[0] || '1');
					const scaleY = parseFloat(tokens[1] || tokens[0] || '1');
					const scaleZ = parseFloat(tokens[2] || tokens[0] || '1');
					if (
						Number.isFinite(scaleX) &&
						Number.isFinite(scaleY) &&
						Number.isFinite(scaleZ)
					) {
						elementMatrix.multiply(Matrix4.scale(scaleX, scaleY, scaleZ));
					}

					break;
				}

				case 'scalex': {
					const scaleX = parseFloat(tokens[0] || '1');
					if (Number.isFinite(scaleX)) {
						elementMatrix.multiply(Matrix4.scale(scaleX, 1, 1));
					}

					break;
				}

				case 'scaley': {
					const scaleY = parseFloat(tokens[0] || '1');
					if (Number.isFinite(scaleY)) {
						elementMatrix.multiply(Matrix4.scale(1, scaleY, 1));
					}

					break;
				}

				case 'scalez': {
					const scaleZ = parseFloat(tokens[0] || '1');
					if (Number.isFinite(scaleZ)) {
						elementMatrix.multiply(Matrix4.scale(1, 1, scaleZ));
					}

					break;
				}

				case 'rotatex': {
					const angle = parseAngleToRadians(tokens[0]);
					if (angle != null) {
						elementMatrix.multiply(Matrix4.rotationX(angle));
					}

					break;
				}

				case 'rotatey': {
					const angle = parseAngleToRadians(tokens[0]);
					if (angle != null) {
						elementMatrix.multiply(Matrix4.rotationY(angle));
					}

					break;
				}

				case 'rotatez':
				case 'rotate': {
					const angle = parseAngleToRadians(tokens[0]);
					if (angle != null) {
						elementMatrix.multiply(Matrix4.rotationZ(angle));
					}

					break;
				}

				case 'matrix3d': {
					if (tokens.length >= 16) {
						const m = tokens.map((token) => parseFloat(token));
						if (m.every((value) => Number.isFinite(value))) {
							const m3d = new Matrix4();
							// CSS matrix3d is usually column-major in definition,
							// but standard matrix multiplication expects the values in the
							// order they appear. We just load them as-is.
							// NOTE: If you previously added a transpose fix here, remove it.
							// Matrix4 stores row-major, so we load these 16 values directly.
							// We will handle the WebGL transpose in the render function.
							m3d.matrix = [
								m[0],
								m[4],
								m[8],
								m[12],
								m[1],
								m[5],
								m[9],
								m[13],
								m[2],
								m[6],
								m[10],
								m[14],
								m[3],
								m[7],
								m[11],
								m[15],
							];
							elementMatrix.multiply(m3d);
						}
					}

					break;
				}
			}
		}
	}

	// 3. Don't apply perspective here - let renderTextureWithPerspective handle it
	// so it can properly wrap with perspective-origin
	return elementMatrix;
}

async function renderFixedPositionElements(
	context: CanvasRenderingContext2D,
	env: RenderEnvironment,
): Promise<void> {
	const root = env.rootElement;
	const document = root.ownerDocument;
	if (!document) return;

	const all =
		env.allElements && env.allElements.length
			? env.allElements
			: Array.from(document.querySelectorAll<HTMLElement>('*'));
	const fixedElements: HTMLElement[] = [];

	const allLength = all.length;
	for (let index = 0; index < allLength; index++) {
		const element = all[index];
		if (root.contains(element)) continue;
		const style = getStyle(element);
		if (!style || style.position !== 'fixed') continue;

		const rect = getVisualRect(element);
		if (rect.width === 0 || rect.height === 0) continue;

		if (env.includeFixed === 'all') {
			fixedElements.push(element);
			continue;
		}

		if (env.includeFixed === 'intersecting') {
			if (rectIntersects(env.captureRect, rect)) {
				fixedElements.push(element);
			}
		}
	}

	const fixedElementsLength = fixedElements.length;
	for (let index = 0; index < fixedElementsLength; index++) {
		await renderNode(fixedElements[index], context, env);
	}
}

function rectIntersects(rectA: DOMRect, rectB: DOMRect): boolean {
	return !(
		rectA.right <= rectB.left ||
		rectA.left >= rectB.right ||
		rectA.bottom <= rectB.top ||
		rectA.top >= rectB.bottom
	);
}

function getDocumentScrollOffsets(element: Element): {x: number; y: number} {
	const {ownerDocument} = element;
	const defaultView = ownerDocument?.defaultView;

	if (!ownerDocument || !defaultView) {
		return {x: 0, y: 0};
	}

	const {documentElement} = ownerDocument;
	const {body} = ownerDocument;

	const x =
		defaultView.pageXOffset ??
		documentElement?.scrollLeft ??
		body?.scrollLeft ??
		0;
	const y =
		defaultView.pageYOffset ??
		documentElement?.scrollTop ??
		body?.scrollTop ??
		0;

	return {x, y};
}

function getAncestorScrollOffsets(element: Element): {x: number; y: number} {
	const {ownerDocument} = element;
	if (!ownerDocument) {
		return {x: 0, y: 0};
	}

	const docElement = ownerDocument.documentElement;
	const {body} = ownerDocument;

	let x = 0;
	let y = 0;
	let current = element.parentElement;

	// Traverse scrollable ancestors (excluding the document scroll root, which is
	// handled separately via pageXOffset/pageYOffset) so that offset-based layout
	// measurements stay in the same visual coordinate space as getBoundingClientRect.
	while (current && current !== docElement && current !== body) {
		x += current.scrollLeft || 0;
		y += current.scrollTop || 0;
		current = current.parentElement;
	}

	return {x, y};
}

function toDocumentRect(element: Element, viewportRect: DOMRect): DOMRect {
	const scroll = getDocumentScrollOffsets(element);

	const left = viewportRect.left + scroll.x;
	const top = viewportRect.top + scroll.y;
	const {width} = viewportRect;
	const {height} = viewportRect;

	return {
		left,
		top,
		width,
		height,
		right: left + width,
		bottom: top + height,
		x: left,
		y: top,
		toJSON: () => ({}),
	} as DOMRect;
}

/**
 * Extract translateZ value from a CSS transform string.
 * Returns 0 if no translateZ is found.
 */
function extractTranslateZ(transform: string): number {
	if (!transform || transform === 'none') return 0;

	// Match translateZ(Npx) or translate3d(x, y, Npx)
	const translateZMatch = transform.match(/translateZ\(\s*(-?[\d.]+)px\s*\)/i);
	if (translateZMatch) {
		return parseFloat(translateZMatch[1]);
	}

	const translate3dMatch = transform.match(
		/translate3d\([^,]+,\s*[^,]+,\s*(-?[\d.]+)px\s*\)/i,
	);
	if (translate3dMatch) {
		return parseFloat(translate3dMatch[1]);
	}

	// Also check matrix3d - the Z translation is in position 14 (0-indexed)
	const matrix3dMatch = transform.match(/matrix3d\(([^)]+)\)/);
	if (matrix3dMatch) {
		const values = matrix3dMatch[1].split(',').map((v) => parseFloat(v.trim()));
		if (values.length >= 15) {
			return values[14]; // m43 is the Z translation
		}
	}

	return 0;
}

/**
 * Represents an element and its Z position within a 3D context
 */
interface ZLayerElement {
	element: Element;
	zOffset: number;
	rect: DOMRect;
}

/**
 * Find all elements within a 3D-transformed element that have their own Z translations.
 * Returns elements grouped by Z offset, sorted back-to-front.
 */
function findZLayers(rootElement: Element): Map<number, ZLayerElement[]> {
	const layers = new Map<number, ZLayerElement[]>();

	function addToLayer(element: Element, zOffset: number) {
		const rect = element.getBoundingClientRect();
		if (!layers.has(zOffset)) {
			layers.set(zOffset, []);
		}

		layers.get(zOffset)!.push({element, zOffset, rect});
	}

	function traverse(element: Element, parentZ: number) {
		const style = getStyle(element);
		if (!style) return;

		const transform = style.transform || '';
		const ownZ = extractTranslateZ(transform);
		const totalZ = parentZ + ownZ;

		// Check if this element has its own translateZ
		if (ownZ !== 0) {
			addToLayer(element, totalZ);
		}

		// Traverse children
		for (const child of Array.from(element.children)) {
			traverse(child, totalZ);
		}
	}

	// Start traversal from root's children (root itself is the 3D container)
	for (const child of Array.from(rootElement.children)) {
		traverse(child, 0);
	}

	return layers;
}

/**
 * Get the untransformed layout rect for an element using offset properties.
 * This gives the true layout position before any CSS transforms are applied.
 * Essential for 3D transforms where getBoundingClientRect returns the projected box.
 */
function getUntransformedLayoutRect(element: Element): DOMRect {
	if (!(element instanceof HTMLElement)) {
		return getLayoutRect(element);
	}

	// Start with the element's own visual rect for dimensions
	// (We use visual rect size because offsetWidth/Height are integers,
	// but we want sub-pixel precision if possible, though mostly they match)
	const width = element.offsetWidth;
	const height = element.offsetHeight;

	// Calculate position by traversing the offsetParent chain
	let left = element.offsetLeft;
	let top = element.offsetTop;
	let current = element.offsetParent as HTMLElement | null;

	while (current) {
		left += current.offsetLeft;
		top += current.offsetTop;

		// CRITICAL FIX: Add the parent's border width.
		// offsetLeft is relative to the padding edge, but we need coordinates
		// relative to the document/viewport origin (which includes the border).
		left += current.clientLeft || 0;
		top += current.clientTop || 0;

		// If the element is fixed/sticky, logic might differ, but for
		// standard absolute/relative nesting in 3D, this loop is sufficient.
		const next = current.offsetParent as HTMLElement | null;

		// Stop if we hit the body or null
		if (!next) break;
		current = next;
	}

	const ancestorScroll = getAncestorScrollOffsets(element);
	left -= ancestorScroll.x;
	top -= ancestorScroll.y;

	return {
		left,
		top,
		width,
		height,
		right: left + width,
		bottom: top + height,
		x: left,
		y: top,
		toJSON: () => ({}),
	} as DOMRect;
}

function getLayoutRect(
	element: Element,
	style?: CSSStyleDeclaration | null,
): DOMRect {
	const {ownerDocument} = element;
	const {defaultView} = ownerDocument;

	let fallback: DOMRect;
	try {
		fallback = element.getBoundingClientRect();
	} catch {
		return {
			left: 0,
			top: 0,
			width: 0,
			height: 0,
			right: 0,
			bottom: 0,
			x: 0,
			y: 0,
			toJSON: () => ({}),
		} as DOMRect;
	}

	if (!ownerDocument || !defaultView) {
		return toDocumentRect(element, fallback);
	}

	// For untransformed elements, the layout and visual rects coincide.
	const finalStyle = style ?? getStyle(element);
	const hasTransform =
		finalStyle &&
		finalStyle.transform &&
		finalStyle.transform !== 'none' &&
		!isUnsupported3DTransform(finalStyle.transform);

	if (!hasTransform) {
		return toDocumentRect(element, fallback);
	}

	// For elements with 2D transforms, we need the true pre-transform layout
	// position. The previous center-based approximation incorrectly assumed
	// transforms preserve the element's center, but translations (e.g.,
	// translateX(-50%)) shift the center. Using offset-based positioning gives
	// the true layout rect before transforms are applied.
	if (element instanceof HTMLElement) {
		// Calculate position by traversing the offsetParent chain
		let left = element.offsetLeft;
		let top = element.offsetTop;
		let current = element.offsetParent as HTMLElement | null;

		while (current) {
			left += current.offsetLeft;
			top += current.offsetTop;

			// Add the parent's border width since offsetLeft is relative to padding edge
			left += current.clientLeft || 0;
			top += current.clientTop || 0;

			const next = current.offsetParent as HTMLElement | null;
			if (!next) break;
			current = next;
		}

		const width = element.offsetWidth;
		const height = element.offsetHeight;

		const ancestorScroll = getAncestorScrollOffsets(element);
		left -= ancestorScroll.x;
		top -= ancestorScroll.y;

		return {
			left,
			top,
			width,
			height,
			right: left + width,
			bottom: top + height,
			x: left,
			y: top,
			toJSON: () => ({}),
		} as DOMRect;
	}

	// For non-HTMLElements (e.g., SVG), we can't use offsetLeft/offsetTop.
	// Use getBoundingClientRect (which returns the visual position after transforms)
	// and invert the transform to get the layout position.
	const width = Math.max(0, fallback.width);
	const height = Math.max(0, fallback.height);

	// Use getBoundingClientRect and invert the transform
	const visualRect = toDocumentRect(element, fallback);
	const transformString = finalStyle?.transform || 'none';

	// For SVG elements, use the visual position directly (from getBoundingClientRect)
	// since we skip transform application in the render function for SVGs.
	// This is simpler and more reliable than inverting and re-applying transforms.
	if (element instanceof SVGSVGElement) {
		return {
			left: visualRect.left,
			top: visualRect.top,
			width,
			height,
			right: visualRect.left + width,
			bottom: visualRect.top + height,
			x: visualRect.left,
			y: visualRect.top,
			toJSON: () => ({}),
		} as DOMRect;
	}

	if (!transformString || transformString === 'none') {
		// No transform - visual rect IS the layout rect
		return {
			left: visualRect.left,
			top: visualRect.top,
			width,
			height,
			right: visualRect.left + width,
			bottom: visualRect.top + height,
			x: visualRect.left,
			y: visualRect.top,
			toJSON: () => ({}),
		} as DOMRect;
	}

	// Parse the transform to extract translation values
	const tempRect: DOMRect = {
		left: 0,
		top: 0,
		width,
		height,
		right: width,
		bottom: height,
		x: 0,
		y: 0,
		toJSON: () => ({}),
	} as DOMRect;

	const transforms = parseTransformFunctions(transformString, tempRect);

	let tx = 0;
	let ty = 0;

	for (const tf of transforms) {
		switch (tf.type) {
			case 'translate':
				tx += tf.x;
				ty += tf.y;
				break;
			case 'matrix':
				tx += tf.translateX;
				ty += tf.translateY;
				break;
		}
	}

	// Invert the translation to get the layout position
	const layoutLeft = visualRect.left - tx;
	const layoutTop = visualRect.top - ty;

	return {
		left: layoutLeft,
		top: layoutTop,
		width,
		height,
		right: layoutLeft + width,
		bottom: layoutTop + height,
		x: layoutLeft,
		y: layoutTop,
		toJSON: () => ({}),
	} as DOMRect;
}

function getVisualRect(element: Element): DOMRect {
	try {
		const rect = element.getBoundingClientRect();
		return toDocumentRect(element, rect);
	} catch {
		return getLayoutRect(element);
	}
}

interface BorderRadii {
	topLeft: number;
	topRight: number;
	bottomRight: number;
	bottomLeft: number;
}

interface UniformBorder {
	width: number;
	color: string;
	style: string;
}

interface ImageResource {
	image: HTMLImageElement;
	width: number;
	height: number;
}

const imageCache = new Map<string, Promise<ImageResource | null>>();
const MAX_IMAGE_CACHE_ENTRIES = 128;

function getImage(url: string): Promise<ImageResource | null> {
	// Avoid caching blob: URLs produced for ephemeral in-memory SVG snapshots so
	// that we can safely revoke them without leaking references.
	if (url.startsWith('blob:')) {
		return new Promise<ImageResource | null>((resolve) => {
			const image = new Image();
			const finalize = (isValid: boolean) => {
				if (isValid && (image.naturalWidth > 0 || image.width > 0)) {
					resolve({
						image,
						width: image.naturalWidth || image.width,
						height: image.naturalHeight || image.height,
					});
				} else {
					resolve(null);
				}
			};

			image.src = url;

			image
				.decode()
				.then(() => finalize(true))
				.catch(() => finalize(false));
		});
	}

	const cached = imageCache.get(url);
	if (cached) return cached;

	const promise = new Promise<ImageResource | null>((resolve) => {
		const image = new Image();

		// For non-blob URLs, try to load cross-origin images in anonymous CORS
		// mode so that, when the server opts in with `Access-Control-Allow-Origin`,
		// drawing them will not immediately taint the canvas. This mirrors the
		// `<img crossorigin="anonymous">` behavior:
		// - Same-origin URLs continue to load as before.
		// - Cross-origin URLs become readable only when CORS headers are present.
		try {
			if (typeof window !== 'undefined' && typeof document !== 'undefined') {
				const resolved = new URL(url, document.baseURI || window.location.href);
				const documentOrigin = window.location.origin;

				if (
					resolved.origin &&
					resolved.origin !== 'null' &&
					documentOrigin &&
					resolved.origin !== documentOrigin
				) {
					image.crossOrigin = 'anonymous';
				}
			}
		} catch {
			// If URL parsing or environment checks fail, fall back to the default
			// behavior. In the worst case this reproduces the old behavior where a
			// cross-origin draw might taint the canvas.
		}

		const finalize = (isValid: boolean) => {
			if (isValid && (image.naturalWidth > 0 || image.width > 0)) {
				resolve({
					image,
					width: image.naturalWidth || image.width,
					height: image.naturalHeight || image.height,
				});
			} else {
				resolve(null);
			}
		};

		image.src = url;

		image
			.decode()
			.then(() => finalize(true))
			.catch(() => finalize(false));
	});

	imageCache.set(url, promise);
	if (imageCache.size > MAX_IMAGE_CACHE_ENTRIES) {
		const firstKey = imageCache.keys().next().value;
		if (firstKey && !firstKey.startsWith('blob:')) {
			imageCache.delete(firstKey);
		}
	}

	return promise;
}

async function prepareResources(root: HTMLElement): Promise<void> {
	const document = root.ownerDocument;

	// Wait for fonts to be ready, if the Font Loading API is available.
	const {fonts} = document;
	if (
		fonts &&
		typeof fonts.ready === 'object' &&
		typeof fonts.ready.then === 'function'
	) {
		try {
			await fonts.ready;
		} catch {
			// Ignore font loading errors; rendering will still proceed with fallback fonts.
		}
	}

	// Ensure <img> elements in the subtree are loaded or have failed before rendering.
	const images = Array.from(root.querySelectorAll('img'));
	if (!images.length) return;

	const waits = images.map((img) => waitForImage(img));
	await Promise.allSettled(waits);
}

function waitForImage(image: HTMLImageElement): Promise<void> {
	if (image.complete && image.naturalWidth > 0 && image.naturalHeight > 0) {
		return Promise.resolve();
	}

	return image.decode().then(
		() => undefined,
		() => undefined,
	);
}

/**
 * Calculate object-fit and object-position for replaced elements (img, video).
 * Returns source and destination rectangles for drawImage.
 */
function calculateObjectFit(
	objectFit: string,
	objectPosition: string,
	intrinsicWidth: number,
	intrinsicHeight: number,
	boxWidth: number,
	boxHeight: number,
): {
	sourceX: number;
	sourceY: number;
	sourceWidth: number;
	sourceHeight: number;
	destX: number;
	destY: number;
	destWidth: number;
	destHeight: number;
} {
	const fit = (objectFit || 'fill').trim().toLowerCase();
	const position = objectPosition || '50% 50%';

	let sourceX = 0;
	let sourceY = 0;
	let sourceWidth = intrinsicWidth;
	let sourceHeight = intrinsicHeight;
	let destX = 0;
	let destY = 0;
	let destWidth = boxWidth;
	let destHeight = boxHeight;

	// Calculate destination size based on object-fit
	if (fit === 'contain' || fit === 'cover' || fit === 'scale-down') {
		const intrinsicAspect = intrinsicWidth / intrinsicHeight;
		const boxAspect = boxWidth / boxHeight;

		let scale = 1;
		if (fit === 'contain') {
			scale =
				intrinsicAspect > boxAspect
					? boxWidth / intrinsicWidth
					: boxHeight / intrinsicHeight;
		} else if (fit === 'cover') {
			scale =
				intrinsicAspect > boxAspect
					? boxHeight / intrinsicHeight
					: boxWidth / intrinsicWidth;
		} else if (fit === 'scale-down') {
			// scale-down is like contain, but never scales up
			const containScale =
				intrinsicAspect > boxAspect
					? boxWidth / intrinsicWidth
					: boxHeight / intrinsicHeight;
			scale = Math.min(1, containScale);
		}

		destWidth = intrinsicWidth * scale;
		destHeight = intrinsicHeight * scale;
	} else if (fit === 'none') {
		destWidth = intrinsicWidth;
		destHeight = intrinsicHeight;
	}
	// 'fill' uses the full box dimensions (already set above)

	// Calculate object-position offset
	const [offsetX, offsetY] = parseObjectPosition(
		position,
		boxWidth,
		boxHeight,
		destWidth,
		destHeight,
	);

	destX = offsetX;
	destY = offsetY;

	// Calculate source rectangle for cover/none (cropping)
	if (fit === 'cover' || fit === 'none') {
		if (fit === 'cover') {
			const scale = Math.max(
				boxWidth / intrinsicWidth,
				boxHeight / intrinsicHeight,
			);
			const scaledWidth = intrinsicWidth * scale;
			const scaledHeight = intrinsicHeight * scale;

			// Center the scaled image, then crop
			const cropX = (scaledWidth - boxWidth) / 2;
			const cropY = (scaledHeight - boxHeight) / 2;

			sourceX = cropX / scale;
			sourceY = cropY / scale;
			sourceWidth = boxWidth / scale;
			sourceHeight = boxHeight / scale;
		} else {
			// 'none': if image is larger than box, crop from center
			if (intrinsicWidth > boxWidth) {
				sourceX = (intrinsicWidth - boxWidth) / 2;
				sourceWidth = boxWidth;
			}

			if (intrinsicHeight > boxHeight) {
				sourceY = (intrinsicHeight - boxHeight) / 2;
				sourceHeight = boxHeight;
			}
		}
	}

	return {
		sourceX,
		sourceY,
		sourceWidth,
		sourceHeight,
		destX,
		destY,
		destWidth,
		destHeight,
	};
}

/**
 * Parse object-position value (e.g., "center", "50% 20%", "10px top").
 * Returns [x, y] offsets relative to the box.
 */
function parseObjectPosition(
	position: string,
	boxWidth: number,
	boxHeight: number,
	objectWidth: number,
	objectHeight: number,
): [number, number] {
	const tokens = position.trim().split(/\s+/).filter(Boolean);
	const xToken = tokens[0] || '50%';
	const yToken = tokens[1] || '50%';

	const resolveX = (token: string): number => {
		const lower = token.toLowerCase();
		if (lower === 'left') return 0;
		if (lower === 'right') return boxWidth - objectWidth;
		if (lower === 'center') return (boxWidth - objectWidth) / 2;
		if (token.endsWith('%')) {
			const value = parseFloat(token);
			if (Number.isFinite(value)) {
				return (value / 100) * (boxWidth - objectWidth);
			}
		}

		const length = parseCssLength(token);
		return Number.isFinite(length) ? length : (boxWidth - objectWidth) / 2;
	};

	const resolveY = (token: string): number => {
		const lower = token.toLowerCase();
		if (lower === 'top') return 0;
		if (lower === 'bottom') return boxHeight - objectHeight;
		if (lower === 'center') return (boxHeight - objectHeight) / 2;
		if (token.endsWith('%')) {
			const value = parseFloat(token);
			if (Number.isFinite(value)) {
				return (value / 100) * (boxHeight - objectHeight);
			}
		}

		const length = parseCssLength(token);
		return Number.isFinite(length) ? length : (boxHeight - objectHeight) / 2;
	};

	return [resolveX(xToken), resolveY(yToken)];
}

async function renderImageElement(
	element: HTMLImageElement,
	context: CanvasRenderingContext2D,
	rect: DOMRect,
	style?: CSSStyleDeclaration,
): Promise<void> {
	if (rect.width === 0 || rect.height === 0) return;

	const {ownerDocument} = element;
	const defaultView = ownerDocument?.defaultView;
	const computedStyle =
		style || (defaultView?.getComputedStyle(element) ?? undefined);

	const objectFit = computedStyle?.objectFit || 'fill';
	const objectPosition = computedStyle?.objectPosition || '50% 50%';

	// Prefer using the live element when it has already loaded.
	if (
		element.complete &&
		element.naturalWidth > 0 &&
		element.naturalHeight > 0
	) {
		const intrinsicWidth = element.naturalWidth;
		const intrinsicHeight = element.naturalHeight;

		if (objectFit === 'fill') {
			// Simple case: just stretch to box
			context.drawImage(element, rect.left, rect.top, rect.width, rect.height);
		} else {
			const fit = calculateObjectFit(
				objectFit,
				objectPosition,
				intrinsicWidth,
				intrinsicHeight,
				rect.width,
				rect.height,
			);

			context.drawImage(
				element,
				fit.sourceX,
				fit.sourceY,
				fit.sourceWidth,
				fit.sourceHeight,
				rect.left + fit.destX,
				rect.top + fit.destY,
				fit.destWidth,
				fit.destHeight,
			);
		}

		return;
	}

	const src = element.currentSrc || element.src;
	if (!src) return;

	const resource = await getImage(src);
	if (!resource) return;

	const intrinsicWidth = resource.width;
	const intrinsicHeight = resource.height;

	if (objectFit === 'fill') {
		// Simple case: just stretch to box
		context.drawImage(
			resource.image,
			0,
			0,
			intrinsicWidth,
			intrinsicHeight,
			rect.left,
			rect.top,
			rect.width,
			rect.height,
		);
	} else {
		const fit = calculateObjectFit(
			objectFit,
			objectPosition,
			intrinsicWidth,
			intrinsicHeight,
			rect.width,
			rect.height,
		);

		context.drawImage(
			resource.image,
			fit.sourceX,
			fit.sourceY,
			fit.sourceWidth,
			fit.sourceHeight,
			rect.left + fit.destX,
			rect.top + fit.destY,
			fit.destWidth,
			fit.destHeight,
		);
	}
}

async function renderElementNode(
	element: Element,
	context: CanvasRenderingContext2D,
	style: CSSStyleDeclaration,
	rect: DOMRect,
	radii: BorderRadii,
	hasRadius: boolean,
	env: RenderEnvironment,
	backdropFilterCanvas: HTMLCanvasElement | null,
	backdropFilterRect: DOMRect | null,
): Promise<void> {
	// Special-case common form controls to approximate native rendering rather
	// than relying on their internal UA implementation details.
	if (
		element instanceof HTMLElement &&
		renderFormControl(element, context, style, rect, radii, hasRadius)
	) {
		return;
	}

	// Composite backdrop-filter if present (before background). The filtered
	// backdrop pixels are provided by the caller; we simply clip them to the
	// element's border-box so the effect is limited to the element's visual area.
	if (backdropFilterCanvas && backdropFilterRect) {
		context.save();
		// Use normal composition so the filtered backdrop replaces what's behind
		context.globalCompositeOperation = 'source-over';
		// Clip to element bounds
		context.beginPath();
		if (hasRadius) {
			pathRoundedRect(context, rect, radii);
		} else {
			context.rect(rect.left, rect.top, rect.width, rect.height);
		}

		context.clip();
		context.drawImage(
			backdropFilterCanvas,
			backdropFilterRect.left,
			backdropFilterRect.top,
			backdropFilterRect.width,
			backdropFilterRect.height,
		);
		context.restore();
	}

	const elementHasTextBackgroundClip = hasBackgroundClipText(style);

	// When background-clip:text is in effect, the element's background is meant
	// to be visible only through the glyph shapes. We approximate this by
	// suppressing the normal box background painting here and letting
	// renderTextNode() draw the clipped gradient into the text itself.
	if (!elementHasTextBackgroundClip) {
		// Background color
		const {backgroundColor} = style;
		if (
			backgroundColor &&
			backgroundColor !== 'transparent' &&
			backgroundColor !== 'rgba(0, 0, 0, 0)'
		) {
			context.save();
			context.fillStyle = backgroundColor;
			context.beginPath();
			if (hasRadius) {
				pathRoundedRect(context, rect, radii);
			} else {
				context.rect(rect.left, rect.top, rect.width, rect.height);
			}

			context.fill();
			context.restore();
		}

		await renderBackgroundImage(context, style, rect, radii, hasRadius, env);
	}

	// Inset shadows are painted above the element's background.
	renderBoxShadow(context, style, rect, radii);

	const uniformBorder = hasRadius ? getUniformBorder(style) : null;

	if (hasRadius && uniformBorder) {
		drawRoundedBorder(context, rect, radii, uniformBorder);
	} else {
		// Simple solid rectangular borders as a fallback
		// Pass radii so fallback doesn't draw square corners on rounded elements
		drawBorders(context, rect, style, radii, hasRadius);
	}

	await renderListMarker(element, context, style, rect, env);

	if (element instanceof HTMLImageElement) {
		await renderImageElement(element, context, rect, style);
	} else if (element instanceof HTMLCanvasElement) {
		// Inline <canvas>: draw its current bitmap.
		context.drawImage(element, rect.left, rect.top, rect.width, rect.height);
	} else if (element instanceof HTMLVideoElement) {
		// Inline <video>: best-effort current frame rendering when data is ready.
		try {
			if (element.readyState >= element.HAVE_CURRENT_DATA) {
				const objectFit = style.objectFit || 'fill';
				const objectPosition = style.objectPosition || '50% 50%';
				const videoWidth = element.videoWidth || element.width || 0;
				const videoHeight = element.videoHeight || element.height || 0;

				if (videoWidth > 0 && videoHeight > 0 && objectFit !== 'fill') {
					const fit = calculateObjectFit(
						objectFit,
						objectPosition,
						videoWidth,
						videoHeight,
						rect.width,
						rect.height,
					);

					context.drawImage(
						element,
						fit.sourceX,
						fit.sourceY,
						fit.sourceWidth,
						fit.sourceHeight,
						rect.left + fit.destX,
						rect.top + fit.destY,
						fit.destWidth,
						fit.destHeight,
					);
				} else {
					// Fallback to simple draw for fill or when dimensions unavailable
					context.drawImage(
						element,
						rect.left,
						rect.top,
						rect.width,
						rect.height,
					);
				}
			}
		} catch {
			// Cross-origin or other security restrictions can prevent drawing.
		}
	} else if (element instanceof SVGSVGElement) {
		await renderSvgElement(element, context, rect, env);
	}
}

async function renderListMarker(
	element: Element,
	context: CanvasRenderingContext2D,
	style: CSSStyleDeclaration,
	rect: DOMRect,
	env: RenderEnvironment,
): Promise<void> {
	const display = style.display || '';
	const isListItem =
		(element instanceof HTMLLIElement && display !== 'inline') ||
		display === 'list-item';

	if (!isListItem) {
		return;
	}

	const {ownerDocument} = element;
	const defaultView = ownerDocument?.defaultView;

	let markerStyle: CSSStyleDeclaration | null = null;
	if (
		element instanceof HTMLElement &&
		defaultView &&
		typeof defaultView.getComputedStyle === 'function'
	) {
		markerStyle = defaultView.getComputedStyle(element, '::marker');
	}

	const baseStyle = markerStyle || style;

	const rawType = baseStyle.listStyleType || style.listStyleType || '';
	const rawImage = baseStyle.listStyleImage || style.listStyleImage || '';
	const rawPosition = style.listStylePosition || '';

	const listStyleType = rawType.trim().toLowerCase();
	const listStyleImage = rawImage.trim();
	const listStylePosition =
		rawPosition.trim().toLowerCase() === 'inside' ? 'inside' : 'outside';

	const hasImage =
		Boolean(listStyleImage) &&
		listStyleImage !== 'none' &&
		listStyleImage !== 'initial';
	const hasType =
		Boolean(listStyleType) &&
		listStyleType !== 'none' &&
		listStyleType !== 'initial';

	let parsedMarkerContent: ParsedPseudoContent | null = null;
	if (markerStyle && element instanceof HTMLElement) {
		const rawContent = markerStyle.content;
		if (rawContent && rawContent !== 'none' && rawContent !== 'normal') {
			parsedMarkerContent = parsePseudoContent(rawContent, element, env);
		}
	}

	const hasCustomImage =
		parsedMarkerContent && Boolean(parsedMarkerContent.imageUrl);
	const hasCustomText =
		parsedMarkerContent &&
		parsedMarkerContent.text &&
		parsedMarkerContent.text.length > 0;

	if (!hasImage && !hasType && !hasCustomImage && !hasCustomText) {
		return;
	}

	const fontSize =
		parseCssLength(baseStyle.fontSize) ||
		parseCssLength(baseStyle.font) || // very rough fallback
		16;

	const lineHeight = parseLineHeight(style.lineHeight, fontSize);

	const borderLeft = parseCssLength(style.borderLeftWidth);
	const paddingLeft = parseCssLength(style.paddingLeft);

	const markerGap = Math.max(fontSize * 0.5, 4);

	// Base horizontal position for the marker, relative to the element box.
	let markerX: number;
	if (listStylePosition === 'inside') {
		markerX = rect.left + borderLeft + Math.max(0, paddingLeft * 0.25);
	} else {
		markerX = rect.left - markerGap;
	}

	// Vertically, align the marker to the first line of content. We approximate
	// this using the element's top + line-height, which visually matches common
	// list layouts for single-line items and stays reasonable for multi-line.
	const baselineY = rect.top + lineHeight;
	const markerCenterY = baselineY - fontSize * 0.5;

	context.save();

	// Prefer ::marker color when present; fall back to the element's own text
	// color; finally fall back to black.
	const markerColorSource =
		(markerStyle && markerStyle.color) || style.color || '#000000';
	const markerColor = resolveCanvasColor(
		markerColorSource,
		markerStyle || style,
		'#000000',
	);
	context.fillStyle = markerColor;
	context.strokeStyle = markerColor;

	const customImageUrl = parsedMarkerContent?.imageUrl || null;

	if (hasImage || hasCustomImage) {
		let url: string | null = customImageUrl;
		if (!url && hasImage) {
			const match = listStyleImage.match(/url\((['"]?)(.*?)\1\)/i);
			url = match ? match[2] : null;
		}

		if (url) {
			const resource = await getImage(url);
			if (resource) {
				const size = Math.max(4, Math.min(fontSize, rect.height));
				const drawWidth = size;
				const drawHeight = size;
				const drawX =
					listStylePosition === 'inside' ? markerX : markerX - drawWidth * 0.5;
				const drawY = markerCenterY - drawHeight * 0.5;

				context.drawImage(
					resource.image,
					0,
					0,
					resource.width,
					resource.height,
					drawX,
					drawY,
					drawWidth,
					drawHeight,
				);
				context.restore();
				return;
			}
		}
	}

	// If a custom ::marker text is provided, prefer that over list-style-type / automatic numbering.
	if (hasCustomText && parsedMarkerContent) {
		const markerText = parsedMarkerContent.text || '';
		if (!markerText) {
			context.restore();
			return;
		}

		context.font = buildCanvasFont(baseStyle);
		context.textBaseline = 'alphabetic';
		context.textAlign = listStylePosition === 'inside' ? 'left' : 'right';

		const textX = markerX;
		const textY = baselineY;

		context.fillText(markerText, textX, textY);
		context.restore();
		return;
	}

	if (!hasType) {
		context.restore();
		return;
	}

	const markerRadius = Math.max(1, fontSize * 0.18);
	const markerSquareSize = markerRadius * 2;

	if (
		listStyleType === 'disc' ||
		listStyleType === 'circle' ||
		listStyleType === 'square'
	) {
		const centerX =
			listStylePosition === 'inside' ? markerX + markerRadius : markerX;
		const centerY = markerCenterY;

		context.beginPath();
		if (listStyleType === 'square') {
			const x = centerX - markerSquareSize * 0.5;
			const y = centerY - markerSquareSize * 0.5;
			context.rect(x, y, markerSquareSize, markerSquareSize);
			context.fill();
		} else {
			context.arc(centerX, centerY, markerRadius, 0, Math.PI * 2);
			if (listStyleType === 'circle') {
				context.lineWidth = Math.max(1, markerRadius * 0.5);
				context.stroke();
			} else {
				context.fill();
			}
		}

		context.restore();
		return;
	}

	const index = getListItemIndex(element);
	if (index == null || index <= 0) {
		context.restore();
		return;
	}

	const markerText = formatListMarkerText(listStyleType, index);
	if (!markerText) {
		context.restore();
		return;
	}

	context.font = buildCanvasFont(baseStyle);
	context.textBaseline = 'alphabetic';

	if (listStylePosition === 'inside') {
		context.textAlign = 'left';
	} else {
		context.textAlign = 'right';
	}

	const textX = listStylePosition === 'inside' ? markerX : markerX;
	const textY = baselineY;

	context.fillText(markerText, textX, textY);

	context.restore();
}

function getListItemIndex(element: Element): number | null {
	const parent = element.parentElement;
	if (!parent) return null;

	const tagName = parent.tagName.toUpperCase();
	if (tagName !== 'OL' && tagName !== 'UL') {
		return null;
	}

	const children = Array.from(parent.children);
	if (!children.length) return null;

	const reversed = parent.hasAttribute('reversed');
	const startAttr = parent.getAttribute('start');
	let start = 1;

	if (startAttr != null) {
		const parsed = parseInt(startAttr, 10);
		if (Number.isFinite(parsed)) {
			start = parsed;
		}
	}

	let current = start;

	if (!reversed) {
		const childrenLength = children.length;
		for (let index = 0; index < childrenLength; index++) {
			const child = children[index];
			if (!(child instanceof HTMLLIElement)) continue;

			const valueAttr = child.getAttribute('value');
			if (valueAttr != null) {
				const parsed = parseInt(valueAttr, 10);
				if (Number.isFinite(parsed)) {
					current = parsed;
				}
			}

			if (child === element) {
				return current;
			}

			current++;
		}
	} else {
		// For reversed ordered lists, approximate by counting from the end.
		let count = 0;
		const childrenLength = children.length;
		for (let index = 0; index < childrenLength; index++) {
			if (children[index] instanceof HTMLLIElement) {
				count++;
			}
		}

		current = start || count;

		for (let index = 0; index < childrenLength; index++) {
			const child = children[index];
			if (!(child instanceof HTMLLIElement)) continue;

			const valueAttr = child.getAttribute('value');
			if (valueAttr != null) {
				const parsed = parseInt(valueAttr, 10);
				if (Number.isFinite(parsed)) {
					current = parsed;
				}
			}

			if (child === element) {
				return current;
			}

			current--;
		}
	}

	return null;
}

function formatListMarkerText(type: string, index: number): string | null {
	if (index <= 0 || !Number.isFinite(index)) {
		return null;
	}

	switch (type) {
		case 'decimal':
			return `${index}.`;
		case 'decimal-leading-zero':
			return `${String(index).padStart(2, '0')}.`;
		case 'upper-roman':
			return `${toRoman(index, true)}.`;
		case 'lower-roman':
			return `${toRoman(index, false)}.`;
		case 'upper-alpha':
		case 'upper-latin':
			return `${toAlpha(index, true)}.`;
		case 'lower-alpha':
		case 'lower-latin':
			return `${toAlpha(index, false)}.`;
		default:
			// Fallback to decimal when we don't recognize the type.
			return `${index}.`;
	}
}

function toAlpha(index: number, upper: boolean): string {
	const base = 26;
	let value = Math.max(1, Math.floor(index));
	let result = '';

	while (value > 0) {
		value--;
		const charCode = 'a'.charCodeAt(0) + (value % base);
		result = String.fromCharCode(charCode) + result;
		value = Math.floor(value / base);
	}

	return upper ? result.toUpperCase() : result;
}

function toRoman(index: number, upper: boolean): string {
	const value = Math.max(1, Math.min(3999, Math.floor(index)));
	const numerals: Array<{value: number; symbol: string}> = [
		{value: 1000, symbol: 'm'},
		{value: 900, symbol: 'cm'},
		{value: 500, symbol: 'd'},
		{value: 400, symbol: 'cd'},
		{value: 100, symbol: 'c'},
		{value: 90, symbol: 'xc'},
		{value: 50, symbol: 'l'},
		{value: 40, symbol: 'xl'},
		{value: 10, symbol: 'x'},
		{value: 9, symbol: 'ix'},
		{value: 5, symbol: 'v'},
		{value: 4, symbol: 'iv'},
		{value: 1, symbol: 'i'},
	];

	let remaining = value;
	let result = '';

	const numeralsLength = numerals.length;
	for (let index = 0; index < numeralsLength; index++) {
		const entry = numerals[index];
		while (remaining >= entry.value) {
			result += entry.symbol;
			remaining -= entry.value;
		}
	}

	return upper ? result.toUpperCase() : result;
}

async function renderSvgElement(
	element: SVGSVGElement,
	context: CanvasRenderingContext2D,
	rect: DOMRect,
	env: RenderEnvironment,
): Promise<void> {
	const scale = env.scale ?? 1;

	// Target dimensions in Device Pixels
	const targetWidth = Math.ceil(rect.width * scale);
	const targetHeight = Math.ceil(rect.height * scale);

	if (targetWidth <= 0 || targetHeight <= 0) return;

	// Clone and modify attributes to force high-res rasterization
	const clone = element.cloneNode(true) as SVGSVGElement;

	// Strip class/style that can encode layout positioning, but preserve
	// paint-related styling by inlining computed paint properties back onto the clone.
	//
	// This prevents internal offsets when the SVG is serialized and rasterized as an
	// image, while keeping colors/strokes/fills identical to the live DOM.
	const paintProps = [
		'color',
		'fill',
		'fill-opacity',
		'stroke',
		'stroke-opacity',
		'stroke-width',
		'stroke-linecap',
		'stroke-linejoin',
		'stroke-miterlimit',
		'stroke-dasharray',
		'stroke-dashoffset',
		'opacity',
		'vector-effect',
		'paint-order',
		'shape-rendering',
	] as const;

	const originalElements: Element[] = [
		element,
		...Array.from(element.querySelectorAll('*')),
	];
	const clonedElements: Element[] = [
		clone,
		...Array.from(clone.querySelectorAll('*')),
	];
	const count = Math.min(originalElements.length, clonedElements.length);

	for (let index = 0; index < count; index++) {
		const originalElement = originalElements[index];
		const clonedElement = clonedElements[index];

		// Strip potentially layout-affecting CSS hooks.
		clonedElement.removeAttribute('class');
		clonedElement.removeAttribute('style');

		const computed = window.getComputedStyle(originalElement);
		for (const prop of paintProps) {
			const value = computed.getPropertyValue(prop);
			if (value) {
				(clonedElement as HTMLElement | SVGElement).style.setProperty(
					prop,
					value,
				);
			}
		}
	}

	// 1. Set explicit width/height in device pixels
	clone.setAttribute('width', String(targetWidth));
	clone.setAttribute('height', String(targetHeight));
	clone.style.width = `${targetWidth}px`;
	clone.style.height = `${targetHeight}px`;

	// 2. Preserve the original viewBox (so internal coordinates stay correct). If
	// missing, fall back to the element's layout box.
	const cloneViewBox =
		element.getAttribute('viewBox') ?? clone.getAttribute('viewBox');
	if (cloneViewBox) {
		clone.setAttribute('viewBox', cloneViewBox);
	} else {
		clone.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
	}

	// Keep normal aspect ratio behavior to avoid stretching/clipping.
	clone.setAttribute('preserveAspectRatio', 'xMidYMid meet');

	// 3. Ensure namespace is present
	if (!clone.getAttribute('xmlns')) {
		clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
	}

	// 4. Set overflow to visible to prevent stroke clipping at viewBox boundaries.
	// SVG strokes can extend beyond the element bounds (especially with strokeWidth > 1)
	// and would otherwise be clipped by the default overflow: hidden behavior.
	clone.setAttribute('overflow', 'visible');

	// 5. Copy computed font styles to all <text> elements so they survive serialization.
	// When an SVG is serialized to a blob and rendered as an image, it loses access
	// to the page's CSS context, so fonts fall back to browser defaults.
	const originalTextElements = element.querySelectorAll('text');
	const clonedTextElements = clone.querySelectorAll('text');

	for (let index = 0; index < originalTextElements.length; index++) {
		const originalText = originalTextElements[index];
		const clonedText = clonedTextElements[index];
		if (!originalText || !clonedText) continue;

		const computed = window.getComputedStyle(originalText);

		// Apply font properties as inline attributes to ensure they're preserved
		if (!clonedText.hasAttribute('font-family')) {
			clonedText.setAttribute('font-family', computed.fontFamily);
		}

		if (!clonedText.hasAttribute('font-size')) {
			clonedText.setAttribute('font-size', computed.fontSize);
		}

		if (!clonedText.hasAttribute('font-weight')) {
			clonedText.setAttribute('font-weight', computed.fontWeight);
		}

		if (!clonedText.hasAttribute('font-style')) {
			clonedText.setAttribute('font-style', computed.fontStyle);
		}

		if (
			!clonedText.hasAttribute('letter-spacing') &&
			computed.letterSpacing !== 'normal'
		) {
			clonedText.setAttribute('letter-spacing', computed.letterSpacing);
		}
	}

	const serializer = new XMLSerializer();
	const svgText = serializer.serializeToString(clone);
	const blob = new Blob([svgText], {type: 'image/svg+xml'});
	const url = URL.createObjectURL(blob);

	try {
		const resource = await getImage(url);
		if (!resource) return;

		context.drawImage(
			resource.image,
			0,
			0,
			targetWidth,
			targetHeight,
			rect.left,
			rect.top,
			rect.width,
			rect.height,
		);
	} finally {
		URL.revokeObjectURL(url);
	}
}

function renderFormControl(
	element: HTMLElement,
	context: CanvasRenderingContext2D,
	style: CSSStyleDeclaration,
	rect: DOMRect,
	radii: BorderRadii,
	hasRadius: boolean,
): boolean {
	const isInput = element instanceof HTMLInputElement;
	const isTextArea = element instanceof HTMLTextAreaElement;
	const isSelect = element instanceof HTMLSelectElement;

	if (!isInput && !isTextArea && !isSelect) {
		return false;
	}

	const drawRoundedOrRect = (callback: () => void) => {
		context.beginPath();
		if (hasRadius) {
			pathRoundedRect(context, rect, radii);
		} else {
			context.rect(rect.left, rect.top, rect.width, rect.height);
		}

		callback();
	};

	const backgroundColor =
		style.backgroundColor && style.backgroundColor !== 'transparent'
			? style.backgroundColor
			: '#ffffff';
	const borderColor =
		style.borderTopColor && style.borderTopColor !== 'transparent'
			? style.borderTopColor
			: 'rgba(0,0,0,0.3)';
	const borderWidth = parseCssLength(style.borderTopWidth) || 0;
	const borderStyle = style.borderTopStyle;

	const font = buildCanvasFont(style);

	context.save();
	context.fillStyle = backgroundColor;
	drawRoundedOrRect(() => {
		context.fill();
	});

	// Only draw border if it's visible (has width and style is not 'none')
	if (borderWidth > 0 && borderStyle && borderStyle !== 'none') {
		context.lineWidth = borderWidth;
		context.strokeStyle = borderColor;
		drawRoundedOrRect(() => {
			context.stroke();
		});
	}

	context.font = font;

	const getTextFillToken = (decl: CSSStyleDeclaration): string | null => {
		const raw =
			(decl as any).webkitTextFillColor ||
			decl.getPropertyValue('-webkit-text-fill-color');
		const token = (raw ?? '').trim();
		if (!token) return null;
		if (
			token === 'currentcolor' ||
			token === 'inherit' ||
			token === 'initial'
		) {
			return null;
		}

		return token;
	};

	const elementTextColor = resolveCanvasColor(
		getTextFillToken(style) || style.color || '#000',
		style,
		'#000',
	);

	context.fillStyle = elementTextColor;

	const getPlaceholderPaint = (): {color: string; opacity: number} => {
		const {ownerDocument} = element;
		const view = ownerDocument?.defaultView;

		// Default placeholder color: a neutral gray that works on both light and dark backgrounds.
		// This is similar to browser defaults when no ::placeholder styles are specified.
		const defaultPlaceholderColor = 'rgba(128, 128, 128, 0.6)';

		if (!view) return {color: defaultPlaceholderColor, opacity: 1};

		const elementColor = elementTextColor;

		// Safari doesn't properly expose ::placeholder styles via getComputedStyle.
		// So we scan the actual stylesheets to find matching placeholder rules.
		const findPlaceholderColorFromStylesheets = (): string | null => {
			const placeholderPseudos = [
				'::placeholder',
				'::-webkit-input-placeholder',
				':-webkit-input-placeholder',
				'::-moz-placeholder',
				'::-ms-input-placeholder',
				':-ms-input-placeholder',
			];

			let foundColor: string | null = null;
			let foundSpecificity = -1;

			try {
				const sheets = ownerDocument.styleSheets;
				for (let index = 0; index < sheets.length; index++) {
					const sheet = sheets[index];
					let rules: CSSRuleList;
					try {
						rules = sheet.cssRules || sheet.rules;
					} catch {
						// Cross-origin stylesheets throw SecurityError
						continue;
					}

					if (!rules) continue;

					for (let j = 0; j < rules.length; j++) {
						const rule = rules[j];
						if (!(rule instanceof CSSStyleRule)) continue;

						const {selectorText} = rule;
						if (!selectorText) continue;

						// Check if this rule targets a placeholder pseudo-element
						let matchesPseudo = false;
						for (const pseudo of placeholderPseudos) {
							if (selectorText.includes(pseudo)) {
								matchesPseudo = true;
								break;
							}
						}

						if (!matchesPseudo) continue;

						// Extract the base selector (before the pseudo-element)
						let baseSelector = selectorText;
						for (const pseudo of placeholderPseudos) {
							baseSelector = baseSelector.replace(pseudo, '');
						}

						baseSelector = baseSelector.trim();

						// Check if element matches the base selector
						let matches = false;
						if (!baseSelector || baseSelector === '') {
							// Universal placeholder rule (just "::placeholder")
							matches = true;
						} else {
							try {
								matches = element.matches(baseSelector);
							} catch {
								// Invalid selector
								continue;
							}
						}

						if (!matches) continue;

						// Get color from this rule
						const ruleStyle = rule.style;
						const color =
							ruleStyle.getPropertyValue('-webkit-text-fill-color') ||
							ruleStyle.getPropertyValue('color');
						const opacity = ruleStyle.getPropertyValue('opacity');

						if (color && color !== 'inherit' && color !== 'initial') {
							// Simple specificity: longer selectors are more specific
							const specificity = selectorText.length;
							if (specificity > foundSpecificity) {
								let resolvedColor = resolveCanvasColor(
									color,
									style,
									elementColor,
								);

								// Apply opacity if present
								if (opacity && opacity !== '1') {
									const opacityVal = parseFloat(opacity);
									if (Number.isFinite(opacityVal) && opacityVal < 1) {
										const parsed = parseCssColor(resolvedColor);
										if (parsed) {
											const combinedAlpha = clamp01(parsed.alpha * opacityVal);
											const [r, g, b] = parsed.values;
											resolvedColor =
												normalizeCssColor(
													`rgba(${r}, ${g}, ${b}, ${combinedAlpha})`,
												) ?? resolvedColor;
										}
									}
								}

								foundColor = resolvedColor;
								foundSpecificity = specificity;
							}
						}
					}
				}
			} catch {
				// Stylesheet access can fail in various edge cases
			}

			return foundColor;
		};

		// First, try getComputedStyle with various pseudo selectors.
		// This is fast and works correctly in Chrome/Firefox.
		const pseudoSelectors = [
			'::placeholder',
			'::-webkit-input-placeholder',
			':-webkit-input-placeholder',
			'::-webkit-textarea-placeholder',
			':-webkit-textarea-placeholder',
			'::-moz-placeholder',
			'::-ms-input-placeholder',
			':-ms-input-placeholder',
		];

		for (const selector of pseudoSelectors) {
			try {
				const pseudo = view.getComputedStyle(element, selector);
				if (!pseudo) continue;

				const pseudoFill = getTextFillToken(pseudo);
				const rawColor = (pseudoFill || pseudo.color || '').trim();
				const resolvedColor =
					rawColor && rawColor !== 'inherit' && rawColor !== 'initial'
						? resolveCanvasColor(rawColor, style, elementColor)
						: null;

				const opacityRaw = (pseudo.opacity ?? '').trim();
				const opacityParsed =
					opacityRaw && opacityRaw !== 'normal' ? parseFloat(opacityRaw) : 1;
				const opacity = Number.isFinite(opacityParsed) ? opacityParsed : 1;

				// Heuristic: if the pseudo resolves to the same paint as the element's
				// normal text (common Safari failure mode where it returns element styles
				// instead of pseudo styles), keep searching other vendor pseudos.
				if (resolvedColor && resolvedColor === elementColor && opacity === 1) {
					continue;
				}

				// Some browsers (notably Safari) may expose placeholder alpha in BOTH:
				// - the computed color itself (rgba(..., a))
				// - the computed opacity property
				// If we apply both, we double-multiply alpha and the placeholder becomes too faint.
				if (resolvedColor) {
					const parsed = parseCssColor(resolvedColor);
					if (parsed && parsed.alpha < 1 && opacity !== 1) {
						const combinedAlpha = clamp01(parsed.alpha * opacity);
						const [r, g, b] = parsed.values;
						const combinedColor = normalizeCssColor(
							`rgba(${r}, ${g}, ${b}, ${combinedAlpha})`,
						);
						return {color: combinedColor ?? resolvedColor, opacity: 1};
					}
				}

				if (resolvedColor && resolvedColor !== elementColor) {
					return {color: resolvedColor, opacity};
				}

				if (opacity !== 1) {
					return {color: elementColor, opacity};
				}
			} catch {
				// Ignore unsupported pseudo selectors
			}
		}

		// Fallback: Safari doesn't properly expose ::placeholder styles via
		// getComputedStyle, so scan the actual stylesheets to find matching rules.
		// This is more expensive, so we only do it when getComputedStyle fails.
		const stylesheetColor = findPlaceholderColorFromStylesheets();
		if (stylesheetColor) {
			return {color: stylesheetColor, opacity: 1};
		}

		// Final fallback: use a neutral gray placeholder color.
		return {color: defaultPlaceholderColor, opacity: 1};
	};

	const paddingLeft = parseCssLength(style.paddingLeft) || 4;
	const paddingRight = parseCssLength(style.paddingRight) || 4;
	const paddingTop = parseCssLength(style.paddingTop) || 2;
	const paddingBottom = parseCssLength(style.paddingBottom) || 2;

	const contentLeft = rect.left + paddingLeft;
	const contentRight = rect.right - paddingRight;
	const contentTop = rect.top + paddingTop;
	const contentBottom = rect.bottom - paddingBottom;
	const contentCenterY = (contentTop + contentBottom) / 2;

	const drawLabelCentered = (text: string) => {
		if (!text) return;
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		const textX = (contentLeft + contentRight) / 2;
		const textY = contentCenterY;
		context.fillText(text, textX, textY);
	};

	const drawLabelLeft = (text: string) => {
		if (!text) return;
		context.textAlign = 'left';
		context.textBaseline = 'middle';
		const textX = contentLeft;
		const textY = contentCenterY;
		context.fillText(text, textX, textY);
	};

	if (
		isInput &&
		['button', 'submit', 'reset'].includes((element as HTMLInputElement).type)
	) {
		const label = (element as HTMLInputElement).value || '';
		drawLabelCentered(label.trim());
		context.restore();
		return true;
	}

	if (isInput) {
		const input = element;
		const {type} = input;

		if (type === 'checkbox' || type === 'radio') {
			const size = Math.min(rect.width, rect.height);
			const boxSize = Math.min(size * 0.8, 16);
			const boxLeft = rect.left + (rect.width - boxSize) / 2;
			const boxTop = rect.top + (rect.height - boxSize) / 2;

			context.beginPath();
			if (type === 'radio') {
				context.arc(
					rect.left + rect.width / 2,
					rect.top + rect.height / 2,
					boxSize / 2,
					0,
					Math.PI * 2,
				);
			} else {
				context.rect(boxLeft, boxTop, boxSize, boxSize);
			}

			context.stroke();

			if (input.checked) {
				context.beginPath();
				if (type === 'radio') {
					context.arc(
						rect.left + rect.width / 2,
						rect.top + rect.height / 2,
						boxSize / 4,
						0,
						Math.PI * 2,
					);
					context.fill();
				} else {
					const checkPoint1X = boxLeft + boxSize * 0.2;
					const checkPoint1Y = boxTop + boxSize * 0.5;
					const checkPoint2X = boxLeft + boxSize * 0.45;
					const checkPoint2Y = boxTop + boxSize * 0.75;
					const checkPoint3X = boxLeft + boxSize * 0.8;
					const checkPoint3Y = boxTop + boxSize * 0.25;
					context.moveTo(checkPoint1X, checkPoint1Y);
					context.lineTo(checkPoint2X, checkPoint2Y);
					context.lineTo(checkPoint3X, checkPoint3Y);
					context.stroke();
				}
			}

			context.restore();
			return true;
		}

		// Text-like inputs: approximate as a single-line text field.
		if (
			type === 'text' ||
			type === 'search' ||
			type === 'email' ||
			type === 'url' ||
			type === 'tel' ||
			type === 'password'
		) {
			const isPlaceholder = !input.value && Boolean(input.placeholder);
			const text = input.value || input.placeholder || '';
			if (isPlaceholder) {
				const placeholder = getPlaceholderPaint();
				const prevFill = context.fillStyle;
				const prevAlpha = context.globalAlpha;
				context.fillStyle = placeholder.color;
				context.globalAlpha = prevAlpha * placeholder.opacity;
				drawLabelLeft(text);
				context.fillStyle = prevFill;
				context.globalAlpha = prevAlpha;
			} else {
				drawLabelLeft(text);
			}

			context.restore();
			return true;
		}

		// Range input: draw slider track and thumb
		if (type === 'range') {
			const min = parseFloat(input.min) || 0;
			const max = parseFloat(input.max) || 100;
			const value = parseFloat(input.value) || min;
			const range = max - min || 1;
			const percentage = (value - min) / range;

			// Draw track
			const trackHeight = 4;
			const trackY = contentCenterY - trackHeight / 2;
			context.fillStyle = borderColor;
			context.fillRect(
				contentLeft,
				trackY,
				contentRight - contentLeft,
				trackHeight,
			);

			// Draw filled portion
			const filledWidth = (contentRight - contentLeft) * percentage;
			context.fillStyle = style.color || '#0066cc';
			context.fillRect(contentLeft, trackY, filledWidth, trackHeight);

			// Draw thumb
			const thumbSize = 16;
			const thumbX = contentLeft + (contentRight - contentLeft) * percentage;
			const thumbY = contentCenterY;

			context.beginPath();
			context.arc(thumbX, thumbY, thumbSize / 2, 0, Math.PI * 2);
			context.fillStyle = '#fff';
			context.fill();
			context.strokeStyle = borderColor;
			context.lineWidth = 2;
			context.stroke();

			context.restore();
			return true;
		}

		// Number input: show value with up/down indicators
		if (type === 'number') {
			const isPlaceholder = !input.value && Boolean(input.placeholder);
			const text = input.value || input.placeholder || '';
			if (isPlaceholder) {
				const placeholder = getPlaceholderPaint();
				const prevFill = context.fillStyle;
				const prevAlpha = context.globalAlpha;
				context.fillStyle = placeholder.color;
				context.globalAlpha = prevAlpha * placeholder.opacity;
				drawLabelLeft(text);
				context.fillStyle = prevFill;
				context.globalAlpha = prevAlpha;
			} else {
				drawLabelLeft(text);
			}

			// Draw up/down arrows on the right
			const arrowSize = Math.min(rect.height / 6, 4);
			const arrowX = contentRight - arrowSize * 2;
			const arrowSpacing = arrowSize * 1.5;

			// Up arrow
			context.beginPath();
			context.moveTo(arrowX, contentCenterY - arrowSpacing / 2);
			context.lineTo(
				arrowX + arrowSize,
				contentCenterY - arrowSpacing / 2 - arrowSize,
			);
			context.lineTo(arrowX + arrowSize * 2, contentCenterY - arrowSpacing / 2);
			context.stroke();

			// Down arrow
			context.beginPath();
			context.moveTo(arrowX, contentCenterY + arrowSpacing / 2);
			context.lineTo(
				arrowX + arrowSize,
				contentCenterY + arrowSpacing / 2 + arrowSize,
			);
			context.lineTo(arrowX + arrowSize * 2, contentCenterY + arrowSpacing / 2);
			context.stroke();

			context.restore();
			return true;
		}

		// Date/time inputs: display formatted value
		if (
			type === 'date' ||
			type === 'time' ||
			type === 'datetime-local' ||
			type === 'month' ||
			type === 'week'
		) {
			const isPlaceholder = !input.value && Boolean(input.placeholder);
			const text = input.value || input.placeholder || '';
			if (isPlaceholder) {
				const placeholder = getPlaceholderPaint();
				const prevFill = context.fillStyle;
				const prevAlpha = context.globalAlpha;
				context.fillStyle = placeholder.color;
				context.globalAlpha = prevAlpha * placeholder.opacity;
				drawLabelLeft(text);
				context.fillStyle = prevFill;
				context.globalAlpha = prevAlpha;
			} else {
				drawLabelLeft(text);
			}

			context.restore();
			return true;
		}

		// Color input: draw color swatch
		if (type === 'color') {
			const value = input.value || '#000000';
			const swatchSize = Math.min(rect.height - paddingTop - paddingBottom, 20);
			const swatchX = contentLeft;
			const swatchY = contentCenterY - swatchSize / 2;

			// Draw color swatch
			context.fillStyle = value;
			context.fillRect(swatchX, swatchY, swatchSize, swatchSize);
			context.strokeStyle = borderColor;
			context.lineWidth = 1;
			context.strokeRect(swatchX, swatchY, swatchSize, swatchSize);

			// Draw value text next to swatch
			context.textAlign = 'left';
			context.textBaseline = 'middle';
			context.fillStyle = style.color || '#000';
			context.fillText(value, swatchX + swatchSize + 8, contentCenterY);

			context.restore();
			return true;
		}

		// File input: show "Choose File" or file name
		if (type === 'file') {
			const {files} = input;
			let label = 'Choose File';
			if (files && files.length > 0) {
				label = files[0].name || `${files.length} file(s)`;
			}

			drawLabelLeft(label);
			context.restore();
			return true;
		}
	}

	if (isTextArea) {
		const textarea = element;
		const isPlaceholder = !textarea.value && Boolean(textarea.placeholder);
		const text = textarea.value || textarea.placeholder || '';
		if (isPlaceholder) {
			const placeholder = getPlaceholderPaint();
			const prevFill = context.fillStyle;
			const prevAlpha = context.globalAlpha;
			if (placeholder.color) context.fillStyle = placeholder.color;
			context.globalAlpha = prevAlpha * (placeholder.opacity ?? 1);
			drawLabelLeft(text);
			context.fillStyle = prevFill;
			context.globalAlpha = prevAlpha;
		} else {
			drawLabelLeft(text);
		}

		context.restore();
		return true;
	}

	if (isSelect) {
		const select = element;
		const selectedOption =
			select.selectedIndex >= 0 ? select.options[select.selectedIndex] : null;
		const label = selectedOption?.text || '';

		// Text
		drawLabelLeft(label);

		// Simple arrow glyph on the right.
		const arrowSize = Math.min(rect.height / 3, 6);
		const centerX = contentRight - arrowSize;
		const centerY = contentCenterY;

		context.beginPath();
		context.moveTo(centerX - arrowSize, centerY - arrowSize / 2);
		context.lineTo(centerX, centerY + arrowSize / 2);
		context.lineTo(centerX + arrowSize, centerY - arrowSize / 2);
		context.closePath();
		context.fill();

		context.restore();
		return true;
	}

	context.restore();
	return false;
}

/**
 * Scales pixel values in filter strings (e.g. "blur(10px)") by the device
 * scale factor. This is necessary because we reset the context transform to
 * identity before applying filters, so 10px would otherwise equal 10 physical
 * pixels instead of 10 CSS pixels.
 */
/**
 * Scales pixel values in filter strings (e.g. "blur(10px)") by the device
 * scale factor. Handles px, rem, and em units.
 */
function scaleFilter(filter: string, scale: number): string {
	if (scale === 1 || !filter || filter === 'none') return filter;

	// Updated regex to optionally capture units (px, rem, em)
	return filter.replace(
		/blur\(\s*(-?\d*\.?\d+)(px|rem|em)?\s*\)/gi,
		(_match, value, unit) => {
			const numeric = parseFloat(value);
			if (!Number.isFinite(numeric)) return _match;

			let pixelValue = numeric;
			// Convert relative units to pixels (assuming standard 16px base)
			if (unit === 'rem' || unit === 'em') {
				pixelValue = numeric * 16;
			}

			return `blur(${pixelValue * scale}px)`;
		},
	);
}

function drawBorders(
	context: CanvasRenderingContext2D,
	rect: DOMRect,
	style: CSSStyleDeclaration,
	radii?: BorderRadii,
	hasRadius?: boolean,
): void {
	// Note, border rendering is intentionally simplified. Non-solid styles
	// (dashed, dotted, double, groove, ridge, inset, outset) and `border-image`
	// are approximated as solid rectangular edges using the computed border
	// colors and widths.
	const borders: Array<{
		width: number;
		color: string;
		borderStyle: string;
		draw: () => void;
	}> = [
		{
			width: parseCssLength(style.borderTopWidth),
			color: style.borderTopColor,
			borderStyle: style.borderTopStyle,
			draw: () => {
				context.fillRect(
					rect.left,
					rect.top,
					rect.width,
					parseCssLength(style.borderTopWidth),
				);
			},
		},
		{
			width: parseCssLength(style.borderRightWidth),
			color: style.borderRightColor,
			borderStyle: style.borderRightStyle,
			draw: () => {
				const width = parseCssLength(style.borderRightWidth);
				context.fillRect(rect.right - width, rect.top, width, rect.height);
			},
		},
		{
			width: parseCssLength(style.borderBottomWidth),
			color: style.borderBottomColor,
			borderStyle: style.borderBottomStyle,
			draw: () => {
				const height = parseCssLength(style.borderBottomWidth);
				context.fillRect(rect.left, rect.bottom - height, rect.width, height);
			},
		},
		{
			width: parseCssLength(style.borderLeftWidth),
			color: style.borderLeftColor,
			borderStyle: style.borderLeftStyle,
			draw: () => {
				const width = parseCssLength(style.borderLeftWidth);
				context.fillRect(rect.left, rect.top, width, rect.height);
			},
		},
	];

	context.save();

	// Safety clip: If we are in this fallback function but the element actually
	// has a border radius (e.g. because borders are non-uniform colors), we
	// must clip the square borders to the rounded shape so they don't stick out.
	if (hasRadius && radii) {
		context.beginPath();
		pathRoundedRect(context, rect, radii);
		context.clip();
	}

	const bordersLength = borders.length;
	for (let index = 0; index < bordersLength; index++) {
		const border = borders[index];
		const styleValue = (border.borderStyle || '').trim().toLowerCase();
		if (
			border.width <= 0 ||
			!styleValue ||
			styleValue === 'none' ||
			!border.color ||
			border.color === 'transparent' ||
			border.color === 'rgba(0, 0, 0, 0)'
		) {
			continue;
		}

		context.fillStyle = border.color;
		context.strokeStyle = border.color;

		if (styleValue === 'dashed' || styleValue === 'dotted') {
			const isDashed = styleValue === 'dashed';
			const dash = isDashed
				? border.width * BORDER_DECORATION_SIZE
				: border.width;
			const gap = isDashed
				? border.width * BORDER_DECORATION_SIZE
				: border.width;

			context.setLineDash([dash, gap]);
			context.lineDashOffset = 0;
			context.lineCap = 'butt';
			context.lineWidth = border.width;

			context.beginPath();
			switch (index) {
				case 0: {
					// top
					const y = rect.top + border.width / 2;
					context.moveTo(rect.left, y);
					context.lineTo(rect.right, y);
					break;
				}

				case 1: {
					// right
					const x = rect.right - border.width / 2;
					context.moveTo(x, rect.top);
					context.lineTo(x, rect.bottom);
					break;
				}

				case 2: {
					// bottom
					const y = rect.bottom - border.width / 2;
					context.moveTo(rect.left, y);
					context.lineTo(rect.right, y);
					break;
				}

				case 3: {
					// left
					const x = rect.left + border.width / 2;
					context.moveTo(x, rect.top);
					context.lineTo(x, rect.bottom);
					break;
				}
			}

			context.stroke();
		} else {
			context.setLineDash([]);
			border.draw();
		}
	}

	context.restore();
}

function getBorderRadii(
	style: CSSStyleDeclaration,
	rect: {width: number; height: number},
): BorderRadii {
	const maxX = rect.width / 2;
	const maxY = rect.height / 2;
	const topLeft = clampRadius(
		parseBorderRadius(style.borderTopLeftRadius, rect.width, rect.height),
		maxX,
		maxY,
	);
	const topRight = clampRadius(
		parseBorderRadius(style.borderTopRightRadius, rect.width, rect.height),
		maxX,
		maxY,
	);
	const bottomRight = clampRadius(
		parseBorderRadius(style.borderBottomRightRadius, rect.width, rect.height),
		maxX,
		maxY,
	);
	const bottomLeft = clampRadius(
		parseBorderRadius(style.borderBottomLeftRadius, rect.width, rect.height),
		maxX,
		maxY,
	);

	return {topLeft, topRight, bottomRight, bottomLeft};
}

/**
 * Parse a border-radius value, handling percentage values correctly.
 * CSS border-radius percentages are relative to the corresponding dimension
 * (width for horizontal, height for vertical). For single-value syntax,
 * we use the minimum of both to create a uniform radius.
 */
function parseBorderRadius(
	value: string | null | undefined,
	width: number,
	height: number,
): number {
	if (!value) return 0;
	const trimmed = value.trim();
	if (!trimmed) return 0;

	// Handle percentage values: "50%" should be 50% of the element size
	if (trimmed.endsWith('%')) {
		const percentage = parseFloat(trimmed);
		if (!Number.isFinite(percentage)) return 0;
		// For a uniform border-radius, use the smaller dimension to ensure
		// a proper circle on square elements and consistent curves on rectangles
		return (percentage / 100) * Math.min(width, height);
	}

	// For non-percentage values, parse as regular CSS length
	return parseCssLength(value);
}

function clampRadius(value: number, maxX: number, maxY: number): number {
	const max = Math.min(maxX, maxY);
	if (!Number.isFinite(value) || value <= 0) return 0;
	return Math.min(value, max);
}

function shrinkBorderRadiiForInnerBox(
	radii: BorderRadii,
	insetLeft: number,
	insetTop: number,
	insetRight: number,
	insetBottom: number,
): BorderRadii {
	return {
		topLeft: Math.max(0, radii.topLeft - Math.max(insetLeft, insetTop)),
		topRight: Math.max(0, radii.topRight - Math.max(insetRight, insetTop)),
		bottomRight: Math.max(
			0,
			radii.bottomRight - Math.max(insetRight, insetBottom),
		),
		bottomLeft: Math.max(
			0,
			radii.bottomLeft - Math.max(insetLeft, insetBottom),
		),
	};
}

interface CounterDefinition {
	name: string;
	value: number;
}

function parseCounterShorthand(
	raw: string,
	defaultValue: number,
): CounterDefinition[] {
	const result: CounterDefinition[] = [];
	if (!raw) return result;

	const trimmed = raw.trim();
	if (
		!trimmed ||
		trimmed === 'none' ||
		trimmed === 'initial' ||
		trimmed === 'inherit' ||
		trimmed === 'unset'
	) {
		return result;
	}

	const tokensRaw = trimmed.split(/\s+/);
	const tokens: string[] = [];
	const tokensRawLength = tokensRaw.length;
	for (let index = 0; index < tokensRawLength; index++) {
		const token = tokensRaw[index].trim();
		if (token) tokens.push(token);
	}

	const tokensLength = tokens.length;
	for (let index = 0; index < tokensLength; index++) {
		const name = tokens[index];
		if (!name) continue;

		let amount = defaultValue;
		const next = tokens[index + 1];
		if (next && /^-?\d+$/.test(next)) {
			const parsed = parseInt(next, 10);
			if (Number.isFinite(parsed)) {
				amount = parsed;
			}

			index++;
		}

		result.push({name, value: amount});
	}

	return result;
}

function computeCssCounters(
	root: HTMLElement,
): WeakMap<Element, Map<string, number>> {
	const {ownerDocument} = root;
	const defaultView = ownerDocument?.defaultView;

	const result = new WeakMap<Element, Map<string, number>>();
	if (
		!ownerDocument ||
		!defaultView ||
		typeof defaultView.getComputedStyle !== 'function'
	) {
		return result;
	}

	const visit = (element: Element, parentState: Map<string, number>): void => {
		const state = new Map<string, number>(parentState);

		let style: CSSStyleDeclaration | null = null;
		try {
			style = defaultView.getComputedStyle(element as Element);
		} catch {
			style = null;
		}

		if (style) {
			const resetRaw = style.counterReset || '';
			const resets = parseCounterShorthand(resetRaw, 0);
			const resetsLength = resets.length;
			for (let index = 0; index < resetsLength; index++) {
				const reset = resets[index];
				state.set(reset.name, reset.value);
			}

			const incrementRaw = style.counterIncrement || '';
			const increments = parseCounterShorthand(incrementRaw, 1);
			const incrementsLength = increments.length;
			for (let index = 0; index < incrementsLength; index++) {
				const increment = increments[index];
				const previous = state.get(increment.name) ?? 0;
				state.set(increment.name, previous + increment.value);
			}
		}

		result.set(element, state);

		const {children} = element;
		const childrenLength = children.length;
		for (let index = 0; index < childrenLength; index++) {
			const child = children[index];
			if (child instanceof Element) {
				visit(child, state);
			}
		}
	};

	visit(root, new Map<string, number>());

	return result;
}

function applyClipPath(
	context: CanvasRenderingContext2D,
	clipPath: string,
	rect: DOMRect,
): void {
	const value = clipPath.trim();
	if (!value || value === 'none') return;

	const match = value.match(/^([a-zA-Z]+)\((.*)\)$/);
	if (!match) return;

	const functionName = match[1].toLowerCase();
	const body = match[2].trim();

	switch (functionName) {
		case 'inset':
			clipInset(context, body, rect);
			break;
		case 'circle':
			clipCircle(context, body, rect);
			break;
		case 'ellipse':
			clipEllipse(context, body, rect);
			break;
		case 'polygon':
			clipPolygon(context, body, rect);
			break;
		case 'path':
			clipPathSvg(context, body, rect);
			break;
	}
}

/**
 * Parse and apply SVG path data for clip-path: path().
 *
 * We delegate full SVG path parsing (including arc commands such as "A")
 * to the browser's `Path2D` implementation, so we do not need a separate
 * helper like `drawSvgArc` here.
 */
function clipPathSvg(
	context: CanvasRenderingContext2D,
	body: string,
	rect: DOMRect,
): void {
	// Extract path data from quotes if present
	const pathMatch = body.match(/^(['"]?)([^'"]+)\1$/);
	const pathData = pathMatch ? pathMatch[2] : body.trim();

	if (!pathData) return;

	try {
		const basePath = new Path2D(pathData);
		// Transform from element-local coordinates (reference box) into document
		// coordinates. CSS clip-path: path() interprets path data in the element's
		// reference box coordinate system (border-box by default), so we only need
		// to translate to the element's top-left corner; no additional scaling is
		// applied here.
		const matrix = new DOMMatrix().translate(rect.left, rect.top);
		const transformed = new Path2D();
		transformed.addPath(basePath, matrix);
		context.clip(transformed);
	} catch {
		// Ignore parsing errors
		if (typeof console !== 'undefined' && console.warn) {
			console.warn(
				`[screenshot] Failed to parse clip-path path data: "${pathData}"`,
			);
		}
	}
}

function parseLengthOrPercent(token: string, size: number): number {
	const trimmed = token.trim();
	if (trimmed.endsWith('%')) {
		const value = parseFloat(trimmed);
		if (Number.isFinite(value)) {
			return (value / 100) * size;
		}

		return 0;
	}

	return parseCssLength(trimmed);
}

function clipInset(
	context: CanvasRenderingContext2D,
	body: string,
	rect: DOMRect,
): void {
	// inset(<top> [<right> [<bottom> [<left>]]])
	const rawTokens = body.split(/\s+/).filter(Boolean);
	if (!rawTokens.length) return;

	// Ignore the optional \"round <radius>\" portion, which controls corner radii
	// for the inset shape. We currently approximate inset() as a simple
	// rectangular clip and do not render the rounded corners themselves.
	const roundIndex = rawTokens.indexOf('round');
	const tokens =
		roundIndex === -1 ? rawTokens : rawTokens.slice(0, Math.max(0, roundIndex));

	if (!tokens.length) return;

	let top = 0;
	let right = 0;
	let bottom = 0;
	let left = 0;

	if (tokens.length === 1) {
		top = right = bottom = left = parseLengthOrPercent(tokens[0], rect.height);
	} else if (tokens.length === 2) {
		top = bottom = parseLengthOrPercent(tokens[0], rect.height);
		right = left = parseLengthOrPercent(tokens[1], rect.width);
	} else if (tokens.length === 3) {
		top = parseLengthOrPercent(tokens[0], rect.height);
		right = left = parseLengthOrPercent(tokens[1], rect.width);
		bottom = parseLengthOrPercent(tokens[2], rect.height);
	} else {
		top = parseLengthOrPercent(tokens[0], rect.height);
		right = parseLengthOrPercent(tokens[1], rect.width);
		bottom = parseLengthOrPercent(tokens[2], rect.height);
		left = parseLengthOrPercent(tokens[3], rect.width);
	}

	const insetX = rect.left + left;
	const insetY = rect.top + top;
	const width = Math.max(0, rect.width - left - right);
	const height = Math.max(0, rect.height - top - bottom);

	context.beginPath();
	context.rect(insetX, insetY, width, height);
	context.clip();
}

function parsePositionTokensForClip(tokens: string[]): [string, string] {
	// Reuse radial position keywords where possible, defaulting to 'center'.
	if (!tokens.length) {
		return ['center', 'center'];
	}

	if (tokens.length === 1) {
		const token = tokens[0];
		if (token === 'top' || token === 'bottom') {
			return ['center', token];
		}

		if (token === 'left' || token === 'right') {
			return [token, 'center'];
		}

		return [token, 'center'];
	}

	return [tokens[0], tokens[1]];
}

function clipCircle(
	context: CanvasRenderingContext2D,
	body: string,
	rect: DOMRect,
): void {
	// circle( <radius>? at <position>? )
	const parts = body.split(/\bat\b/).map((value) => value.trim());
	const radiusToken = parts[0] || '';
	const positionTokens = (parts[1] || '').split(/\s+/).filter(Boolean);

	const [posXToken, posYToken] = parsePositionTokensForClip(positionTokens);

	const centerX =
		rect.left + resolveClipPositionComponent(posXToken, rect.width);
	const centerY =
		rect.top + resolveClipPositionComponent(posYToken, rect.height);

	let radius: number;
	const radiusValueToken = radiusToken || 'closest-side';
	if (radiusValueToken === 'closest-side') {
		radius = Math.min(
			centerX - rect.left,
			rect.right - centerX,
			centerY - rect.top,
			rect.bottom - centerY,
		);
	} else if (radiusValueToken === 'farthest-side') {
		radius = Math.max(
			centerX - rect.left,
			rect.right - centerX,
			centerY - rect.top,
			rect.bottom - centerY,
		);
	} else {
		const base = Math.min(rect.width, rect.height);
		const length = parseLengthOrPercent(radiusValueToken, base);
		radius = Math.max(0, length);
	}

	context.beginPath();
	context.arc(centerX, centerY, radius, 0, Math.PI * 2);
	context.clip();
}

function clipEllipse(
	context: CanvasRenderingContext2D,
	body: string,
	rect: DOMRect,
): void {
	// ellipse( <rx> <ry>? at <position>? )
	const parts = body.split(/\bat\b/).map((value) => value.trim());
	const radiiTokens = parts[0].split(/\s+/).filter(Boolean);
	const positionTokens = (parts[1] || '').split(/\s+/).filter(Boolean);

	const [posXToken, posYToken] = parsePositionTokensForClip(positionTokens);

	const centerX =
		rect.left + resolveClipPositionComponent(posXToken, rect.width);
	const centerY =
		rect.top + resolveClipPositionComponent(posYToken, rect.height);

	const baseX = rect.width;
	const baseY = rect.height;

	const rx =
		radiiTokens[0] != null
			? parseLengthOrPercent(radiiTokens[0], baseX)
			: baseX / 2;
	const ry =
		radiiTokens[1] != null
			? parseLengthOrPercent(radiiTokens[1], baseY)
			: baseY / 2;

	context.beginPath();
	context.ellipse(
		centerX,
		centerY,
		Math.max(0, rx),
		Math.max(0, ry),
		0,
		0,
		Math.PI * 2,
	);
	context.clip();
}

function resolveClipPositionComponent(token: string, size: number): number {
	const lower = token.toLowerCase();
	if (lower === 'left' || lower === 'top') return 0;
	if (lower === 'right' || lower === 'bottom') return size;
	if (lower === 'center') return size / 2;
	if (lower.endsWith('%')) {
		const value = parseFloat(lower);
		if (Number.isFinite(value)) {
			return (value / 100) * size;
		}

		return size / 2;
	}

	const length = parseCssLength(lower);
	if (length === 0) return size / 2;
	return length;
}

function clipPolygon(
	context: CanvasRenderingContext2D,
	body: string,
	rect: DOMRect,
): void {
	const args = body.split(',').map((value) => value.trim());
	if (!args.length) return;

	const points: Array<{x: number; y: number}> = [];
	const argsLength = args.length;
	for (let index = 0; index < argsLength; index++) {
		const arg = args[index];
		const tokensRaw = arg.split(/\s+/);
		const tokens: string[] = [];
		for (let tokenIndex = 0; tokenIndex < tokensRaw.length; tokenIndex++) {
			const token = tokensRaw[tokenIndex].trim();
			if (token) tokens.push(token);
		}

		if (tokens.length < 2) continue;
		const pointX = rect.left + parseLengthOrPercent(tokens[0], rect.width);
		const pointY = rect.top + parseLengthOrPercent(tokens[1], rect.height);
		points.push({x: pointX, y: pointY});
	}

	if (points.length < 3) return;

	context.beginPath();
	context.moveTo(points[0].x, points[0].y);
	for (let index = 1; index < points.length; index++) {
		context.lineTo(points[index].x, points[index].y);
	}

	context.closePath();
	context.clip();
}

function pathRoundedRect(
	context: CanvasRenderingContext2D,
	rect: {left: number; top: number; width: number; height: number},
	radii: BorderRadii,
): void {
	const rectX = rect.left;
	const rectY = rect.top;
	const {width} = rect;
	const {height} = rect;

	const topLeft = Math.max(0, radii.topLeft);
	const topRight = Math.max(0, radii.topRight);
	const bottomRight = Math.max(0, radii.bottomRight);
	const bottomLeft = Math.max(0, radii.bottomLeft);

	const right = rectX + width;
	const bottom = rectY + height;

	// Start at the top edge, after the top-left corner.
	context.moveTo(rectX + topLeft, rectY);

	// Top edge + top-right corner.
	context.lineTo(right - topRight, rectY);
	if (topRight > 0) {
		context.arcTo(right, rectY, right, rectY + topRight, topRight);
	} else {
		context.lineTo(right, rectY);
	}

	// Right edge + bottom-right corner.
	context.lineTo(right, bottom - bottomRight);
	if (bottomRight > 0) {
		context.arcTo(right, bottom, right - bottomRight, bottom, bottomRight);
	} else {
		context.lineTo(right, bottom);
	}

	// Bottom edge + bottom-left corner.
	context.lineTo(rectX + bottomLeft, bottom);
	if (bottomLeft > 0) {
		context.arcTo(rectX, bottom, rectX, bottom - bottomLeft, bottomLeft);
	} else {
		context.lineTo(rectX, bottom);
	}

	// Left edge + top-left corner.
	context.lineTo(rectX, rectY + topLeft);
	if (topLeft > 0) {
		context.arcTo(rectX, rectY, rectX + topLeft, rectY, topLeft);
	} else {
		context.lineTo(rectX, rectY);
	}

	context.closePath();
}

function getUniformBorder(style: CSSStyleDeclaration): UniformBorder | null {
	const topWidth = parseCssLength(style.borderTopWidth);
	const rightWidth = parseCssLength(style.borderRightWidth);
	const bottomWidth = parseCssLength(style.borderBottomWidth);
	const leftWidth = parseCssLength(style.borderLeftWidth);

	// 1. Check if we have a visible border at all
	if (topWidth <= 0 && rightWidth <= 0 && bottomWidth <= 0 && leftWidth <= 0) {
		return null;
	}

	// 2. Loose Width Check: Allow differences up to 1px (handling sub-pixel logic)
	// If any side is drastically different, we must use the fallback.
	if (
		Math.abs(topWidth - rightWidth) > 1 ||
		Math.abs(topWidth - bottomWidth) > 1 ||
		Math.abs(topWidth - leftWidth) > 1
	) {
		return null;
	}

	// 3. Style Check: Must match exactly
	const topStyle = style.borderTopStyle;
	if (
		topStyle !== style.borderRightStyle ||
		topStyle !== style.borderBottomStyle ||
		topStyle !== style.borderLeftStyle ||
		topStyle === 'none' ||
		topStyle === 'hidden'
	) {
		return null;
	}

	// 4. Color Check: We ignore color value differences (e.g. rgba vs rgb)
	// and simply assume if the other props match, the author intended a uniform border.
	// We'll use the top color as the representative color.
	const topColor = resolveCanvasColor(
		style.borderTopColor,
		style,
		'transparent',
	);

	return {
		width: topWidth,
		color: topColor,
		style: topStyle,
	};
}

// Safari (but not Chrome/Edge which also include "Safari")
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const BORDER_DECORATION_SIZE = isSafari ? 3 : 1.5;

function drawRoundedBorder(
	context: CanvasRenderingContext2D,
	rect: DOMRect,
	radii: BorderRadii,
	border: UniformBorder,
): void {
	context.save();
	context.lineWidth = border.width;
	context.strokeStyle = border.color;
	if (border.style === 'dashed') {
		const dashLength = border.width * BORDER_DECORATION_SIZE;
		const gapLength = border.width * BORDER_DECORATION_SIZE;
		context.setLineDash([dashLength, gapLength]);
		context.lineDashOffset = 0;
		context.lineCap = 'butt';
	} else if (border.style === 'dotted') {
		const gap = Math.max(2, border.width * BORDER_DECORATION_SIZE);
		context.setLineDash([border.width, gap]);
	} else {
		context.setLineDash([]);
	}

	context.beginPath();

	const inset = border.width / 2;
	const innerRect = {
		left: rect.left + inset,
		top: rect.top + inset,
		width: rect.width - border.width,
		height: rect.height - border.width,
	};
	const innerRadii: BorderRadii = {
		topLeft: Math.max(0, radii.topLeft - inset),
		topRight: Math.max(0, radii.topRight - inset),
		bottomRight: Math.max(0, radii.bottomRight - inset),
		bottomLeft: Math.max(0, radii.bottomLeft - inset),
	};

	pathRoundedRect(context, innerRect, innerRadii);
	context.stroke();
	context.restore();
}

function drawOutline(
	context: CanvasRenderingContext2D,
	style: CSSStyleDeclaration,
	rect: DOMRect,
	radii: BorderRadii,
	hasRadius: boolean,
): void {
	const outlineStyleRaw = style.outlineStyle || 'none';
	const outlineStyle = outlineStyleRaw.trim().toLowerCase();

	// Skip browser default outline styles. 'auto' is used by browsers for
	// focus rings which we cannot accurately replicate in canvas.
	if (
		!outlineStyle ||
		outlineStyle === 'none' ||
		outlineStyle === 'hidden' ||
		outlineStyle === 'auto'
	) {
		return;
	}

	const outlineWidth = parseCssLength(style.outlineWidth);
	if (!Number.isFinite(outlineWidth) || outlineWidth <= 0) {
		return;
	}

	const outlineColorRaw = style.outlineColor || '';
	let outlineColor = outlineColorRaw.trim();
	if (!outlineColor || outlineColor === 'invert') {
		outlineColor = style.color || '#000000';
	}

	const color = resolveCanvasColor(outlineColor, style, '#000000');
	if (!color) {
		return;
	}

	const outlineOffset = parseCssLength(style.outlineOffset);
	const grow = outlineOffset + outlineWidth / 2;

	const left = rect.left - grow;
	const top = rect.top - grow;
	const width = rect.width + grow * 2;
	const height = rect.height + grow * 2;

	const outlineRect: DOMRect = {
		left,
		top,
		width,
		height,
		right: left + width,
		bottom: top + height,
		x: 0,
		y: 0,
		toJSON: () => ({}),
	} as DOMRect;

	let outlineRadii: BorderRadii = {
		topLeft: 0,
		topRight: 0,
		bottomRight: 0,
		bottomLeft: 0,
	};

	if (hasRadius) {
		outlineRadii = {
			topLeft: Math.max(0, radii.topLeft + grow),
			topRight: Math.max(0, radii.topRight + grow),
			bottomRight: Math.max(0, radii.bottomRight + grow),
			bottomLeft: Math.max(0, radii.bottomLeft + grow),
		};
	}

	context.save();
	context.lineWidth = outlineWidth;
	context.strokeStyle = color;
	context.beginPath();
	if (hasRadius) {
		pathRoundedRect(context, outlineRect, outlineRadii);
	} else {
		context.rect(
			outlineRect.left,
			outlineRect.top,
			outlineRect.width,
			outlineRect.height,
		);
	}

	context.stroke();
	context.restore();
}

function drawRoundedRect(
	context: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radii: BorderRadii,
): void {
	const rect = {
		left: x,
		top: y,
		width,
		height,
	};
	pathRoundedRect(context, rect, radii);
}

function drawOuterBoxShadows(
	context: CanvasRenderingContext2D,
	style: CSSStyleDeclaration,
	borderBoxRect: DOMRect,
	borderRadius: BorderRadii,
	scale: number,
	env: RenderEnvironment,
): void {
	const shadows = parseShadowList(
		style.boxShadow || 'none',
		style.color || '#000',
	);
	if (shadows.length === 0) return;

	// This factor makes canvas shadows visually match CSS box-shadow blur strength.
	const blurFactor = 2.1;

	const shadowsLength = shadows.length;
	for (let index = 0; index < shadowsLength; index++) {
		const shadow = shadows[index];
		if (shadow.inset) continue;

		const color = resolveCanvasColor(shadow.color, style, '#000000');
		if (!color) continue;

		// 1. Parse values in CSS pixels (do NOT multiply by scale yet)
		// We will let the canvas transform handle the scaling.
		const spread = shadow.spread ?? 0;
		const blur = shadow.blur ?? 0;
		const blurRadius = blur * blurFactor;
		const offsetX = shadow.offsetX ?? 0;
		const offsetY = shadow.offsetY ?? 0;

		// 2. Calculate geometry in CSS pixels
		const spreadLeft = borderBoxRect.left - spread;
		const spreadTop = borderBoxRect.top - spread;
		const spreadWidth = borderBoxRect.width + spread * 2;
		const spreadHeight = borderBoxRect.height + spread * 2;

		// Radii grow with spread
		const tl = Math.max(0, borderRadius.topLeft + spread);
		const tr = Math.max(0, borderRadius.topRight + spread);
		const br = Math.max(0, borderRadius.bottomRight + spread);
		const bl = Math.max(0, borderRadius.bottomLeft + spread);

		// 3. Define offscreen canvas bounds (CSS pixels)
		// Add padding to accommodate the Gaussian blur decay
		const padding = blurRadius * 3;
		const drawX = spreadLeft + offsetX - padding;
		const drawY = spreadTop + offsetY - padding;
		const drawWidth = spreadWidth + padding * 2;
		const drawHeight = spreadHeight + padding * 2;

		// 4. Create offscreen canvas at device resolution (Physical pixels)
		if (drawWidth <= 0 || drawHeight <= 0) continue;
		if (typeof document === 'undefined') return;

		const shadowCanvas = document.createElement('canvas');
		// Round up to ensure we don't clip sub-pixel edges
		shadowCanvas.width = Math.ceil(drawWidth * scale);
		shadowCanvas.height = Math.ceil(drawHeight * scale);

		const shadowCtx = shadowCanvas.getContext('2d', {
			colorSpace: env.colorSpace,
		});
		if (!shadowCtx) continue;

		// 5. Apply Scaling to the offscreen context
		// This allows us to draw using logical CSS units while getting hi-res output
		shadowCtx.scale(scale, scale);

		// Local drawing coordinates (relative to the offscreen canvas origin)
		const localX = padding;
		const localY = padding;

		// Drawing the shadow

		// A. Draw the "Casting Shape" (Element + Spread)
		// We use opaque black to generate the correct alpha map for the blur.
		shadowCtx.save();
		shadowCtx.shadowColor = color;
		shadowCtx.shadowBlur = blurRadius;
		// Note: We draw at (0,0) offset inside the shadow layer because we already
		// positioned the canvas itself to account for the shadow offset.
		shadowCtx.shadowOffsetX = 0;
		shadowCtx.shadowOffsetY = 0;
		shadowCtx.fillStyle = '#000000';

		shadowCtx.beginPath();
		drawRoundedRect(shadowCtx, localX, localY, spreadWidth, spreadHeight, {
			topLeft: tl,
			topRight: tr,
			bottomRight: br,
			bottomLeft: bl,
		});
		shadowCtx.fill();
		shadowCtx.restore();

		// B. Cut out the "Element Shape" (Border Box)
		// CSS spec requires the shadow to be clipped under the element itself
		// to prevent "double darkening" of semi-transparent backgrounds.
		shadowCtx.globalCompositeOperation = 'destination-out';
		shadowCtx.fillStyle = '#000000';
		shadowCtx.beginPath();

		// Calculate where the element sits relative to our local spread shape
		// (It is 'spread' distance inward from the spread shape)
		const elementLocalX = localX + spread;
		const elementLocalY = localY + spread;
		const elementW = spreadWidth - spread * 2;
		const elementH = spreadHeight - spread * 2;

		drawRoundedRect(
			shadowCtx,
			elementLocalX,
			elementLocalY,
			elementW,
			elementH,
			borderRadius,
		);
		shadowCtx.fill();

		// C. Colorize the result
		// Replace the opaque black casting shape with the actual shadow color.
		// 'source-in' keeps the alpha of what we drew but replaces the color.
		shadowCtx.globalCompositeOperation = 'source-in';
		shadowCtx.fillStyle = color;
		shadowCtx.fillRect(0, 0, drawWidth, drawHeight);

		// 6. Composite back to main canvas
		// We draw the offscreen image (which is sized in device pixels) into the
		// main context (which is scaled). By specifying the dimensions in CSS
		// pixels, the browser handles the mapping correctly.
		context.drawImage(shadowCanvas, drawX, drawY, drawWidth, drawHeight);
	}
}

async function renderBackgroundImage(
	context: CanvasRenderingContext2D,
	style: CSSStyleDeclaration,
	rect: DOMRect,
	radii: BorderRadii,
	hasRadius: boolean,
	env: RenderEnvironment,
): Promise<void> {
	const {backgroundImage} = style;
	if (!backgroundImage || backgroundImage === 'none') {
		return;
	}

	const imageLayers = splitLayers(backgroundImage);
	if (!imageLayers.length) return;

	const positionLayers = splitLayers(style.backgroundPosition || '');
	const sizeLayers = splitLayers(style.backgroundSize || '');
	const repeatLayers = splitLayers(style.backgroundRepeat || '');
	const originLayers = splitLayers(style.backgroundOrigin || '');
	const clipLayers = splitLayers(style.backgroundClip || '');
	const attachmentLayers = splitLayers(style.backgroundAttachment || '');

	const borderLeft = parseCssLength(style.borderLeftWidth);
	const borderTop = parseCssLength(style.borderTopWidth);
	const borderRight = parseCssLength(style.borderRightWidth);
	const borderBottom = parseCssLength(style.borderBottomWidth);

	const paddingLeft = parseCssLength(style.paddingLeft);
	const paddingTop = parseCssLength(style.paddingTop);
	const paddingRight = parseCssLength(style.paddingRight);
	const paddingBottom = parseCssLength(style.paddingBottom);

	const paddingBox: DOMRect = {
		left: rect.left + borderLeft,
		top: rect.top + borderTop,
		width: Math.max(0, rect.width - borderLeft - borderRight),
		height: Math.max(0, rect.height - borderTop - borderBottom),
		right: rect.left + rect.width - borderRight,
		bottom: rect.top + rect.height - borderBottom,
		x: 0,
		y: 0,
		toJSON: () => ({}),
	} as DOMRect;

	const contentBox: DOMRect = {
		left: paddingBox.left + paddingLeft,
		top: paddingBox.top + paddingTop,
		width: Math.max(0, paddingBox.width - paddingLeft - paddingRight),
		height: Math.max(0, paddingBox.height - paddingTop - paddingBottom),
		right: paddingBox.left + paddingBox.width - paddingRight,
		bottom: paddingBox.top + paddingBox.height - paddingBottom,
		x: 0,
		y: 0,
		toJSON: () => ({}),
	} as DOMRect;

	// Paint background image layers from last to first so that the first listed
	// layer ends up on top, matching the CSS background painting order.
	for (let index = imageLayers.length - 1; index >= 0; index--) {
		const layer = imageLayers[index].trim();
		if (!layer) continue;

		const positionValue =
			positionLayers[Math.min(index, positionLayers.length - 1)] || '0% 0%';
		const sizeValue =
			sizeLayers[Math.min(index, sizeLayers.length - 1)] || 'auto';
		const repeatValue =
			repeatLayers[Math.min(index, repeatLayers.length - 1)] || 'repeat';
		const originValue =
			originLayers[Math.min(index, originLayers.length - 1)] || 'padding-box';
		const clipValue =
			clipLayers[Math.min(index, clipLayers.length - 1)] || 'border-box';
		const attachmentValue =
			attachmentLayers[Math.min(index, attachmentLayers.length - 1)] ||
			'scroll';

		let boxForOrigin: DOMRect =
			originValue.indexOf('content-box') !== -1
				? contentBox
				: originValue.indexOf('border-box') !== -1
					? rect
					: paddingBox;

		const boxForClip =
			clipValue.indexOf('content-box') !== -1
				? contentBox
				: clipValue.indexOf('padding-box') !== -1
					? paddingBox
					: rect;

		// Basic support for `background-attachment: fixed` – treat the background
		// positioning area as the capture viewport instead of the element box. This
		// approximates the spec (which uses the visual viewport) but keeps the
		// gradient/image stable relative to the captured region when cropping.
		if (attachmentValue.indexOf('fixed') !== -1) {
			const {captureRect} = env;
			boxForOrigin = {
				left: captureRect.left,
				top: captureRect.top,
				width: captureRect.width,
				height: captureRect.height,
				right: captureRect.right,
				bottom: captureRect.bottom,
				x: 0,
				y: 0,
				toJSON: () => ({}),
			} as DOMRect;
		}

		const boxLeft = boxForOrigin.left;
		const boxTop = boxForOrigin.top;
		const boxWidth = boxForOrigin.width;
		const boxHeight = boxForOrigin.height;

		context.save();
		context.beginPath();
		let clipRadii = radii;
		if (boxForClip === paddingBox || boxForClip === contentBox) {
			const insetLeft =
				boxForClip === paddingBox ? borderLeft : borderLeft + paddingLeft;
			const insetTop =
				boxForClip === paddingBox ? borderTop : borderTop + paddingTop;
			const insetRight =
				boxForClip === paddingBox ? borderRight : borderRight + paddingRight;
			const insetBottom =
				boxForClip === paddingBox ? borderBottom : borderBottom + paddingBottom;
			clipRadii = shrinkBorderRadiiForInnerBox(
				radii,
				insetLeft,
				insetTop,
				insetRight,
				insetBottom,
			);
		}

		if (hasRadius) {
			pathRoundedRect(context, boxForClip, clipRadii);
		} else {
			context.rect(
				boxForClip.left,
				boxForClip.top,
				boxForClip.width,
				boxForClip.height,
			);
		}

		context.clip();

		// For gradients, apply background-size and background-position.
		// Gradients have an intrinsic size equal to their positioning area by default.
		// When background-size is specified, compute the actual draw dimensions.
		// When background-position is specified (e.g., via CSS animations), offset the gradient.
		const gradientIntrinsicWidth = boxWidth;
		const gradientIntrinsicHeight = boxHeight;

		const [gradientDrawWidth, gradientDrawHeight] = computeBackgroundSize(
			sizeValue,
			boxWidth,
			boxHeight,
			gradientIntrinsicWidth,
			gradientIntrinsicHeight,
		);

		const [gradientOffsetX, gradientOffsetY] = computeBackgroundPosition(
			positionValue,
			boxWidth,
			boxHeight,
			gradientDrawWidth,
			gradientDrawHeight,
		);

		// Create a gradient box that:
		// 1. Is sized according to background-size (may be larger than visible area)
		// 2. Is positioned according to background-position offset
		// The gradient will extend beyond the clip region, but clip() ensures only the
		// visible portion is rendered. This correctly shows the "slice" of the gradient
		// that should be visible at the current animation frame.
		const gradientBox: DOMRect = {
			left: boxLeft + gradientOffsetX,
			top: boxTop + gradientOffsetY,
			width: gradientDrawWidth,
			height: gradientDrawHeight,
			right: boxLeft + gradientOffsetX + gradientDrawWidth,
			bottom: boxTop + gradientOffsetY + gradientDrawHeight,
			x: boxLeft + gradientOffsetX,
			y: boxTop + gradientOffsetY,
			toJSON: () => ({}),
		} as DOMRect;

		const handledGradient = renderCssGradientLayer(
			context,
			layer,
			gradientBox,
			boxForClip,
			gradientDrawWidth,
			gradientDrawHeight,
			style,
			env,
		);

		if (!handledGradient) {
			const match = layer.match(/url\((['"]?)(.*?)\1\)/i);
			if (match) {
				const url = match[2];
				if (url) {
					const resource = await getImage(url);
					if (resource) {
						const imageWidth = resource.width;
						const imageHeight = resource.height;

						const [drawWidth, drawHeight] = computeBackgroundSize(
							sizeValue,
							boxWidth,
							boxHeight,
							imageWidth,
							imageHeight,
						);

						const [offsetX, offsetY] = computeBackgroundPosition(
							positionValue,
							boxWidth,
							boxHeight,
							drawWidth,
							drawHeight,
						);

						const repeat = repeatValue || 'no-repeat';

						const drawOnce = (drawX: number, drawY: number) => {
							context.drawImage(
								resource.image,
								0,
								0,
								imageWidth,
								imageHeight,
								drawX,
								drawY,
								drawWidth,
								drawHeight,
							);
						};

						if (repeat === 'no-repeat') {
							// Single image, no tiling.
							drawOnce(boxLeft + offsetX, boxTop + offsetY);
						} else if (repeat === 'repeat-x') {
							// Tile horizontally across the box width, one row along Y.
							const startX = boxLeft + offsetX;
							const endX = boxLeft + boxWidth;
							const marginX = drawWidth;

							for (
								let tileX = startX - marginX;
								tileX < endX + marginX;
								tileX += drawWidth
							) {
								drawOnce(tileX, boxTop + offsetY);
							}
						} else if (repeat === 'repeat-y') {
							// Tile vertically across the box height, one column along X.
							const startY = boxTop + offsetY;
							const endY = boxTop + boxHeight;
							const marginY = drawHeight;

							for (
								let tileY = startY - marginY;
								tileY < endY + marginY;
								tileY += drawHeight
							) {
								drawOnce(boxLeft + offsetX, tileY);
							}
						} else {
							// 'repeat' – tile across both width and height.
							const startX = boxLeft + offsetX;
							const endX = boxLeft + boxWidth;
							const startY = boxTop + offsetY;
							const endY = boxTop + boxHeight;
							const marginX = drawWidth;
							const marginY = drawHeight;

							for (
								let tileX = startX - marginX;
								tileX < endX + marginX;
								tileX += drawWidth
							) {
								for (
									let tileY = startY - marginY;
									tileY < endY + marginY;
									tileY += drawHeight
								) {
									drawOnce(tileX, tileY);
								}
							}
						}
					}
				}
			}
		}

		context.restore();
	}
}

function readMaskProperty(
	style: CSSStyleDeclaration,
	standardProperty: string,
	webkitProperty?: string,
): string {
	const anyStyle = style as any;
	const camel = standardProperty.replace(/-([a-z])/g, (_, character: string) =>
		character.toUpperCase(),
	);

	let value: string | null =
		(typeof anyStyle[camel] === 'string' && anyStyle[camel]) ||
		style.getPropertyValue(standardProperty);

	if ((!value || !value.trim()) && webkitProperty) {
		const webkitCamel = webkitProperty
			.replace(/^-webkit-/, '')
			.replace(/-([a-z])/g, (_, character: string) => character.toUpperCase());
		value =
			(typeof anyStyle[webkitCamel] === 'string' && anyStyle[webkitCamel]) ||
			style.getPropertyValue(webkitProperty);
	}

	return (value || '').trim();
}

function elementHasMask(style: CSSStyleDeclaration): boolean {
	const maskImage = readMaskProperty(style, 'mask-image', '-webkit-mask-image');
	if (!maskImage || maskImage === 'none') {
		return false;
	}

	return true;
}

async function applyMaskToCanvas(
	context: CanvasRenderingContext2D,
	style: CSSStyleDeclaration,
	rect: DOMRect,
	radii: BorderRadii,
	hasRadius: boolean,
	env: RenderEnvironment,
): Promise<void> {
	const {canvas} = context;
	if (!canvas || typeof document === 'undefined') return;

	const {width} = canvas;
	const {height} = canvas;
	if (!width || !height) return;

	const maskImageValue = readMaskProperty(
		style,
		'mask-image',
		'-webkit-mask-image',
	);
	if (!maskImageValue || maskImageValue === 'none') {
		return;
	}

	const maskCanvas = document.createElement('canvas');
	maskCanvas.width = width;
	maskCanvas.height = height;
	const maskContext = maskCanvas.getContext('2d', {
		colorSpace: env.colorSpace,
	});
	if (!maskContext) return;

	// Render mask layers (images, gradients) into the mask canvas using the same
	// box geometry as the element's background. The resulting bitmap is then
	// interpreted as an alpha mask for the grouped element pixels.
	//
	// To keep the mask geometry aligned with the already-rendered content (which
	// is drawn in DOM coordinates and then mapped into canvas pixels via the
	// current transform), mirror the transform from the target context so that
	// both buffers share the same DOM→canvas mapping.
	const transform = context.getTransform();
	maskContext.setTransform(
		transform.a,
		transform.b,
		transform.c,
		transform.d,
		transform.e,
		transform.f,
	);

	await renderMaskImageLayers(maskContext, style, rect, radii, hasRadius, env);

	const imageData = context.getImageData(0, 0, width, height);
	const maskData = maskContext.getImageData(0, 0, width, height);
	const {data} = imageData;
	const mask = maskData.data;

	const maskModeRaw = readMaskProperty(style, 'mask-mode', '-webkit-mask-mode');
	const firstMaskMode = maskModeRaw.split(',')[0]?.trim().toLowerCase() || '';
	const useLuminance = firstMaskMode === 'luminance';

	const totalLength = data.length;
	for (let index = 0; index < totalLength; index += 4) {
		const srcAlphaByte = data[index + 3];
		if (srcAlphaByte === 0) {
			continue;
		}

		const maskRed = mask[index];
		const maskGreen = mask[index + 1];
		const maskBlue = mask[index + 2];
		const maskAlphaByte = mask[index + 3];

		let maskAlpha = maskAlphaByte / 255;
		if (useLuminance) {
			const luminance =
				0.2126 * maskRed + 0.7152 * maskGreen + 0.0722 * maskBlue;
			maskAlpha = luminance / 255;
		}

		if (maskAlpha <= 0) {
			data[index + 3] = 0;
			continue;
		}

		const srcAlpha = srcAlphaByte / 255;
		const newAlpha = srcAlpha * maskAlpha;
		if (newAlpha <= 0) {
			data[index + 3] = 0;
			continue;
		}

		// Approximate premultiplied alpha behavior by scaling RGB channels when the
		// effective alpha decreases. This keeps halo artifacts minimal while
		// remaining cheap to compute.
		const alphaScale = newAlpha / srcAlpha;
		data[index] = Math.round(data[index] * alphaScale);
		data[index + 1] = Math.round(data[index + 1] * alphaScale);
		data[index + 2] = Math.round(data[index + 2] * alphaScale);
		data[index + 3] = Math.round(newAlpha * 255);
	}

	context.putImageData(imageData, 0, 0);
}

async function renderMaskImageLayers(
	context: CanvasRenderingContext2D,
	style: CSSStyleDeclaration,
	rect: DOMRect,
	radii: BorderRadii,
	hasRadius: boolean,
	env: RenderEnvironment,
): Promise<void> {
	const maskImage = readMaskProperty(style, 'mask-image', '-webkit-mask-image');
	if (!maskImage || maskImage === 'none') {
		return;
	}

	const imageLayers = splitLayers(maskImage);
	if (!imageLayers.length) return;

	const positionLayers = splitLayers(
		readMaskProperty(style, 'mask-position', '-webkit-mask-position'),
	);
	const sizeLayers = splitLayers(
		readMaskProperty(style, 'mask-size', '-webkit-mask-size'),
	);
	const repeatLayers = splitLayers(
		readMaskProperty(style, 'mask-repeat', '-webkit-mask-repeat'),
	);
	const originLayers = splitLayers(
		readMaskProperty(style, 'mask-origin', '-webkit-mask-origin'),
	);
	const clipLayers = splitLayers(
		readMaskProperty(style, 'mask-clip', '-webkit-mask-clip'),
	);

	const borderLeft = parseCssLength(style.borderLeftWidth);
	const borderTop = parseCssLength(style.borderTopWidth);
	const borderRight = parseCssLength(style.borderRightWidth);
	const borderBottom = parseCssLength(style.borderBottomWidth);

	const paddingLeft = parseCssLength(style.paddingLeft);
	const paddingTop = parseCssLength(style.paddingTop);
	const paddingRight = parseCssLength(style.paddingRight);
	const paddingBottom = parseCssLength(style.paddingBottom);

	const paddingBox: DOMRect = {
		left: rect.left + borderLeft,
		top: rect.top + borderTop,
		width: Math.max(0, rect.width - borderLeft - borderRight),
		height: Math.max(0, rect.height - borderTop - borderBottom),
		right: rect.left + rect.width - borderRight,
		bottom: rect.top + rect.height - borderBottom,
		x: 0,
		y: 0,
		toJSON: () => ({}),
	} as DOMRect;

	const contentBox: DOMRect = {
		left: paddingBox.left + paddingLeft,
		top: paddingBox.top + paddingTop,
		width: Math.max(0, paddingBox.width - paddingLeft - paddingRight),
		height: Math.max(0, paddingBox.height - paddingTop - paddingBottom),
		right: paddingBox.left + paddingBox.width - paddingRight,
		bottom: paddingBox.top + paddingBox.height - paddingBottom,
		x: 0,
		y: 0,
		toJSON: () => ({}),
	} as DOMRect;

	// Paint mask image layers from last to first so that the first listed layer
	// ends up on top, mirroring the background painting order.
	for (let index = imageLayers.length - 1; index >= 0; index--) {
		const layer = imageLayers[index].trim();
		if (!layer || layer === 'none') continue;

		const positionValue =
			positionLayers[Math.min(index, positionLayers.length - 1)] || '50% 50%';
		const sizeValue =
			sizeLayers[Math.min(index, sizeLayers.length - 1)] || 'auto';
		const repeatValue =
			repeatLayers[Math.min(index, repeatLayers.length - 1)] || 'repeat';
		const originValue =
			originLayers[Math.min(index, originLayers.length - 1)] || 'border-box';
		const clipValue =
			clipLayers[Math.min(index, clipLayers.length - 1)] || 'border-box';

		const boxForOrigin: DOMRect =
			originValue.indexOf('content-box') !== -1
				? contentBox
				: originValue.indexOf('border-box') !== -1
					? rect
					: paddingBox;

		const boxForClip =
			clipValue.indexOf('content-box') !== -1
				? contentBox
				: clipValue.indexOf('padding-box') !== -1
					? paddingBox
					: rect;

		const boxLeft = boxForOrigin.left;
		const boxTop = boxForOrigin.top;
		const boxWidth = boxForOrigin.width;
		const boxHeight = boxForOrigin.height;

		context.save();
		context.beginPath();
		let clipRadii = radii;
		if (boxForClip === paddingBox || boxForClip === contentBox) {
			const insetLeft =
				boxForClip === paddingBox ? borderLeft : borderLeft + paddingLeft;
			const insetTop =
				boxForClip === paddingBox ? borderTop : borderTop + paddingTop;
			const insetRight =
				boxForClip === paddingBox ? borderRight : borderRight + paddingRight;
			const insetBottom =
				boxForClip === paddingBox ? borderBottom : borderBottom + paddingBottom;
			clipRadii = shrinkBorderRadiiForInnerBox(
				radii,
				insetLeft,
				insetTop,
				insetRight,
				insetBottom,
			);
		}

		if (hasRadius) {
			pathRoundedRect(context, boxForClip, clipRadii);
		} else {
			context.rect(
				boxForClip.left,
				boxForClip.top,
				boxForClip.width,
				boxForClip.height,
			);
		}

		context.clip();

		// For gradients, apply mask-size and mask-position.
		// Gradients have an intrinsic size equal to their positioning area by default.
		const maskGradientIntrinsicWidth = boxWidth;
		const maskGradientIntrinsicHeight = boxHeight;

		const [maskGradientDrawWidth, maskGradientDrawHeight] =
			computeBackgroundSize(
				sizeValue,
				boxWidth,
				boxHeight,
				maskGradientIntrinsicWidth,
				maskGradientIntrinsicHeight,
			);

		const [maskGradientOffsetX, maskGradientOffsetY] =
			computeBackgroundPosition(
				positionValue,
				boxWidth,
				boxHeight,
				maskGradientDrawWidth,
				maskGradientDrawHeight,
			);

		// Create a box for the gradient at its positioned/scaled size.
		// The gradient pattern is calculated based on this box, but fillRect
		// uses boxForClip to ensure the visible area is covered.
		const maskGradientBox: DOMRect = {
			left: boxLeft + maskGradientOffsetX,
			top: boxTop + maskGradientOffsetY,
			width: maskGradientDrawWidth,
			height: maskGradientDrawHeight,
			right: boxLeft + maskGradientOffsetX + maskGradientDrawWidth,
			bottom: boxTop + maskGradientOffsetY + maskGradientDrawHeight,
			x: boxLeft + maskGradientOffsetX,
			y: boxTop + maskGradientOffsetY,
			toJSON: () => ({}),
		} as DOMRect;

		const handledGradient = renderCssGradientLayer(
			context,
			layer,
			maskGradientBox,
			boxForClip,
			maskGradientDrawWidth,
			maskGradientDrawHeight,
			style,
			env,
		);

		if (!handledGradient) {
			const match = layer.match(/url\((['"]?)(.*?)\1\)/i);
			if (match) {
				const url = match[2];
				if (url) {
					const resource = await getImage(url);
					if (resource) {
						const imageWidth = resource.width;
						const imageHeight = resource.height;

						const [drawWidth, drawHeight] = computeBackgroundSize(
							sizeValue,
							boxWidth,
							boxHeight,
							imageWidth,
							imageHeight,
						);

						const [offsetX, offsetY] = computeBackgroundPosition(
							positionValue,
							boxWidth,
							boxHeight,
							drawWidth,
							drawHeight,
						);

						const repeat = repeatValue || 'no-repeat';

						const drawOnce = (drawX: number, drawY: number) => {
							context.drawImage(
								resource.image,
								0,
								0,
								imageWidth,
								imageHeight,
								drawX,
								drawY,
								drawWidth,
								drawHeight,
							);
						};

						if (repeat === 'no-repeat') {
							drawOnce(boxLeft + offsetX, boxTop + offsetY);
						} else if (repeat === 'repeat-x') {
							const startX = boxLeft + offsetX;
							const endX = boxLeft + boxWidth;
							const marginX = drawWidth;

							for (
								let tileX = startX - marginX;
								tileX < endX + marginX;
								tileX += drawWidth
							) {
								drawOnce(tileX, boxTop + offsetY);
							}
						} else if (repeat === 'repeat-y') {
							const startY = boxTop + offsetY;
							const endY = boxTop + boxHeight;
							const marginY = drawHeight;

							for (
								let tileY = startY - marginY;
								tileY < endY + marginY;
								tileY += drawHeight
							) {
								drawOnce(boxLeft + offsetX, tileY);
							}
						} else {
							const startX = boxLeft + offsetX;
							const endX = boxLeft + boxWidth;
							const startY = boxTop + offsetY;
							const endY = boxTop + boxHeight;
							const marginX = drawWidth;
							const marginY = drawHeight;

							for (
								let tileX = startX - marginX;
								tileX < endX + marginX;
								tileX += drawWidth
							) {
								for (
									let tileY = startY - marginY;
									tileY < endY + marginY;
									tileY += drawHeight
								) {
									drawOnce(tileX, tileY);
								}
							}
						}
					}
				}
			}
		}

		context.restore();
	}
}

interface GradientLength {
	unit: string;
	value: string;
}

interface GradientColorStop {
	color: string;
	offset?: GradientLength;
	hint?: GradientLength;
}

interface LinearGradientOrientationDirectional {
	type: 'directional';
	value: string;
}

interface LinearGradientOrientationAngular {
	type: 'angular';
	value: GradientLength;
}

type LinearGradientOrientation =
	| LinearGradientOrientationDirectional
	| LinearGradientOrientationAngular;

interface LinearGradientParseResult {
	orientation: LinearGradientOrientation;
	repeating: boolean;
	stops: GradientColorStop[];
}

interface RadialGradientPositionValue {
	type: 'keyword' | 'length';
	value: string | GradientLength;
}

interface RadialGradientParseResult {
	shape: 'circle' | 'ellipse';
	repeating: boolean;
	size: Array<{type: 'keyword' | 'length'; value: string | GradientLength}>;
	position: {
		x: RadialGradientPositionValue;
		y: RadialGradientPositionValue;
	};
	stops: GradientColorStop[];
}

interface ConicGradientParseResult {
	repeating: boolean;
	angle: GradientLength;
	position: {
		x: RadialGradientPositionValue;
		y: RadialGradientPositionValue;
	};
	stops: GradientColorStop[];
}

function renderCssGradientLayer(
	context: CanvasRenderingContext2D,
	layer: string,
	boxForOrigin: DOMRect,
	boxForClip: DOMRect,
	boxWidth: number,
	boxHeight: number,
	style: CSSStyleDeclaration,
	env: RenderEnvironment,
): boolean {
	const linear = parseCssLinearGradient(layer);
	if (linear) {
		renderLinearGradient(
			context,
			linear,
			boxForOrigin,
			boxForClip,
			boxWidth,
			boxHeight,
			style,
			env,
		);
		return true;
	}

	const radial = parseCssRadialGradient(layer);
	if (radial) {
		renderRadialGradient(
			context,
			radial,
			boxForOrigin,
			boxForClip,
			boxWidth,
			boxHeight,
			style,
			env,
		);
		return true;
	}

	const conic = parseCssConicGradient(layer);
	if (conic) {
		renderConicGradient(
			context,
			conic,
			boxForOrigin,
			boxForClip,
			boxWidth,
			boxHeight,
			style,
		);
		return true;
	}

	return false;
}

function parseCssLinearGradient(
	input: string,
): LinearGradientParseResult | null {
	const normalized = input.trim();
	if (!/^(repeating-)?linear-gradient\(/i.test(normalized)) {
		return null;
	}

	const match = normalized.match(/(repeating-)?linear-gradient\((.+)\)/i);
	if (!match) return null;

	const [, repeatingRaw, props] = match;
	const result: LinearGradientParseResult = {
		orientation: {type: 'directional', value: 'bottom'},
		repeating: Boolean(repeatingRaw),
		stops: [],
	};

	const properties = gradientSplit(props);
	const orientation = resolveLinearGradientOrientation(properties[0]);
	if (orientation) {
		result.orientation = orientation;
		properties.shift();
	}

	result.stops = gradientResolveStops(properties);
	return result;
}

function resolveLinearGradientOrientation(
	angle: string | undefined,
): LinearGradientOrientation | null {
	if (!angle) return null;
	const trimmed = angle.trim();

	if (trimmed.startsWith('to ')) {
		return {
			type: 'directional',
			value: trimmed.replace('to ', ''),
		};
	}

	const units = ['turn', 'deg', 'grad', 'rad'];
	let hasUnit = false;
	for (let index = 0; index < units.length; index++) {
		if (trimmed.endsWith(units[index])) {
			hasUnit = true;
			break;
		}
	}

	if (hasUnit) {
		const length = gradientResolveLength(trimmed);
		if (length) {
			return {
				type: 'angular',
				value: length,
			};
		}
	}

	return null;
}

function parseCssRadialGradient(
	input: string,
): RadialGradientParseResult | null {
	const normalized = input.trim();
	if (!/(repeating-)?radial-gradient\(/i.test(normalized)) {
		return null;
	}

	const match = normalized.match(/(repeating-)?radial-gradient\((.+)\)/i);
	if (!match) return null;

	const [, repeatingRaw, props] = match;
	const result: RadialGradientParseResult = {
		shape: 'ellipse',
		repeating: Boolean(repeatingRaw),
		size: [
			{
				type: 'keyword',
				value: 'farthest-corner',
			},
		],
		position: {
			x: {type: 'keyword', value: 'center'},
			y: {type: 'keyword', value: 'center'},
		},
		stops: [],
	};

	const properties = gradientSplit(props);
	if (!properties.length) {
		return result;
	}

	// handle like radial-gradient(rgba(0,0,0,0), #ee7621)
	if (isGradientColor(properties[0])) {
		result.stops = gradientResolveStops(properties);
		return result;
	}

	const prefixPartsRaw = properties[0].split('at');
	const prefixParts: string[] = [];
	for (let index = 0; index < prefixPartsRaw.length; index++) {
		prefixParts.push(prefixPartsRaw[index].trim());
	}

	const shapeMatch = (prefixParts[0] || '').match(/(circle|ellipse)/);
	const shape = (shapeMatch || [])[1];
	const sizeMatches =
		(prefixParts[0] || '').match(
			/(-?\d+\.?\d*(vw|vh|px|em|rem|%|rad|grad|turn|deg)?|closest-corner|closest-side|farthest-corner|farthest-side)/g,
		) || [];
	const positionTokensRaw = (prefixParts[1] || '').split(' ');
	const positionTokensFiltered: string[] = [];
	for (let index = 0; index < positionTokensRaw.length; index++) {
		const token = positionTokensRaw[index].trim();
		if (token) positionTokensFiltered.push(token);
	}

	const positionTokens = extendRadialPosition(positionTokensFiltered);

	if (!shape) {
		if (sizeMatches.length === 1 && !isRadialExtentKeyword(sizeMatches[0])) {
			result.shape = 'circle';
		} else {
			result.shape = 'ellipse';
		}
	} else if (shape === 'circle' || shape === 'ellipse') {
		result.shape = shape;
	}

	const sizeValues =
		sizeMatches.length === 0 ? ['farthest-corner'] : sizeMatches;

	result.size = [];
	const sizeValuesLength = sizeValues.length;
	for (let index = 0; index < sizeValuesLength; index++) {
		const sizeValue = sizeValues[index];
		if (isRadialExtentKeyword(sizeValue)) {
			result.size.push({type: 'keyword', value: sizeValue});
		} else {
			const length = gradientResolveLength(sizeValue);
			result.size.push({
				type: 'length',
				value: length ?? {unit: 'px', value: '0'},
			});
		}
	}

	result.position.x = isPositionKeyword(positionTokens[0])
		? {type: 'keyword', value: positionTokens[0]}
		: {
				type: 'length',
				value: gradientResolveLength(positionTokens[0]) ?? {
					unit: 'px',
					value: '0',
				},
			};

	result.position.y = isPositionKeyword(positionTokens[1])
		? {type: 'keyword', value: positionTokens[1]}
		: {
				type: 'length',
				value: gradientResolveLength(positionTokens[1]) ?? {
					unit: 'px',
					value: '0',
				},
			};

	if (shape || sizeMatches.length > 0 || prefixParts[1]) {
		properties.shift();
	}

	result.stops = gradientResolveStops(properties);
	return result;
}

function parseCssConicGradient(input: string): ConicGradientParseResult | null {
	const normalized = input.trim();
	if (!/(repeating-)?conic-gradient\(/i.test(normalized)) {
		return null;
	}

	const match = normalized.match(/(repeating-)?conic-gradient\((.+)\)/i);
	if (!match) return null;

	const [, repeatingRaw, props] = match;
	const result: ConicGradientParseResult = {
		repeating: Boolean(repeatingRaw),
		angle: {unit: 'deg', value: '0'},
		position: {
			x: {type: 'keyword', value: 'center'},
			y: {type: 'keyword', value: 'center'},
		},
		stops: [],
	};

	const properties = gradientSplit(props);
	if (!properties.length) {
		return result;
	}

	const first = properties[0]?.trim() ?? '';

	// Fast-path for simple conic-gradient(<color>, <color>, ...) where the first
	// token is clearly a color. Avoid treating orientation prefixes such as
	// "from 180deg" or "at center" as colors.
	const startsWithFromOrAt = /^from\b/i.test(first) || /^at\b/i.test(first);

	if (!startsWithFromOrAt && isGradientColor(first)) {
		result.stops = gradientResolveStops(properties);
		return result;
	}

	const prefixPartsRaw = first.split('at');
	const prefixParts: string[] = [];
	for (let index = 0; index < prefixPartsRaw.length; index++) {
		prefixParts.push(prefixPartsRaw[index].trim());
	}

	// angle portion is typically "from <angle>"
	const anglePart = prefixParts[0];
	if (anglePart) {
		const angleTokensRaw = anglePart.split(/\s+/);
		const angleTokens: string[] = [];
		for (let index = 0; index < angleTokensRaw.length; index++) {
			const token = angleTokensRaw[index].trim();
			if (token) angleTokens.push(token);
		}

		const fromIndex = angleTokens[0] === 'from' ? 1 : 0;
		const angleToken = angleTokens[fromIndex];
		const length = gradientResolveLength(angleToken);
		if (length) {
			result.angle = length;
		}
	}

	const positionTokensRaw = (prefixParts[1] || '').split(/\s+/);
	const positionTokensFiltered: string[] = [];
	for (let index = 0; index < positionTokensRaw.length; index++) {
		const token = positionTokensRaw[index].trim();
		if (token) positionTokensFiltered.push(token);
	}

	const positionTokens = extendRadialPosition(positionTokensFiltered);

	result.position.x = isPositionKeyword(positionTokens[0])
		? {type: 'keyword', value: positionTokens[0]}
		: {
				type: 'length',
				value: gradientResolveLength(positionTokens[0]) ?? {
					unit: '%',
					value: '50',
				},
			};

	result.position.y = isPositionKeyword(positionTokens[1])
		? {type: 'keyword', value: positionTokens[1]}
		: {
				type: 'length',
				value: gradientResolveLength(positionTokens[1]) ?? {
					unit: '%',
					value: '50',
				},
			};

	if (prefixParts[0] || prefixParts[1]) {
		properties.shift();
	}

	result.stops = gradientResolveStops(properties);
	return result;
}

function renderLinearGradient(
	context: CanvasRenderingContext2D,
	gradient: LinearGradientParseResult,
	boxForOrigin: DOMRect,
	boxForClip: DOMRect,
	boxWidth: number,
	boxHeight: number,
	style: CSSStyleDeclaration,
	env: RenderEnvironment,
): void {
	const stops = normalizeGradientStops(gradient.stops, gradient.repeating);

	if (gradient.repeating && stops.length > 0) {
		// PATTERN STRATEGY:
		// Render one cycle of the gradient horizontally into a small offscreen canvas,
		// create a repeating pattern, and rotate the pattern to match the gradient angle.

		// 1. Calculate cycle length
		const firstOffset = stops[0].offset;
		const lastOffset = stops[stops.length - 1].offset;
		const diagonal = Math.sqrt(boxWidth * boxWidth + boxHeight * boxHeight);

		// Check if original stops used percentages
		let isPercentage = true;
		for (const s of gradient.stops) {
			if (s.offset && s.offset.unit !== '%') {
				isPercentage = false;
				break;
			}
		}

		let cycleLength = lastOffset - firstOffset;
		if (isPercentage) {
			cycleLength *= diagonal;
		}

		// Ensure safe minimum size for pattern
		cycleLength = Math.max(1, cycleLength);
		if (!Number.isFinite(cycleLength)) cycleLength = diagonal; // Fallback

		// 2. Create offscreen canvas for one cycle
		// We make it 1px tall as linear gradients are uniform perpendicular to the axis
		const patternCanvas = document.createElement('canvas');
		patternCanvas.width = Math.ceil(cycleLength);
		patternCanvas.height = 1;
		const pCtx = patternCanvas.getContext('2d', {colorSpace: env.colorSpace});

		if (pCtx) {
			// Draw the single cycle horizontally
			const gradientObj = pCtx.createLinearGradient(0, 0, cycleLength, 0);

			for (const stop of stops) {
				// Map stop offset to 0..1 for this cycle
				const relativePos =
					(stop.offset - firstOffset) * (isPercentage ? diagonal : 1);
				const t = Math.max(0, Math.min(1, relativePos / cycleLength));

				const color = resolveCanvasColor(stop.color, style, 'transparent');
				gradientObj.addColorStop(t, color);
			}

			pCtx.fillStyle = gradientObj;
			pCtx.fillRect(0, 0, cycleLength, 1);

			// 3. Create pattern and rotate it
			const pattern = context.createPattern(patternCanvas, 'repeat');
			if (pattern) {
				const vector = getLinearGradientDirectionVector(gradient.orientation);

				// Calculate the absolute start point of the gradient line (Distance 0)
				// This matches the geometry logic used for non-repeating gradients.
				const halfW = boxWidth * 0.5;
				const halfH = boxHeight * 0.5;
				const cx = boxForOrigin.left + halfW;
				const cy = boxForOrigin.top + halfH;

				const d1 = -halfW * vector.x - halfH * vector.y;
				const d2 = halfW * vector.x - halfH * vector.y;
				const d3 = halfW * vector.x + halfH * vector.y;
				const d4 = -halfW * vector.x + halfH * vector.y;

				const minProj = Math.min(d1, d2, d3, d4);
				const startX = cx + vector.x * minProj;
				const startY = cy + vector.y * minProj;

				// Calculate how many pixels the pattern should be shifted along the vector
				// so that the first stop (Pattern X=0) aligns with 'firstOffset'.
				// Pattern X=0 contains Color(firstOffset).
				// We want Color(firstOffset) to appear at Distance = firstOffset.
				const offsetPixels = firstOffset * (isPercentage ? diagonal : 1);

				const matrix = new DOMMatrix()
					.translate(startX, startY)
					.rotateFromVector(vector.x, vector.y)
					.translate(offsetPixels, 0);

				if (typeof pattern.setTransform === 'function') {
					pattern.setTransform(matrix);
				}

				context.fillStyle = pattern;
				// Fill the clip area, not the gradient origin box
				context.fillRect(
					boxForClip.left,
					boxForClip.top,
					boxForClip.width,
					boxForClip.height,
				);
				return;
			}
		}
	}

	// Non-repeating standard gradient logic (Fallback)
	// Calculate gradient line based on the positioned/sized gradient box (boxForOrigin)
	// but fill the visible clip area (boxForClip)
	const vector = getLinearGradientDirectionVector(gradient.orientation);
	const cx = boxForOrigin.left + boxWidth * 0.5;
	const cy = boxForOrigin.top + boxHeight * 0.5;
	const halfW = boxWidth * 0.5;
	const halfH = boxHeight * 0.5;

	const d1 = -halfW * vector.x - halfH * vector.y;
	const d2 = halfW * vector.x - halfH * vector.y;
	const d3 = halfW * vector.x + halfH * vector.y;
	const d4 = -halfW * vector.x + halfH * vector.y;

	const minProj = Math.min(d1, d2, d3, d4);
	const maxProj = Math.max(d1, d2, d3, d4);

	const startX = cx + vector.x * minProj;
	const startY = cy + vector.y * minProj;
	const endX = cx + vector.x * maxProj;
	const endY = cy + vector.y * maxProj;

	const canvasGradient = context.createLinearGradient(
		startX,
		startY,
		endX,
		endY,
	);

	for (const stop of stops) {
		const color = resolveCanvasColor(stop.color, style, 'transparent');
		canvasGradient.addColorStop(stop.offset, color);
	}

	context.fillStyle = canvasGradient;
	// Fill the clip area to ensure coverage, gradient pattern extends based on boxForOrigin
	context.fillRect(
		boxForClip.left,
		boxForClip.top,
		boxForClip.width,
		boxForClip.height,
	);
}

function renderRadialGradient(
	context: CanvasRenderingContext2D,
	gradient: RadialGradientParseResult,
	boxForOrigin: DOMRect,
	boxForClip: DOMRect,
	boxWidth: number,
	boxHeight: number,
	style: CSSStyleDeclaration,
	env: RenderEnvironment,
): void {
	const centerX =
		boxForOrigin.left +
		resolveRadialPositionComponent(gradient.position.x, boxWidth);
	const centerY =
		boxForOrigin.top +
		resolveRadialPositionComponent(gradient.position.y, boxHeight);

	const radius = resolveRadialRadius(
		gradient,
		centerX,
		centerY,
		boxForOrigin.left,
		boxForOrigin.top,
		boxForOrigin.right,
		boxForOrigin.bottom,
	);

	const stops = normalizeGradientStops(gradient.stops, gradient.repeating);

	if (gradient.repeating && stops.length > 0) {
		// For repeating radial gradients, calculate cycle length
		const offsets: number[] = [];
		const stopsLength = stops.length;
		for (let index = 0; index < stopsLength; index++) {
			const {offset} = stops[index];
			if (Number.isFinite(offset)) {
				offsets.push(offset);
			}
		}

		if (offsets.length === 0) {
			// Fallback to non-repeating
			const canvasGradient = context.createRadialGradient(
				centerX,
				centerY,
				0,
				centerX,
				centerY,
				radius,
			);
			for (let index = 0; index < stopsLength; index++) {
				const stop = stops[index];
				const color = resolveCanvasColor(
					stop.color,
					style,
					style.color || 'rgba(0,0,0,0)',
				);
				canvasGradient.addColorStop(stop.offset, color);
			}

			context.fillStyle = canvasGradient;
			context.fillRect(
				boxForClip.left,
				boxForClip.top,
				boxForClip.width,
				boxForClip.height,
			);
			return;
		}

		let minOffset = Infinity;
		let maxOffset = -Infinity;
		const offsetsLength = offsets.length;
		for (let index = 0; index < offsetsLength; index++) {
			const offset = offsets[index];
			if (offset < minOffset) minOffset = offset;
			if (offset > maxOffset) maxOffset = offset;
		}

		const cycleLength = Math.max(maxOffset - minOffset, 0.001);
		const cycleRadius = radius * cycleLength;

		// Create pattern canvas
		const patternSize = Math.ceil(cycleRadius * 4);
		const patternCanvas = document.createElement('canvas');
		const patternContext = patternCanvas.getContext('2d', {
			colorSpace: env.colorSpace,
		});
		if (!patternContext) return;

		patternCanvas.width = patternSize;
		patternCanvas.height = patternSize;

		const patternCenterX = patternSize / 2;
		const patternCenterY = patternSize / 2;
		const patternGradient = patternContext.createRadialGradient(
			patternCenterX,
			patternCenterY,
			0,
			patternCenterX,
			patternCenterY,
			cycleRadius,
		);

		// Normalize stops to [0, 1] for the single cycle
		for (let index = 0; index < stopsLength; index++) {
			const stop = stops[index];
			const normalizedOffset = (stop.offset - minOffset) / cycleLength;
			const clampedOffset = Math.max(0, Math.min(1, normalizedOffset));
			const color = resolveCanvasColor(
				stop.color,
				style,
				style.color || 'rgba(0,0,0,0)',
			);
			patternGradient.addColorStop(clampedOffset, color);
		}

		patternContext.fillStyle = patternGradient;
		patternContext.fillRect(0, 0, patternSize, patternSize);

		// Create pattern and tile
		const pattern = context.createPattern(patternCanvas, 'repeat');
		if (pattern) {
			context.fillStyle = pattern;
			context.fillRect(
				boxForClip.left,
				boxForClip.top,
				boxForClip.width,
				boxForClip.height,
			);
		}
	} else {
		// Non-repeating gradient
		const canvasGradient = context.createRadialGradient(
			centerX,
			centerY,
			0,
			centerX,
			centerY,
			radius,
		);

		const stopsLength = stops.length;
		for (let index = 0; index < stopsLength; index++) {
			const stop = stops[index];
			const color = resolveCanvasColor(
				stop.color,
				style,
				style.color || 'rgba(0,0,0,0)',
			);
			canvasGradient.addColorStop(stop.offset, color);
		}

		context.fillStyle = canvasGradient;
		context.fillRect(
			boxForClip.left,
			boxForClip.top,
			boxForClip.width,
			boxForClip.height,
		);
	}
}

function renderConicGradient(
	context: CanvasRenderingContext2D,
	gradient: ConicGradientParseResult,
	boxForOrigin: DOMRect,
	boxForClip: DOMRect,
	boxWidth: number,
	boxHeight: number,
	style: CSSStyleDeclaration,
): void {
	const centerX =
		boxForOrigin.left +
		resolveRadialPositionComponent(gradient.position.x, boxWidth);
	const centerY =
		boxForOrigin.top +
		resolveRadialPositionComponent(gradient.position.y, boxHeight);

	const baseAngle = parseAngleToRadians(
		`${gradient.angle.value}${gradient.angle.unit}`,
	);
	// CSS conic-gradient() defines 0deg at the top (12 o'clock) increasing
	// clockwise, while CanvasRenderingContext2D.createConicGradient() uses 0
	// radians along the positive x-axis (3 o'clock). Subtract 90deg so that a
	// CSS `from 0deg` visually matches the canvas default.
	const startAngle = baseAngle != null ? baseAngle - Math.PI / 2 : -Math.PI / 2;

	const stops = normalizeConicGradientStops(gradient.stops, gradient.repeating);

	if (gradient.repeating && stops.length > 0) {
		// For repeating conic gradients, calculate cycle length
		const offsets: number[] = [];
		const stopsLength = stops.length;
		for (let index = 0; index < stopsLength; index++) {
			const {offset} = stops[index];
			if (Number.isFinite(offset)) {
				offsets.push(offset);
			}
		}

		if (offsets.length === 0) {
			// Fallback to non-repeating
			const canvasGradient = context.createConicGradient(
				startAngle,
				centerX,
				centerY,
			)!;
			for (let index = 0; index < stopsLength; index++) {
				const stop = stops[index];
				const color = resolveCanvasColor(
					stop.color,
					style,
					style.color || 'rgba(0,0,0,0)',
				);
				canvasGradient.addColorStop(stop.offset, color);
			}

			context.fillStyle = canvasGradient;
			context.fillRect(
				boxForClip.left,
				boxForClip.top,
				boxForClip.width,
				boxForClip.height,
			);
			return;
		}

		let minOffset = Infinity;
		let maxOffset = -Infinity;
		const offsetsLength = offsets.length;
		for (let index = 0; index < offsetsLength; index++) {
			const offset = offsets[index];
			if (offset < minOffset) minOffset = offset;
			if (offset > maxOffset) maxOffset = offset;
		}

		const cycleLength = Math.max(maxOffset - minOffset, 0.001);

		// For repeating conic, we need to extend the gradient to cover multiple cycles
		// Calculate how many cycles we need
		const boxDiagonal = Math.sqrt(boxWidth ** 2 + boxHeight ** 2);
		const maxRadius = boxDiagonal / 2;
		const numCycles =
			Math.ceil((maxRadius / (maxRadius * cycleLength)) * 2) + 2;

		// Create a conic gradient that spans multiple cycles
		const canvasGradient = context.createConicGradient(
			startAngle,
			centerX,
			centerY,
		)!;

		// Add stops for multiple cycles, normalized to [0, 1]
		const totalCycleLength = cycleLength * (2 * numCycles + 1);
		for (let cycle = -numCycles; cycle <= numCycles; cycle++) {
			for (let index = 0; index < stopsLength; index++) {
				const stop = stops[index];
				const cycleOffset = stop.offset + cycle * cycleLength;
				const normalizedOffset =
					(cycleOffset - minOffset + numCycles * cycleLength) /
					totalCycleLength;
				if (normalizedOffset >= 0 && normalizedOffset <= 1) {
					const color = resolveCanvasColor(
						stop.color,
						style,
						style.color || 'rgba(0,0,0,0)',
					);
					canvasGradient.addColorStop(normalizedOffset, color);
				}
			}
		}

		context.fillStyle = canvasGradient;
		context.fillRect(
			boxForClip.left,
			boxForClip.top,
			boxForClip.width,
			boxForClip.height,
		);
	} else {
		// Non-repeating gradient
		const canvasGradient = context.createConicGradient(
			startAngle,
			centerX,
			centerY,
		)!;

		const stopsLength = stops.length;
		for (let index = 0; index < stopsLength; index++) {
			const stop = stops[index];
			const color = resolveCanvasColor(
				stop.color,
				style,
				style.color || 'rgba(0,0,0,0)',
			);
			canvasGradient.addColorStop(stop.offset, color);
		}

		context.fillStyle = canvasGradient;
		context.fillRect(
			boxForClip.left,
			boxForClip.top,
			boxForClip.width,
			boxForClip.height,
		);
	}
}

function normalizeConicGradientStops(
	stops: GradientColorStop[],
	repeating: boolean = false,
): Array<{color: string; offset: number}> {
	if (!stops.length) {
		const transparent = normalizeCssColor('transparent') ?? 'rgba(0,0,0,0)';
		return [
			{color: transparent, offset: 0},
			{color: transparent, offset: 1},
		];
	}

	const raw: Array<number | undefined> = [];
	const stopsLength = stops.length;
	for (let index = 0; index < stopsLength; index++) {
		const stop = stops[index];
		const {offset} = stop;
		if (!offset) {
			raw.push(undefined);
			continue;
		}

		let normalizedValue = parseFloat(offset.value);
		if (!Number.isFinite(normalizedValue)) {
			raw.push(undefined);
			continue;
		}

		switch (offset.unit) {
			case '%':
				normalizedValue /= 100;
				break;
			case 'deg':
				normalizedValue /= 360;
				break;
			case 'grad':
				normalizedValue /= 400;
				break;
			case 'turn':
				// already expressed as turns (0–1)
				break;
			case 'rad':
				normalizedValue /= 2 * Math.PI;
				break;
			default:
				// Other units (px, etc.) are treated as-is and then clamped to [0,1].
				break;
		}

		raw.push(normalizedValue);
	}

	let hasAnySpecified = false;
	const rawLength = raw.length;
	for (let index = 0; index < rawLength; index++) {
		if (raw[index] != null) {
			hasAnySpecified = true;
			break;
		}
	}

	// If no explicit positions are provided, distribute stops evenly from 0 to 1.
	if (!hasAnySpecified) {
		const step = 1 / Math.max(stops.length - 1, 1);
		const result: Array<{color: string; offset: number}> = [];
		const stopsLength = stops.length;
		for (let index = 0; index < stopsLength; index++) {
			const stop = stops[index];
			const offset = stopsLength === 1 ? 0 : step * index;
			const color = normalizeCssColor(stop.color) ?? stop.color;
			result.push({color, offset});
		}

		return result;
	}

	// Interpolate missing offsets between explicit neighbors to better match the
	// conic-gradient() behavior, which resolves unspecified stop positions
	// locally instead of normalizing the entire list at once.
	let lastSpecified = -1;
	for (let index = 0; index < raw.length; index++) {
		const value = raw[index];
		if (value == null) continue;
		if (lastSpecified >= 0 && index - lastSpecified > 1) {
			const start = raw[lastSpecified];
			if (start != null) {
				const end = value;
				const span = index - lastSpecified;
				for (
					let interpolationIndex = lastSpecified + 1;
					interpolationIndex < index;
					interpolationIndex++
				) {
					const interpolationFactor =
						(interpolationIndex - lastSpecified) / span;
					raw[interpolationIndex] = start + (end - start) * interpolationFactor;
				}
			}
		}

		lastSpecified = index;
	}

	if (raw[0] == null) {
		raw[0] = 0;
	}

	for (let index = 1; index < raw.length; index++) {
		if (raw[index] == null) {
			const previous = raw[index - 1];
			raw[index] = previous != null ? previous : 0;
		}
	}

	// For repeating gradients, preserve original offsets; otherwise clamp to [0,1]
	const result: Array<{color: string; offset: number}> = [];
	for (let index = 0; index < stopsLength; index++) {
		const stop = stops[index];
		let value = raw[index];
		if (value == null || !Number.isFinite(value)) {
			value = 0;
		}

		if (repeating) {
			// Preserve original offset for repeating gradients
			const color = normalizeCssColor(stop.color) ?? stop.color;
			result.push({color, offset: value});
		} else {
			// Clamp to [0,1] for non-repeating gradients
			const clamped = Math.min(1, Math.max(0, value));
			const color = normalizeCssColor(stop.color) ?? stop.color;
			result.push({color, offset: clamped});
		}
	}

	return result;
}

function getLinearGradientDirectionVector(
	orientation: LinearGradientOrientation,
): {x: number; y: number} {
	if (orientation.type === 'directional') {
		const tokens: string[] = [];
		const {value} = orientation;
		const tokenRegex = /\s+/;
		let start = 0;
		for (let index = 0; index < value.length; index++) {
			if (tokenRegex.test(value[index])) {
				if (index > start) {
					const token = value.slice(start, index).trim();
					if (token) tokens.push(token);
				}

				start = index + 1;
			}
		}

		if (start < value.length) {
			const token = value.slice(start).trim();
			if (token) tokens.push(token);
		}

		let vectorX = 0;
		let vectorY = 0;

		const tokensLength = tokens.length;
		for (let index = 0; index < tokensLength; index++) {
			const token = tokens[index];
			switch (token) {
				case 'left':
					vectorX -= 1;
					break;
				case 'right':
					vectorX += 1;
					break;
				case 'top':
					vectorY -= 1;
					break;
				case 'bottom':
					vectorY += 1;
					break;
			}
		}

		if (vectorX === 0 && vectorY === 0) {
			vectorY = 1; // default "to bottom"
		}

		const length = Math.sqrt(vectorX * vectorX + vectorY * vectorY) || 1;
		return {x: vectorX / length, y: vectorY / length};
	}

	// Angular orientation (e.g. 45deg)
	const length = orientation.value;
	const raw = parseFloat(length.value);
	if (!Number.isFinite(raw)) {
		return {x: 0, y: 1};
	}

	let degrees = raw;
	switch (length.unit) {
		case 'turn':
			degrees = raw * 360;
			break;
		case 'rad':
			degrees = (raw * 180) / Math.PI;
			break;
		case 'grad':
			degrees = raw * 0.9;
			break;
		case 'deg':
		default:
			break;
	}

	const radians = (degrees * Math.PI) / 180;
	const vectorX = Math.sin(radians);
	const vectorY = -Math.cos(radians);
	const vectorLength = Math.sqrt(vectorX * vectorX + vectorY * vectorY) || 1;
	return {x: vectorX / vectorLength, y: vectorY / vectorLength};
}

function normalizeGradientStops(
	stops: GradientColorStop[],
	repeating: boolean = false,
): Array<{color: string; offset: number}> {
	if (!stops.length) {
		const transparent = normalizeCssColor('transparent') ?? 'rgba(0,0,0,0)';
		return [
			{color: transparent, offset: 0},
			{color: transparent, offset: 1},
		];
	}

	// First, resolve the offsets from the stop definitions
	const numericOffsets: Array<number | undefined> = [];
	const stopsLength = stops.length;

	// Parse each stop's offset value
	for (let index = 0; index < stopsLength; index++) {
		const stop = stops[index];
		const {offset} = stop;
		if (!offset) {
			numericOffsets.push(undefined);
			continue;
		}

		const raw = parseFloat(offset.value);
		if (!Number.isFinite(raw)) {
			numericOffsets.push(undefined);
			continue;
		}

		if (offset.unit === '%') {
			numericOffsets.push(raw / 100);
		} else {
			numericOffsets.push(raw);
		}
	}

	// Per CSS spec:
	// 1. If the first color stop has no position, it defaults to 0
	// 2. If the last color stop has no position, it defaults to 100% (or max offset for repeating)
	// 3. Intermediate stops without positions are evenly distributed between neighbors

	// Handle first stop: defaults to 0 if not specified
	if (numericOffsets[0] == null) {
		numericOffsets[0] = 0;
	}

	// Handle last stop: defaults to max(100%, largest explicit offset) or just largest for repeating
	if (numericOffsets[numericOffsets.length - 1] == null) {
		// Find the largest explicit offset
		let largestExplicit = 0;
		for (let index = 0; index < numericOffsets.length; index++) {
			const value = numericOffsets[index];
			if (value != null && value > largestExplicit) {
				largestExplicit = value;
			}
		}

		// For percentage-based gradients, default to 1 (100%); for absolute units, use largest
		numericOffsets[numericOffsets.length - 1] = Math.max(1, largestExplicit);
	}

	// Interpolate intermediate undefined stops between their nearest defined neighbors
	let lastDefinedIndex = 0;
	for (let index = 1; index < numericOffsets.length; index++) {
		if (numericOffsets[index] != null) {
			// Fill in any gaps between lastDefinedIndex and index
			if (index - lastDefinedIndex > 1) {
				const startVal = numericOffsets[lastDefinedIndex]!;
				const endVal = numericOffsets[index]!;
				const gaps = index - lastDefinedIndex;
				for (
					let gapIndex = lastDefinedIndex + 1;
					gapIndex < index;
					gapIndex++
				) {
					const t = (gapIndex - lastDefinedIndex) / gaps;
					numericOffsets[gapIndex] = startVal + (endVal - startVal) * t;
				}
			}

			lastDefinedIndex = index;
		}
	}

	// Safety: ensure all are defined (should be handled above, but just in case)
	for (let index = 0; index < numericOffsets.length; index++) {
		if (numericOffsets[index] == null) {
			numericOffsets[index] = index / Math.max(numericOffsets.length - 1, 1);
		}
	}

	// Calculate min/max for normalization
	const minOffset = numericOffsets[0]!;
	const maxOffset = numericOffsets[numericOffsets.length - 1]!;

	// Then, resolve the colors and fix 'transparent' interpolation
	const resolvedStops: Array<{
		finalColor: string;
		offset: number;
		parsed: ParsedCssColor | null;
	}> = [];

	for (let index = 0; index < stopsLength; index++) {
		const stop = stops[index];
		let offset = numericOffsets[index]!;

		// Normalize offset for non-repeating gradients
		if (!repeating) {
			const range = maxOffset - minOffset || 1;
			offset = (offset - minOffset) / range;
			offset = Math.min(1, Math.max(0, offset));
		}

		const cssColor = normalizeCssColor(stop.color) ?? stop.color;
		const parsed = parseCssColor(cssColor);

		resolvedStops.push({
			finalColor: cssColor,
			offset,
			parsed,
		});
	}

	const result: Array<{color: string; offset: number}> = [];
	const resolvedStopsLength = resolvedStops.length;
	for (let index = 0; index < resolvedStopsLength; index++) {
		const stop = resolvedStops[index];
		result.push({
			color: stop.finalColor,
			offset: stop.offset,
		});
	}

	return result;
}

function resolveRadialPositionComponent(
	position: RadialGradientPositionValue,
	size: number,
): number {
	if (position.type === 'keyword') {
		const keyword = String(position.value);
		switch (keyword) {
			case 'left':
			case 'top':
				return 0;
			case 'right':
			case 'bottom':
				return size;
			case 'center':
			default:
				return size / 2;
		}
	}

	// position.type === 'length', so position.value is GradientLength
	if (typeof position.value === 'string') {
		return size / 2;
	}

	const length = position.value;
	const raw = parseFloat(length.value);
	if (!Number.isFinite(raw)) {
		return size / 2;
	}

	if (length.unit === '%') {
		return (raw / 100) * size;
	}

	return raw;
}

function resolveRadialRadius(
	gradient: RadialGradientParseResult,
	centerX: number,
	centerY: number,
	left: number,
	top: number,
	right: number,
	bottom: number,
): number {
	const width = right - left;
	const height = bottom - top;
	const deltaXLeft = centerX - left;
	const deltaXRight = right - centerX;
	const deltaYTop = centerY - top;
	const deltaYBottom = bottom - centerY;

	const extentKeyword = gradient.size[0];
	if (extentKeyword.type === 'keyword') {
		const value = String(extentKeyword.value);
		switch (value) {
			case 'closest-side':
				return Math.min(deltaXLeft, deltaXRight, deltaYTop, deltaYBottom);
			case 'closest-corner':
				return Math.min(
					Math.hypot(deltaXLeft, deltaYTop),
					Math.hypot(deltaXRight, deltaYTop),
					Math.hypot(deltaXLeft, deltaYBottom),
					Math.hypot(deltaXRight, deltaYBottom),
				);
			case 'farthest-side':
				return Math.max(deltaXLeft, deltaXRight, deltaYTop, deltaYBottom);
			case 'farthest-corner':
			default:
				return Math.max(
					Math.hypot(deltaXLeft, deltaYTop),
					Math.hypot(deltaXRight, deltaYTop),
					Math.hypot(deltaXLeft, deltaYBottom),
					Math.hypot(deltaXRight, deltaYBottom),
				);
		}
	}

	// extentKeyword.type === 'length', so extentKeyword.value is GradientLength
	if (typeof extentKeyword.value === 'string') {
		return Math.max(width, height) / 2;
	}

	const {value} = extentKeyword;
	const raw = parseFloat(value.value);
	if (!Number.isFinite(raw)) {
		return Math.max(width, height) / 2;
	}

	if (value.unit === '%') {
		return (raw / 100) * Math.max(width, height);
	}

	return raw;
}

function gradientSplit(
	input: string,
	separator: string | RegExp = ',',
): string[] {
	const result: string[] = [];
	let start = 0;
	let depth = 0;
	const regex = new RegExp(separator);

	for (let index = 0; index < input.length; index++) {
		const character = input[index];
		if (character === '(') {
			depth++;
		} else if (character === ')') {
			depth--;
		}

		if (depth === 0 && regex.test(character)) {
			result.push(input.slice(start, index).trim());
			start = index + 1;
		}
	}

	result.push(input.slice(start).trim());
	return result;
}

function gradientResolveStops(values: string[]): GradientColorStop[] {
	const stops: GradientColorStop[] = [];

	for (let index = 0; index < values.length; index++) {
		const parts = gradientSplit(values[index], /\s+/);
		const color = parts[0];
		const offsetToken = parts[1];
		const hintToken = parts[2];

		stops.push({
			color,
			offset: gradientResolveLength(offsetToken),
			hint: gradientResolveLength(hintToken),
		});
	}

	return stops;
}

const GRADIENT_LENGTH_REGEXP =
	/^(-?(?:\d+\.?\d*|\.\d+))(%|vw|vh|px|em|rem|deg|rad|grad|turn|ch|vmin|vmax)?$/;

function gradientResolveLength(value?: string): GradientLength | undefined {
	if (!value) return undefined;

	const match = value.trim().match(GRADIENT_LENGTH_REGEXP);
	if (!match) return undefined;

	const [, numeric, unit] = match;
	return {
		value: numeric,
		unit: unit ?? 'px',
	};
}

function isGradientColor(value: string): boolean {
	if (/(circle|ellipse|at)/.test(value)) return false;

	// Only look at the first token (before any length/hint), keeping parentheses intact.
	const [first] = gradientSplit(value, /\s+/);
	if (!first) return false;

	// Use parse-css-color to validate actual color syntax; fall back to previous
	// heuristic for future color spaces we don't yet support.
	if (normalizeCssColor(first)) return true;

	return /^(rgba?|hwb|hsla?|lab|lch|oklab|color|#|[a-zA-Z]+)/.test(first);
}

type RadialExtentKeyword =
	| 'closest-corner'
	| 'closest-side'
	| 'farthest-corner'
	| 'farthest-side';

const radialExtentKeywords = new Set<RadialExtentKeyword>([
	'closest-corner',
	'closest-side',
	'farthest-corner',
	'farthest-side',
]);

function isRadialExtentKeyword(value: string): value is RadialExtentKeyword {
	return (
		typeof value === 'string' &&
		radialExtentKeywords.has(value as RadialExtentKeyword)
	);
}

type RadialPositionKeyword = 'center' | 'left' | 'right' | 'top' | 'bottom';

const radialPositionKeywords = new Set<RadialPositionKeyword>([
	'center',
	'left',
	'top',
	'right',
	'bottom',
]);

function isPositionKeyword(value: string): value is RadialPositionKeyword {
	return (
		typeof value === 'string' &&
		radialPositionKeywords.has(value as RadialPositionKeyword)
	);
}

function extendRadialPosition(values: string[]): [string, string] {
	const result: [string, string] = ['center', 'center'];
	for (let index = 0; index < 2; index++) {
		if (!values[index]) result[index] = 'center';
		else result[index] = values[index];
	}

	return result;
}

interface ParsedShadow {
	inset: boolean;
	offsetX: number;
	offsetY: number;
	blur: number;
	spread: number;
	color: string;
}

function renderBoxShadow(
	context: CanvasRenderingContext2D,
	style: CSSStyleDeclaration,
	rect: DOMRect,
	radii: BorderRadii,
): void {
	const value = style.boxShadow;
	if (!value || value === 'none') return;

	const shadows = parseShadowList(value, style.color || 'rgba(0,0,0,0.5)');
	if (!shadows.length) return;

	const shadowsLength = shadows.length;
	for (let index = 0; index < shadowsLength; index++) {
		const shadow = shadows[index];

		if (!shadow.inset) continue;

		if (shadow.inset) {
			// Approximate inset shadows by clipping to the padding box (inner border edge)
			// and drawing a large shadowed rect outside that box so the blur appears inside.
			const borderLeft = parseCssLength(style.borderLeftWidth);
			const borderTop = parseCssLength(style.borderTopWidth);
			const borderRight = parseCssLength(style.borderRightWidth);
			const borderBottom = parseCssLength(style.borderBottomWidth);

			// Padding is NOT used for inset shadow geometry. Inset shadows
			// paint over the padding area, bounded by the inner border edge.
			const paddingBox: DOMRect = {
				left: rect.left + borderLeft,
				top: rect.top + borderTop,
				width: Math.max(0, rect.width - borderLeft - borderRight),
				height: Math.max(0, rect.height - borderTop - borderBottom),
				right: rect.right - borderRight,
				bottom: rect.bottom - borderBottom,
				x: 0,
				y: 0,
				toJSON: () => ({}),
			} as DOMRect;

			let innerRadii = radii;
			if (
				radii.topLeft !== 0 ||
				radii.topRight !== 0 ||
				radii.bottomRight !== 0 ||
				radii.bottomLeft !== 0
			) {
				// Only shrink radii by the border width. Do NOT include padding,
				// as inset shadows exist inside the padding area.
				innerRadii = shrinkBorderRadiiForInnerBox(
					radii,
					borderLeft,
					borderTop,
					borderRight,
					borderBottom,
				);
			}

			context.save();
			context.beginPath();
			if (
				innerRadii.topLeft ||
				innerRadii.topRight ||
				innerRadii.bottomRight ||
				innerRadii.bottomLeft
			) {
				pathRoundedRect(context, paddingBox, innerRadii);
			} else {
				context.rect(
					paddingBox.left,
					paddingBox.top,
					paddingBox.width,
					paddingBox.height,
				);
			}

			context.clip();

			context.shadowColor = resolveCanvasColor(
				shadow.color,
				style,
				style.color || 'rgba(0,0,0,0.5)',
			);
			context.shadowBlur = shadow.blur;
			context.shadowOffsetX = shadow.offsetX;
			context.shadowOffsetY = shadow.offsetY;

			// Draw a large rect around the padding box so that the outer blur falls
			// back into the clipped region, approximating an inset shadow.
			// Ensure margin accommodates blur, spread, and offsets.
			const margin =
				(shadow.blur || 0) * 4 +
				Math.abs(shadow.spread || 0) +
				Math.max(Math.abs(shadow.offsetX || 0), Math.abs(shadow.offsetY || 0)) +
				10;

			const bigLeft = paddingBox.left - margin;
			const bigTop = paddingBox.top - margin;
			const bigWidth = paddingBox.width + margin * 2;
			const bigHeight = paddingBox.height + margin * 2;

			// Use an opaque fill so that the shadow is actually generated.
			context.fillStyle = 'rgba(0,0,0,1)';

			// Create a shape with a hole corresponding to the element's padding box.
			context.beginPath();
			context.rect(bigLeft, bigTop, bigWidth, bigHeight);

			if (
				innerRadii.topLeft ||
				innerRadii.topRight ||
				innerRadii.bottomRight ||
				innerRadii.bottomLeft
			) {
				pathRoundedRect(context, paddingBox, innerRadii);
			} else {
				context.rect(
					paddingBox.left,
					paddingBox.top,
					paddingBox.width,
					paddingBox.height,
				);
			}

			context.fill('evenodd');

			context.restore();
			continue;
		}

		// Outer shadow rendering logic is handled by drawOuterBoxShadows
	}
}

/**
 * Parse pseudo-element content value, supporting:
 * - Multiple strings: "a" "b"
 * - attr(): attr(data-label)
 * - url(): url(image.png)
 * - Basic counters (limited support)
 */
interface ParsedPseudoContent {
	text: string | null;
	imageUrl: string | null;
}

function getCssCounterValueForElement(
	element: HTMLElement,
	name: string,
	env?: RenderEnvironment,
): string | null {
	if (!name) return null;

	// Special-case the implicit list-item counter so that authors can write
	// `::marker { content: counter(list-item) ". "; }` without having to
	// restate the UA stylesheet rules for ordered lists. We derive the value
	// from the DOM position within <ol>/<ul> instead of relying solely on
	// `counter-reset` / `counter-increment`.
	if (name === 'list-item') {
		const index = getListItemIndex(element);
		if (index != null && index > 0) {
			return String(index);
		}
	}

	if (!env) {
		return null;
	}

	if (!env.elementCounters) {
		env.elementCounters = computeCssCounters(env.rootElement);
	}

	const map = env.elementCounters.get(element);
	if (!map) {
		return null;
	}

	const value = map.get(name);
	if (value == null || !Number.isFinite(value)) {
		return null;
	}

	return String(value);
}

function parsePseudoContent(
	content: string,
	element: HTMLElement,
	env?: RenderEnvironment,
): ParsedPseudoContent {
	const trimmed = content.trim();
	if (!trimmed || trimmed === 'none' || trimmed === 'normal') {
		return {text: null, imageUrl: null};
	}

	let resultText = '';
	let imageUrl: string | null = null;

	// Split by spaces but preserve quoted strings and function calls
	const tokens: string[] = [];
	let current = '';
	let inQuotes = false;
	let quoteChar = '';
	let depth = 0;

	for (let index = 0; index < trimmed.length; index++) {
		const char = trimmed[index];
		if (char === '"' || char === "'") {
			if (!inQuotes) {
				inQuotes = true;
				quoteChar = char;
				if (current.trim()) {
					tokens.push(current.trim());
					current = '';
				}

				current += char;
			} else if (char === quoteChar) {
				inQuotes = false;
				current += char;
				tokens.push(current);
				current = '';
				quoteChar = '';
			} else {
				current += char;
			}
		} else if (inQuotes) {
			current += char;
		} else if (char === '(') {
			depth++;
			current += char;
		} else if (char === ')') {
			depth--;
			current += char;
			if (depth === 0) {
				tokens.push(current.trim());
				current = '';
			}
		} else if (depth > 0) {
			current += char;
		} else if (/\s/.test(char)) {
			if (current.trim()) {
				tokens.push(current.trim());
				current = '';
			}
		} else {
			current += char;
		}
	}

	if (current.trim()) {
		tokens.push(current.trim());
	}

	// Process tokens
	const tokensLength = tokens.length;
	for (let index = 0; index < tokensLength; index++) {
		const token = tokens[index];
		// Quoted string
		const quoteMatch = token.match(/^(['"])(.*)\1$/);
		if (quoteMatch) {
			resultText += quoteMatch[2];
			continue;
		}

		// attr() function
		const attrMatch = token.match(/^attr\(([^)]+)\)$/i);
		if (attrMatch) {
			const attrName = attrMatch[1].trim();
			const attrValue = element.getAttribute(attrName) || '';
			resultText += attrValue;
			continue;
		}

		// url() function
		const urlMatch = token.match(/^url\((['"]?)([^'")]+)\1\)$/i);
		if (urlMatch) {
			imageUrl = urlMatch[2];
			continue;
		}

		// counter() function
		const counterMatch = token.match(/^counter\(([^)]+)\)$/i);
		if (counterMatch) {
			const body = counterMatch[1];
			const partsRaw = body.split(',');
			const parts: string[] = [];
			const partsRawLength = partsRaw.length;
			for (let index = 0; index < partsRawLength; index++) {
				const part = partsRaw[index].trim();
				if (part) parts.push(part);
			}

			const counterName = parts[0] || '';
			const styleHint = (parts[1] || '').trim().toLowerCase();

			if (counterName) {
				const rawValue = getCssCounterValueForElement(
					element,
					counterName,
					env,
				);
				if (rawValue != null) {
					let textValue = rawValue;
					if (styleHint) {
						const numeric = parseInt(rawValue, 10);
						if (Number.isFinite(numeric)) {
							const formatted = formatListMarkerText(styleHint, numeric);
							if (formatted) {
								textValue = formatted.endsWith('.')
									? formatted.slice(0, -1)
									: formatted;
							}
						}
					}

					resultText += textValue;
				}
			}

			continue;
		}

		// counters() function – approximate as a single counter() value, ignoring
		// ancestor accumulation. This keeps common patterns like
		// `counters(section, ".")` usable without implementing the full CSS
		// counter stack.
		const countersMatch = token.match(/^counters\(([^)]+)\)$/i);
		if (countersMatch) {
			const body = countersMatch[1];
			const partsRaw = body.split(',');
			const parts: string[] = [];
			const partsRawLength = partsRaw.length;
			for (let index = 0; index < partsRawLength; index++) {
				const part = partsRaw[index].trim();
				if (part) parts.push(part);
			}

			const counterName = parts[0] || '';
			const styleHint = (parts[2] || '').trim().toLowerCase();

			if (counterName) {
				const rawValue = getCssCounterValueForElement(
					element,
					counterName,
					env,
				);
				if (rawValue != null) {
					let textValue = rawValue;
					if (styleHint) {
						const numeric = parseInt(rawValue, 10);
						if (Number.isFinite(numeric)) {
							const formatted = formatListMarkerText(styleHint, numeric);
							if (formatted) {
								textValue = formatted.endsWith('.')
									? formatted.slice(0, -1)
									: formatted;
							}
						}
					}

					resultText += textValue;
				}
			}

			continue;
		}

		// Bare text (fallback)
		if (token && !token.startsWith('counter') && !token.startsWith('attr')) {
			resultText += token;
		}
	}

	return {
		text: resultText || null,
		imageUrl,
	};
}

async function renderPseudoElement(
	element: HTMLElement,
	context: CanvasRenderingContext2D,
	pseudoStyle: CSSStyleDeclaration | null,
	parentStyle: CSSStyleDeclaration,
	rect: DOMRect,
	radii: BorderRadii,
	hasRadius: boolean,
	env: RenderEnvironment,
	position: 'before' | 'after',
): Promise<void> {
	if (!pseudoStyle) return;

	const rawContent = pseudoStyle.content;
	if (!rawContent || rawContent === 'none' || rawContent === 'normal') {
		return;
	}

	const parsedContent = parsePseudoContent(rawContent, element, env);
	const {text} = parsedContent;
	const {imageUrl} = parsedContent;

	const hasBackgroundColor =
		pseudoStyle.backgroundColor &&
		pseudoStyle.backgroundColor !== 'transparent' &&
		pseudoStyle.backgroundColor !== 'rgba(0, 0, 0, 0)';

	if (!hasBackgroundColor && (!text || text.length === 0) && !imageUrl) {
		// No visible pseudo content to render.
		return;
	}

	// Approximate the pseudo-element box as the element's padding box.
	const borderLeft = parseCssLength(parentStyle.borderLeftWidth);
	const borderTop = parseCssLength(parentStyle.borderTopWidth);
	const borderRight = parseCssLength(parentStyle.borderRightWidth);
	const borderBottom = parseCssLength(parentStyle.borderBottomWidth);

	const paddingLeft = parseCssLength(parentStyle.paddingLeft);
	const paddingTop = parseCssLength(parentStyle.paddingTop);
	const paddingRight = parseCssLength(parentStyle.paddingRight);
	const paddingBottom = parseCssLength(parentStyle.paddingBottom);

	const paddingBox: DOMRect = {
		left: rect.left + borderLeft,
		top: rect.top + borderTop,
		width: Math.max(0, rect.width - borderLeft - borderRight),
		height: Math.max(0, rect.height - borderTop - borderBottom),
		right: rect.right - borderRight,
		bottom: rect.bottom - borderBottom,
		x: 0,
		y: 0,
		toJSON: () => ({}),
	} as DOMRect;

	const contentBox: DOMRect = {
		left: paddingBox.left + paddingLeft,
		top: paddingBox.top + paddingTop,
		width: Math.max(0, paddingBox.width - paddingLeft - paddingRight),
		height: Math.max(0, paddingBox.height - paddingTop - paddingBottom),
		right: paddingBox.right - paddingRight,
		bottom: paddingBox.bottom - paddingBottom,
		x: 0,
		y: 0,
		toJSON: () => ({}),
	} as DOMRect;

	context.save();

	if (hasBackgroundColor) {
		context.fillStyle = resolveCanvasColor(
			pseudoStyle.backgroundColor,
			pseudoStyle,
			'transparent',
		);
		context.beginPath();
		if (hasRadius) {
			pathRoundedRect(context, paddingBox, radii);
		} else {
			context.rect(
				paddingBox.left,
				paddingBox.top,
				paddingBox.width,
				paddingBox.height,
			);
		}

		context.fill();
	}

	// Render image from url() if present
	if (imageUrl) {
		try {
			const resource = await getImage(imageUrl);
			if (resource) {
				context.drawImage(
					resource.image,
					contentBox.left,
					contentBox.top,
					Math.min(contentBox.width, resource.width),
					Math.min(contentBox.height, resource.height),
				);
			}
		} catch {
			// Ignore image loading errors
		}
	}

	// Render text content
	if (text && text.length > 0) {
		const font = buildCanvasFont(pseudoStyle);
		context.font = font;
		context.fillStyle = resolveCanvasColor(
			pseudoStyle.color || parentStyle.color || '#000',
			pseudoStyle,
			parentStyle.color || '#000',
		);

		const fontSize =
			parseCssLength(pseudoStyle.fontSize) ||
			parseCssLength(parentStyle.fontSize) ||
			16;

		const xLeft = contentBox.left;
		const xRight = contentBox.right;
		const yBase = contentBox.top + fontSize;

		const transformedText = applyTextTransform(text, pseudoStyle.textTransform);

		if (position === 'before') {
			context.textAlign = 'left';
			context.textBaseline = 'alphabetic';
			context.fillText(transformedText, xLeft, yBase);
		} else {
			context.textAlign = 'right';
			context.textBaseline = 'alphabetic';
			context.fillText(transformedText, xRight, yBase);
		}
	}

	context.restore();
}

async function renderTextNode(
	node: Text,
	context: CanvasRenderingContext2D,
	env: RenderEnvironment,
): Promise<void> {
	const {textContent} = node;
	if (!textContent) return;

	const parent = node.parentElement;
	if (!parent) return;

	const style = getStyle(parent);
	if (!style || style.visibility === 'hidden' || style.display === 'none') {
		return;
	}

	const scale = env.scale ?? 1;
	const snap = (v: number) => Math.round(v * scale) / scale;
	const snapRect = (r: DOMRect): DOMRect => ({
		left: snap(r.left),
		top: snap(r.top),
		width: snap(r.width),
		height: snap(r.height),
		right: snap(r.right),
		bottom: snap(r.bottom),
		x: snap(r.x),
		y: snap(r.y),
		toJSON: () => ({}),
	});

	const writingMode = style.writingMode || 'horizontal-tb';
	const writingModeString = String(writingMode);
	const isVerticalWritingMode =
		typeof writingModeString === 'string' &&
		/\b(vertical-|sideways-|tb-rl|tb-lr)/.test(writingModeString);

	const whiteSpace = style.whiteSpace || 'normal';

	// Skip pure whitespace nodes only in collapsing white-space modes.
	if (!textContent.trim() && isCollapsingWhiteSpace(whiteSpace)) {
		return;
	}

	context.save();

	// Snap current transform translation to device pixels for crisp text
	const transform = context.getTransform();
	context.setTransform(
		transform.a,
		transform.b,
		transform.c,
		transform.d,
		snap(transform.e),
		snap(transform.f),
	);

	context.font = buildCanvasFont(style);
	context.textBaseline = 'alphabetic';
	// Always use 'left' for textAlign since we calculate exact X positions
	context.textAlign = 'left';

	// Parse text-align for position adjustments
	const textAlignValue = parseTextAlign(style.textAlign);

	// Check for background-clip: text
	const hasTextClip = hasBackgroundClipText(style);
	const backgroundImage = hasTextClip ? style.backgroundImage : null;

	// Set default fill style (will be overridden if using text clip)
	context.fillStyle = resolveCanvasColor(style.color || '#000', style, '#000');

	const textShadows = parseShadowList(style.textShadow, style.color || '#000');
	const strokeWidth = parseCssLength(style.webkitTextStrokeWidth || '0');
	const strokeColor = style.webkitTextStrokeColor || style.color || '#000';

	// Fast path for simple horizontal text without advanced effects. For these
	// cases we can rely on a single DOM range to provide geometry, avoiding the
	// per-grapheme Range + rect work used by the full pipeline.
	const needsFancyText =
		hasTextClip || strokeWidth > 0 || textShadows.length > 1;

	if (!isVerticalWritingMode && !needsFancyText) {
		const range = parent.ownerDocument.createRange();
		range.selectNodeContents(node);
		const rects = range.getClientRects();

		// Treat the simple path as valid only when the DOM reports a single visual
		// line for this text node. Multi-line text falls back to the full
		// grapheme-based pipeline so wrapping and alignment remain correct.
		let firstRect: DOMRect | null = null;
		let nonEmptyCount = 0;
		const rectsLength = rects.length;
		for (let index = 0; index < rectsLength; index++) {
			const candidate = rects[index];
			if (!candidate || candidate.width === 0 || candidate.height === 0) {
				continue;
			}

			nonEmptyCount++;
			if (!firstRect) {
				firstRect = candidate as DOMRect;
			}
		}

		const isSingleVisualLine = nonEmptyCount <= 1;

		if (firstRect && isSingleVisualLine) {
			const docRect = toDocumentRect(parent, firstRect);

			let drawX = docRect.left;
			if (textAlignValue === 'center') {
				context.textAlign = 'center';
				drawX = docRect.left + docRect.width / 2;
			} else if (textAlignValue === 'right' || textAlignValue === 'end') {
				context.textAlign = 'right';
				drawX = docRect.right;
			} else {
				context.textAlign = 'left';
			}

			const fontSize =
				parseCssLength(style.fontSize) ||
				parseCssLength(style.font) || // rough fallback
				16;

			let baselineY = docRect.bottom;
			try {
				if (fontSize > 0 && Number.isFinite(fontSize)) {
					const approximateDescent = fontSize * 0.22;
					baselineY = docRect.bottom - approximateDescent;
				}
			} catch {
				// Ignore failures and fall back to using rect.bottom.
			}

			const transformed = applyTextTransform(textContent, style.textTransform);
			if (transformed) {
				const scale = env.scale ?? 1;
				const snap = (value: number) => Math.round(value * scale) / scale;
				const snappedX = snap(drawX);
				const snappedY = snap(baselineY);
				context.fillText(transformed, snappedX, snappedY);
			}

			range.detach?.();
			context.restore();
			return;
		}

		range.detach?.();
		// Fall through to the full grapheme-based pipeline for multi-line text.
	}

	const originalSegments = segmentGraphemes(textContent);

	// First collect grapheme rects, then group them into larger visual runs so
	// we can draw whole shaped segments at once. This improves support for
	// complex scripts and ligatures compared to per-grapheme rendering.
	interface GraphemeRect {
		text: string;
		rect: DOMRect;
	}
	const graphemeRects: GraphemeRect[] = [];

	const range = parent.ownerDocument.createRange();
	let offset = 0;
	const originalSegmentsLength = originalSegments.length;
	for (let index = 0; index < originalSegmentsLength; index++) {
		const segment = originalSegments[index];
		range.setStart(node, offset);
		range.setEnd(node, offset + segment.length);
		const rects = range.getClientRects();
		const rect = firstNonEmptyRect(rects);
		if (rect) {
			// `getClientRects()` returns viewport-relative geometry. Convert to
			// document coordinates so all text layout uses the same coordinate
			// space as the rest of the renderer (which operates in document
			// coordinates and then normalizes via the root capture transform).
			const docRect = toDocumentRect(parent, rect);
			graphemeRects.push({text: segment, rect: docRect});
		}

		offset += segment.length;
	}

	range.detach?.();

	if (!graphemeRects.length) {
		context.restore();
		return;
	}

	const hasReliableTextGeometry = hasReliableGraphemeGeometry(graphemeRects);

	interface TextRun {
		graphemes: GraphemeRect[];
		rect: DOMRect;
	}
	const runs: TextRun[] = [];

	let currentRun: TextRun | null = null;
	const sameLineThreshold = 0.5;

	const graphemeRectsLength = graphemeRects.length;
	for (let index = 0; index < graphemeRectsLength; index++) {
		const item = graphemeRects[index];
		if (!currentRun) {
			currentRun = {graphemes: [item], rect: item.rect};
		} else {
			const prev = currentRun.rect;
			let sameLine: boolean;

			if (isVerticalWritingMode) {
				// For vertical writing modes (vertical-rl, vertical-lr, sideways-*),
				// lines advance primarily along the X axis instead of Y. Group
				// graphemes whose X positions are nearly equal into the same visual
				// line so that \"VERTICAL\"-style labels are treated as a single
				// vertical run instead of independent stacked letters.
				sameLine =
					Math.abs(prev.left - item.rect.left) <= sameLineThreshold ||
					Math.abs(prev.right - item.rect.right) <= sameLineThreshold;
			} else {
				sameLine =
					Math.abs(prev.bottom - item.rect.bottom) <= sameLineThreshold;
			}

			if (sameLine) {
				currentRun.graphemes.push(item);
				const left = Math.min(prev.left, item.rect.left);
				const right = Math.max(prev.right, item.rect.right);
				const top = Math.min(prev.top, item.rect.top);
				const bottom = Math.max(prev.bottom, item.rect.bottom);
				currentRun.rect = {
					left,
					top,
					width: right - left,
					height: bottom - top,
					right,
					bottom,
					x: 0,
					y: 0,
					toJSON: () => ({}),
				} as DOMRect;
			} else {
				runs.push(currentRun);
				currentRun = {graphemes: [item], rect: item.rect};
			}
		}
	}

	if (currentRun) {
		runs.push(currentRun);
	}

	// Fast-path approximation for vertical writing modes: treat the text node as
	// a single rotated block, using the DOM-provided geometry to position the
	// label. This matches the \"VERTICAL\" card demo closely without
	// re-implementing full vertical line layout.
	if (isVerticalWritingMode) {
		// Compute the overall bounding box for this text node from all grapheme
		// rects so we keep the same visual footprint as the browser layout.
		let minLeft = Infinity;
		let minTop = Infinity;
		let maxRight = -Infinity;
		let maxBottom = -Infinity;
		for (let index = 0; index < graphemeRectsLength; index++) {
			const {rect} = graphemeRects[index];
			if (rect.left < minLeft) minLeft = rect.left;
			if (rect.top < minTop) minTop = rect.top;
			if (rect.right > maxRight) maxRight = rect.right;
			if (rect.bottom > maxBottom) maxBottom = rect.bottom;
		}

		if (
			Number.isFinite(minLeft) &&
			Number.isFinite(minTop) &&
			Number.isFinite(maxRight) &&
			Number.isFinite(maxBottom)
		) {
			const blockCenterX = (minLeft + maxRight) / 2;
			const blockCenterY = (minTop + maxBottom) / 2;

			const fullText = applyTextTransform(textContent, style.textTransform);
			if (fullText) {
				const fontSize =
					parseCssLength(style.fontSize) ||
					parseCssLength(style.font) || // rough fallback
					16;

				const rotateClockwise =
					writingModeString.indexOf('vertical-rl') !== -1 ||
					writingModeString.indexOf('tb-rl') !== -1;

				context.save();
				context.translate(blockCenterX, blockCenterY);
				context.rotate(rotateClockwise ? Math.PI / 2 : -Math.PI / 2);
				context.textAlign = 'center';
				context.textBaseline = 'middle';

				// Approximate vertical baseline by nudging slightly so the visual
				// center matches the DOM result.
				const baselineOffset = fontSize * 0.05;
				const drawX = 0;
				const drawY = baselineOffset;

				context.fillText(fullText, drawX, drawY);
				context.restore();
			}
		}

		context.restore();
		return;
	}

	const letterSpacing = parseSpacingLength(style.letterSpacing);
	const wordSpacing = parseSpacingLength(style.wordSpacing);
	const textIndent = parseSpacingLength(style.textIndent);

	const useSyntheticLayout =
		(!hasReliableTextGeometry || env.flatten3DTransforms) &&
		!isVerticalWritingMode;

	// Group runs by line and apply text-align per line
	if (
		textAlignValue === 'center' ||
		textAlignValue === 'right' ||
		textAlignValue === 'end'
	) {
		const parentRect = snapRect(getLayoutRect(parent));

		// Group runs by line (same Y position within threshold)
		interface LineGroup {
			runs: TextRun[];
			lineTop: number;
			lineBottom: number;
			lineLeft: number;
			lineRight: number;
		}
		const lineGroups: LineGroup[] = [];
		const lineThreshold = 0.5;

		for (let index = 0; index < runs.length; index++) {
			const run = runs[index];
			const runY = run.rect.top + run.rect.height / 2;

			// Find existing line group for this Y position
			let foundGroup: LineGroup | null = null;
			for (let groupIndex = 0; groupIndex < lineGroups.length; groupIndex++) {
				const group = lineGroups[groupIndex];
				const groupY = group.lineTop + (group.lineBottom - group.lineTop) / 2;
				if (Math.abs(groupY - runY) <= lineThreshold) {
					foundGroup = group;
					break;
				}
			}

			if (foundGroup) {
				foundGroup.runs.push(run);
				foundGroup.lineLeft = Math.min(foundGroup.lineLeft, run.rect.left);
				foundGroup.lineRight = Math.max(foundGroup.lineRight, run.rect.right);
				foundGroup.lineTop = Math.min(foundGroup.lineTop, run.rect.top);
				foundGroup.lineBottom = Math.max(
					foundGroup.lineBottom,
					run.rect.bottom,
				);
			} else {
				lineGroups.push({
					runs: [run],
					lineTop: run.rect.top,
					lineBottom: run.rect.bottom,
					lineLeft: run.rect.left,
					lineRight: run.rect.right,
				});
			}
		}

		// Apply text-align offset to each line
		for (let index = 0; index < lineGroups.length; index++) {
			const group = lineGroups[index];
			const lineWidth = group.lineRight - group.lineLeft;
			const containerLeft = parentRect.left;
			const containerRight = parentRect.right;
			const containerWidth = containerRight - containerLeft;

			let offsetX = 0;
			if (textAlignValue === 'center') {
				// Center: align line center to container center
				const lineCenter = group.lineLeft + lineWidth / 2;
				const containerCenter = containerLeft + containerWidth / 2;
				offsetX = containerCenter - lineCenter;
			} else if (textAlignValue === 'right' || textAlignValue === 'end') {
				// Right/End: align line right edge to container right edge
				offsetX = containerRight - group.lineRight;
			}

			// Apply offset to all graphemes in all runs of this line
			for (let runIndex = 0; runIndex < group.runs.length; runIndex++) {
				const run = group.runs[runIndex];
				for (
					let graphemeIndex = 0;
					graphemeIndex < run.graphemes.length;
					graphemeIndex++
				) {
					const grapheme = run.graphemes[graphemeIndex];
					const oldRect = grapheme.rect;
					grapheme.rect = new DOMRect(
						oldRect.left + offsetX,
						oldRect.top,
						oldRect.width,
						oldRect.height,
					);
				}

				// Update run rect
				const oldRunRect = run.rect;
				run.rect = new DOMRect(
					oldRunRect.left + offsetX,
					oldRunRect.top,
					oldRunRect.width,
					oldRunRect.height,
				);
			}
		}
	}

	// Handle background-clip: text separately - draw all text at once for perfect kerning
	if (hasTextClip && backgroundImage && backgroundImage !== 'none') {
		context.save();

		// Flatten all graphemes across all runs
		const allGraphemes: GraphemeRect[] = [];
		const runsLength = runs.length;
		for (let index = 0; index < runsLength; index++) {
			const run = runs[index];
			const graphemesLength = run.graphemes.length;
			for (
				let graphemeIndex = 0;
				graphemeIndex < graphemesLength;
				graphemeIndex++
			) {
				allGraphemes.push(run.graphemes[graphemeIndex]);
			}
		}

		if (allGraphemes.length === 0) {
			context.restore();
			return;
		}

		const parentRect = getLayoutRect(parent);

		// Compute overall text bounds - combine into single loop
		let minLeft = Infinity;
		let minTop = Infinity;
		let maxRight = -Infinity;
		let maxBottom = -Infinity;
		const allGraphemesLength = allGraphemes.length;
		for (let index = 0; index < allGraphemesLength; index++) {
			const grapheme = allGraphemes[index];
			const {rect} = grapheme;
			if (rect.left < minLeft) minLeft = rect.left;
			if (rect.top < minTop) minTop = rect.top;
			if (rect.right > maxRight) maxRight = rect.right;
			if (rect.bottom > maxBottom) maxBottom = rect.bottom;
		}

		const textWidth = Math.max(1, maxRight - minLeft);
		const textHeight = Math.max(1, maxBottom - minTop);

		const relativeLeft = minLeft - parentRect.left;
		const relativeTop = minTop - parentRect.top;

		const scale = env.scale ?? 1;

		const canvasWidth = Math.max(1, Math.ceil(textWidth * scale));
		const canvasHeight = Math.max(1, Math.ceil(textHeight * scale));

		const tempCanvas = document.createElement('canvas');
		tempCanvas.width = canvasWidth;
		tempCanvas.height = canvasHeight;

		const tempContext = tempCanvas.getContext('2d', {
			colorSpace: env.colorSpace,
		});
		if (tempContext) {
			tempContext.imageSmoothingEnabled = true;
			tempContext.scale(scale, scale);

			// Use the exact same font settings as the main context
			tempContext.font = context.font;
			tempContext.textBaseline = 'alphabetic';
			tempContext.textAlign = 'left';

			const fontSize = parseCssLength(style.fontSize) || 16;
			const approximateDescent = fontSize * 0.22;

			// Detect if this is effectively a single visual line
			let minTopForVariation = Infinity;
			let maxTopForVariation = -Infinity;
			let maxBottomForBaseline = -Infinity;
			for (let index = 0; index < allGraphemesLength; index++) {
				const {rect} = allGraphemes[index];
				if (rect.top < minTopForVariation) minTopForVariation = rect.top;
				if (rect.top > maxTopForVariation) maxTopForVariation = rect.top;
				if (rect.bottom > maxBottomForBaseline)
					maxBottomForBaseline = rect.bottom;
			}

			const topVariation = maxTopForVariation - minTopForVariation;
			const isSingleVisualLine = topVariation < fontSize * 0.6;

			if (isSingleVisualLine) {
				// BEST QUALITY PATH – draw the entire text as one string (perfect kerning, ligatures)
				let fullText = '';
				for (let index = 0; index < allGraphemesLength; index++) {
					fullText += applyTextTransform(
						allGraphemes[index].text,
						style.textTransform,
					);
				}

				// Measure actual canvas text width - this can differ from DOM measurements
				// especially for bold fonts where canvas may render wider than DOM reports
				const measuredWidth = tempContext.measureText(fullText).width;
				if (measuredWidth > textWidth) {
					// Resize canvas to accommodate the actual text width
					const newCanvasWidth = Math.max(1, Math.ceil(measuredWidth * scale));
					tempCanvas.width = newCanvasWidth;
					// Restore context state after resize
					tempContext.imageSmoothingEnabled = true;
					tempContext.scale(scale, scale);
					tempContext.font = context.font;
					tempContext.textBaseline = 'alphabetic';
					tempContext.textAlign = 'left';
				}

				// Use the highest bottom for the most accurate baseline
				const baselineY = maxBottomForBaseline - approximateDescent;

				tempContext.fillStyle = '#000';
				tempContext.fillText(fullText, 0, baselineY - minTop);
			} else {
				// FALLBACK for real multi-line text – draw per grapheme
				tempContext.fillStyle = '#000';
				for (let index = 0; index < allGraphemesLength; index++) {
					const item = allGraphemes[index];
					const transformed = applyTextTransform(
						item.text,
						style.textTransform,
					);
					if (transformed) {
						const baselineY = item.rect.bottom - approximateDescent;
						tempContext.fillText(
							transformed,
							item.rect.left - minLeft,
							baselineY - minTop,
						);
					}
				}
			}

			// Apply the background gradient - only parts overlapping the text mask remain
			tempContext.globalCompositeOperation = 'source-in';

			const localEnv: RenderEnvironment = {
				rootElement: parent,
				captureRect: parentRect,
				includeFixed: 'none',
				allElements: env.allElements,
				colorSpace: env.colorSpace,
				scale,
			};

			await renderBackgroundImage(
				tempContext,
				style,
				{
					left: -relativeLeft,
					top: -relativeTop,
					width: parentRect.width,
					height: parentRect.height,
					right: -relativeLeft + parentRect.width,
					bottom: -relativeTop + parentRect.height,
					x: -relativeLeft,
					y: -relativeTop,
					toJSON: () => ({}),
				} as DOMRect,
				{topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0},
				false,
				localEnv,
			);

			// Draw the masked result back at device-pixel precision
			const prevTransform = context.getTransform();
			context.setTransform(1, 0, 0, 1, 0, 0);
			const {captureRect} = env;
			const destX = Math.round((minLeft - captureRect.left) * scale);
			const destY = Math.round((minTop - captureRect.top) * scale);
			context.drawImage(tempCanvas, destX, destY);
			context.setTransform(prevTransform);
		}

		context.restore();
		// Skip normal text rendering - the gradient is now the fill
		context.restore();
		return;
	}

	// Normal text rendering path (no background-clip: text)
	let isFirstRunOnLine = true;

	const runsLength = runs.length;
	for (let index = 0; index < runsLength; index++) {
		const run = runs[index];
		const {rect} = run;

		const fontSize =
			parseCssLength(style.fontSize) ||
			parseCssLength(style.font) || // very rough fallback
			16;

		let baselineY = rect.bottom;

		// Derive a baseline from the DOM line box and the computed font size.
		try {
			if (fontSize > 0 && Number.isFinite(fontSize)) {
				const approximateDescent = fontSize * 0.22;

				if (useSyntheticLayout) {
					// In synthetic layout (flattened 3D), 'rect' is unreliable because it comes
					// from getClientRects() which returns 3D-projected (squashed) coordinates.
					// We must recalculate the true 2D layout position of the parent element.
					const trueParentRect = getUntransformedLayoutRect(parent);

					// Anchor to the bottom of the content box, simulating standard baseline alignment.
					// This matches how the browser positioned the <span> inside the flex container.
					const borderBottom = parseCssLength(style.borderBottomWidth);
					const paddingBottom = parseCssLength(style.paddingBottom);

					baselineY =
						trueParentRect.bottom -
						borderBottom -
						paddingBottom -
						approximateDescent;
				} else {
					baselineY = rect.bottom - approximateDescent;
				}
			}
		} catch {
			// Ignore metric failures
		}

		let cursorX =
			rect.left +
			(useSyntheticLayout && isFirstRunOnLine && textIndent > 0
				? textIndent
				: 0);

		if (useSyntheticLayout) {
			// Re-calculate start X based on the untransformed parent to avoid 3D skew
			const trueParentRect = getUntransformedLayoutRect(parent);
			cursorX =
				trueParentRect.left +
				parseCssLength(style.borderLeftWidth) +
				parseCssLength(style.paddingLeft);
		}

		const approximateCharWidth =
			fontSize > 0 && Number.isFinite(fontSize) ? fontSize * 0.6 : 10;

		const graphemesLength = run.graphemes.length;
		for (
			let graphemeIndex = 0;
			graphemeIndex < graphemesLength;
			graphemeIndex++
		) {
			const item = run.graphemes[graphemeIndex];
			const graphemeRect = item.rect;
			let textX = graphemeRect.left;
			const drawText = applyTextTransform(item.text, style.textTransform);
			if (!drawText) continue;

			if (useSyntheticLayout) {
				textX = cursorX;
			}

			const textY = baselineY;

			if (textShadows.length) {
				const textShadowsLength = textShadows.length;
				for (
					let shadowIndex = 0;
					shadowIndex < textShadowsLength;
					shadowIndex++
				) {
					const shadow = textShadows[shadowIndex];
					if (shadow.inset) continue;
					context.save();
					context.shadowColor = resolveCanvasColor(
						shadow.color,
						style,
						style.color || '#000',
					);
					context.shadowBlur = shadow.blur;
					context.shadowOffsetX = shadow.offsetX;
					context.shadowOffsetY = shadow.offsetY;
					context.fillText(drawText, textX, textY);
					context.restore();
				}
			}

			if (strokeWidth > 0) {
				context.save();
				context.lineWidth = strokeWidth * 2;
				context.strokeStyle = resolveCanvasColor(
					strokeColor,
					style,
					style.color || '#000',
				);
				context.strokeText(drawText, textX, textY);
				context.restore();
			}

			// Normal text fill
			context.fillText(drawText, textX, textY);

			if (useSyntheticLayout) {
				const text = drawText;
				const isWordSeparator = /\s/u.test(text);

				let width = 0;
				try {
					const measure = context.measureText(text);
					if (measure && typeof measure.width === 'number') {
						width = measure.width;
					} else {
						width = approximateCharWidth * text.length;
					}
				} catch {
					width = approximateCharWidth * text.length;
				}

				let advance = width + letterSpacing;
				if (isWordSeparator && wordSpacing !== 0) {
					advance += wordSpacing;
				}

				if (!Number.isFinite(advance) || advance <= 0) {
					advance = approximateCharWidth;
				}

				cursorX += advance;
			}
		}

		isFirstRunOnLine = false;

		drawTextDecorations(context, style, rect);
	}

	context.restore();
}

function drawTextDecorations(
	context: CanvasRenderingContext2D,
	style: CSSStyleDeclaration,
	rect: DOMRect,
): void {
	const decorationLine = style.textDecorationLine;
	if (!decorationLine || decorationLine === 'none') return;

	const color = style.textDecorationColor || style.color || '#000';
	const thickness = 1;
	const {left} = rect;
	const {width} = rect;

	context.save();
	context.fillStyle = color;

	const writingMode = style.writingMode || 'horizontal-tb';
	const mode = String(writingMode);
	const isVertical =
		typeof mode === 'string' &&
		/\b(vertical-|sideways-|tb-rl|tb-lr)/.test(mode);

	if (!isVertical) {
		// Horizontal text: draw lines along the x-axis.
		if (decorationLine.includes('underline')) {
			const decorationY = rect.bottom - thickness;
			context.fillRect(left, decorationY, width, thickness);
		}

		if (decorationLine.includes('overline')) {
			const decorationY = rect.top;
			context.fillRect(left, decorationY, width, thickness);
		}

		if (decorationLine.includes('line-through')) {
			const decorationY = rect.top + rect.height / 2 - thickness / 2;
			context.fillRect(left, decorationY, width, thickness);
		}
	} else {
		// Vertical text: approximate decorations as vertical bars along the y-axis.
		const {top} = rect;
		const {height} = rect;

		if (decorationLine.includes('underline')) {
			// Logical "end" side: approximate as right edge.
			const decorationX = rect.right - thickness;
			context.fillRect(decorationX, top, thickness, height);
		}

		if (decorationLine.includes('overline')) {
			// Logical "start" side: approximate as left edge.
			const decorationX = rect.left;
			context.fillRect(decorationX, top, thickness, height);
		}

		if (decorationLine.includes('line-through')) {
			const decorationX = rect.left + rect.width / 2 - thickness / 2;
			context.fillRect(decorationX, top, thickness, height);
		}
	}

	context.restore();
}

function firstNonEmptyRect(rects: DOMRectList | DOMRect[]): DOMRect | null {
	const rectsArray = Array.from(rects);
	const rectsLength = rectsArray.length;
	for (let index = 0; index < rectsLength; index++) {
		const rect = rectsArray[index];
		if (rect.width !== 0 && rect.height !== 0) {
			return rect;
		}
	}

	return null;
}

function parseCssLength(value: string | null | undefined): number {
	if (!value) return 0;
	const trimmed = value.trim();
	if (!trimmed) return 0;

	// Best-effort length parsing for computed styles. This intentionally does not
	// implement full calc() evaluation – it only handles the simple
	// calc(<number><unit>) shape so that values like `calc(10px)` degrade to the
	// underlying numeric component. More complex expressions will fall back to 0
	// and are expected to be rare for the geometry we approximate here.
	const calcMatch = trimmed.match(/^calc\(([-+]?\d*\.?\d+)([a-z%]+)?\)$/i);
	if (calcMatch) {
		const numeric = parseFloat(calcMatch[1]);
		return Number.isFinite(numeric) ? numeric : 0;
	}

	const number = parseFloat(trimmed);
	return Number.isFinite(number) ? number : 0;
}

function hasReliableGraphemeGeometry(graphemes: {rect: DOMRect}[]): boolean {
	if (graphemes.length <= 1) {
		return true;
	}

	const first = graphemes[0].rect;
	const epsilon = 0.5;

	for (let index = 1; index < graphemes.length; index++) {
		const {rect} = graphemes[index];
		const sameLeft = Math.abs(rect.left - first.left) < epsilon;
		const sameTop = Math.abs(rect.top - first.top) < epsilon;
		const sameRight = Math.abs(rect.right - first.right) < epsilon;
		const sameBottom = Math.abs(rect.bottom - first.bottom) < epsilon;

		if (!sameLeft || !sameTop || !sameRight || !sameBottom) {
			return true;
		}
	}

	return false;
}

function parseSpacingLength(value: string | null | undefined): number {
	if (!value) return 0;
	const trimmed = value.trim();
	if (!trimmed || trimmed === 'normal') {
		return 0;
	}

	const parsed = parseCssLength(trimmed);
	return Number.isFinite(parsed) ? parsed : 0;
}

function parseLineHeight(
	value: string | null | undefined,
	fontSize: number,
): number {
	const fallback = fontSize * 1.2;
	if (!value || value === 'normal') {
		return fallback;
	}

	const trimmed = value.trim();
	if (!trimmed) return fallback;

	if (trimmed.endsWith('%')) {
		const numeric = parseFloat(trimmed);
		if (Number.isFinite(numeric)) {
			return fontSize * (numeric / 100);
		}

		return fallback;
	}

	const numeric = parseFloat(trimmed);
	if (!Number.isFinite(numeric)) {
		return fallback;
	}

	// Unitless values are multipliers on the font size per the CSS spec.
	if (/^-?\d*\.?\d+$/.test(trimmed)) {
		return fontSize * numeric;
	}

	// Otherwise treat the numeric part as an absolute length in CSS pixels.
	return numeric;
}

function parseTextAlign(
	value: string | null | undefined,
): 'left' | 'right' | 'center' | 'start' | 'end' {
	if (!value) return 'left';

	const trimmed = value.trim().toLowerCase();
	switch (trimmed) {
		case 'left':
			return 'left';
		case 'right':
			return 'right';
		case 'center':
			return 'center';
		case 'justify':
			// Canvas doesn't support justify, fallback to left
			return 'left';
		case 'start':
			// Default to left for LTR (could be enhanced with direction detection)
			return 'left';
		case 'end':
			// Default to right for LTR (could be enhanced with direction detection)
			return 'right';
		default:
			return 'left';
	}
}

function buildCanvasFont(style: CSSStyleDeclaration): string {
	const fontStyle = style.fontStyle || 'normal';
	const fontVariant = style.fontVariant || 'normal';
	const fontWeight = style.fontWeight || 'normal';
	const fontSize = style.fontSize || '16px';
	const fontFamily = style.fontFamily || 'sans-serif';
	return `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize} ${fontFamily}`;
}

function computeBackgroundSize(
	value: string,
	boxWidth: number,
	boxHeight: number,
	imageWidth: number,
	imageHeight: number,
): [number, number] {
	let drawWidth = imageWidth;
	let drawHeight = imageHeight;

	const trimmed = value.trim();
	if (trimmed === 'cover' || trimmed === 'contain') {
		const scaleX = boxWidth / imageWidth;
		const scaleY = boxHeight / imageHeight;
		const scale =
			trimmed === 'cover' ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY);
		drawWidth = imageWidth * scale;
		drawHeight = imageHeight * scale;
		return [drawWidth, drawHeight];
	}

	const tokens = trimmed.split(/\s+/).filter(Boolean);
	if (!tokens.length || tokens[0] === 'auto') {
		return [drawWidth, drawHeight];
	}

	const widthToken = tokens[0];
	const heightToken = tokens[1] ?? 'auto';

	let widthAuto = false;
	let heightAuto = false;

	if (widthToken === 'auto') {
		widthAuto = true;
	}

	if (heightToken === 'auto') {
		heightAuto = true;
	}

	if (!widthAuto) {
		drawWidth = computeBackgroundSizeComponent(
			widthToken,
			boxWidth,
			imageWidth,
		);
	}

	if (!heightAuto) {
		drawHeight = computeBackgroundSizeComponent(
			heightToken,
			boxHeight,
			imageHeight,
		);
	}

	if (!widthAuto && heightAuto) {
		drawHeight = (drawWidth * imageHeight) / imageWidth;
	} else if (widthAuto && !heightAuto) {
		drawWidth = (drawHeight * imageWidth) / imageHeight;
	}

	return [drawWidth, drawHeight];
}

function computeBackgroundSizeComponent(
	token: string,
	boxSize: number,
	imageSize: number,
): number {
	if (token.endsWith('%')) {
		const percent = parseFloat(token);
		if (Number.isFinite(percent)) {
			return (percent / 100) * boxSize;
		}
	}

	const length = parseCssLength(token);
	if (length !== 0) {
		return length;
	}

	return imageSize;
}

function computeBackgroundPosition(
	value: string,
	boxWidth: number,
	boxHeight: number,
	drawWidth: number,
	drawHeight: number,
): [number, number] {
	const tokens = value.split(/\s+/).filter(Boolean);

	// Fast path for the common 1–2 token cases like "center" or "10% 20%".
	if (tokens.length <= 2) {
		let xToken = tokens[0] ?? '0%';
		let yToken = tokens[1] ?? '0%';

		// Normalize simple keywords.
		if (xToken === 'left') xToken = '0%';
		else if (xToken === 'center') xToken = '50%';
		else if (xToken === 'right') xToken = '100%';

		if (yToken === 'top') yToken = '0%';
		else if (yToken === 'center') yToken = '50%';
		else if (yToken === 'bottom') yToken = '100%';

		const offsetX = computeBackgroundPositionComponent(
			xToken,
			boxWidth,
			drawWidth,
		);
		const offsetY = computeBackgroundPositionComponent(
			yToken,
			boxHeight,
			drawHeight,
		);

		return [offsetX, offsetY];
	}

	const isLengthOrPercent = (token: string): boolean =>
		/^-?\d*\.?\d+(%|px|em|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc)?$/.test(token);

	const horizontalKeywords = new Set(['left', 'center', 'right']);
	const verticalKeywords = new Set(['top', 'center', 'bottom']);

	const hTokens: string[] = [];
	const vTokens: string[] = [];
	const lengthTokens: string[] = [];

	const tokensLength = tokens.length;
	for (let index = 0; index < tokensLength; index++) {
		const token = tokens[index];
		if (horizontalKeywords.has(token)) {
			hTokens.push(token);
		} else if (verticalKeywords.has(token)) {
			vTokens.push(token);
		} else if (isLengthOrPercent(token)) {
			lengthTokens.push(token);
		}
	}

	const xKeyword = hTokens[0] ?? (vTokens.length ? 'center' : 'left');
	const yKeyword = vTokens[0] ?? (hTokens.length ? 'center' : 'top');

	let xOffsetToken: string | null = null;
	let yOffsetToken: string | null = null;

	if (lengthTokens.length === 1) {
		// Assign the single length to the axis that has an explicit keyword.
		if (hTokens.length) {
			xOffsetToken = lengthTokens[0];
		} else {
			yOffsetToken = lengthTokens[0];
		}
	} else if (lengthTokens.length >= 2) {
		xOffsetToken = lengthTokens[0];
		yOffsetToken = lengthTokens[1];
	}

	const offsetX = computeBackgroundAxisOffset(
		xKeyword,
		xOffsetToken,
		boxWidth,
		drawWidth,
	);
	const offsetY = computeBackgroundAxisOffset(
		yKeyword,
		yOffsetToken,
		boxHeight,
		drawHeight,
	);

	return [offsetX, offsetY];
}

function computeBackgroundPositionComponent(
	token: string,
	boxSize: number,
	drawSize: number,
): number {
	if (token.endsWith('%')) {
		const percent = parseFloat(token);
		if (Number.isFinite(percent)) {
			return (percent / 100) * (boxSize - drawSize);
		}
	}

	const length = parseCssLength(token);
	if (length !== 0) {
		return length;
	}

	// Default to 0% if parsing fails.
	return 0;
}

function computeBackgroundAxisOffset(
	keyword: string,
	offsetToken: string | null,
	boxSize: number,
	drawSize: number,
): number {
	const base =
		keyword === 'center'
			? (boxSize - drawSize) / 2
			: keyword === 'right' || keyword === 'bottom'
				? boxSize - drawSize
				: 0;

	if (!offsetToken) {
		return base;
	}

	// Percentages for offsets are interpreted relative to the free space.
	if (offsetToken.endsWith('%')) {
		const percent = parseFloat(offsetToken);
		if (Number.isFinite(percent)) {
			const delta = (percent / 100) * (boxSize - drawSize);
			return keyword === 'right' || keyword === 'bottom'
				? base - delta
				: base + delta;
		}
	}

	const length = parseCssLength(offsetToken);
	if (!Number.isFinite(length) || length === 0) {
		return base;
	}

	return keyword === 'right' || keyword === 'bottom'
		? base - length
		: base + length;
}

function parseShadowList(
	value: string | null | undefined,
	fallbackColor: string,
): ParsedShadow[] {
	if (!value || value === 'none') return [];

	const layers = splitLayers(value);
	const result: ParsedShadow[] = [];

	const layersLength = layers.length;
	for (let index = 0; index < layersLength; index++) {
		const layer = layers[index];
		const parsed = parseSingleShadow(layer, fallbackColor);
		if (parsed) {
			result.push(parsed);
		}
	}

	return result;
}

function splitLayers(value: string): string[] {
	const result: string[] = [];
	let current = '';
	let depth = 0;

	for (let index = 0; index < value.length; index++) {
		const character = value[index];
		if (character === '(') {
			depth++;
			current += character;
		} else if (character === ')') {
			depth = Math.max(0, depth - 1);
			current += character;
		} else if (character === ',' && depth === 0) {
			if (current.trim()) {
				result.push(current.trim());
			}

			current = '';
		} else {
			current += character;
		}
	}

	if (current.trim()) {
		result.push(current.trim());
	}

	return result;
}

function isShadowLengthToken(token: string): boolean {
	const trimmed = token.trim();
	if (!trimmed) return false;

	// Allow bare zero, which is valid without a unit.
	if (trimmed === '0' || trimmed === '0.0') return true;

	// Basic CSS length syntax including negatives and decimals. For non‑zero
	// values we require an explicit unit so that bare numbers inside modern color
	// syntaxes such as `rgb(0 0 0 / 0.5)` are not misclassified as shadow
	// offsets or blur radii.
	return /^-?\d*\.?\d+(px|em|rem|ex|ch|vw|vh|vmin|vmax|cm|mm|in|pt|pc|%)$/.test(
		trimmed,
	);
}

function parseSingleShadow(
	layer: string,
	fallbackColor: string,
): ParsedShadow | null {
	// Split by whitespace, but keep function arguments (e.g. rgba(), color())
	// together so that spaces inside color functions do not break parsing.
	const partsRaw = gradientSplit(layer.trim(), /\s+/);
	const parts: string[] = [];
	for (let index = 0; index < partsRaw.length; index++) {
		const part = partsRaw[index];
		if (part) parts.push(part);
	}

	if (!parts.length) return null;

	let inset = false;
	const lengthTokens: string[] = [];
	const colorParts: string[] = [];

	const partsLength = parts.length;
	for (let index = 0; index < partsLength; index++) {
		const part = parts[index];
		if (part === 'inset') {
			inset = true;
			continue;
		}

		if (isShadowLengthToken(part)) {
			lengthTokens.push(part);
			continue;
		}

		colorParts.push(part);
	}

	if (lengthTokens.length < 2) {
		return null;
	}

	const offsetX = parseCssLength(lengthTokens[0]);
	const offsetY = parseCssLength(lengthTokens[1]);
	const blur = lengthTokens[2] ? parseCssLength(lengthTokens[2]) : 0;
	const spread = lengthTokens[3] ? parseCssLength(lengthTokens[3]) : 0;

	const color = colorParts.length > 0 ? colorParts.join(' ') : fallbackColor;

	return {
		inset,
		offsetX,
		offsetY,
		blur,
		spread,
		color,
	};
}

function isCollapsingWhiteSpace(whiteSpace: string): boolean {
	// See CSS Text spec: "normal", "nowrap" and "pre-line" collapse white space.
	// Other values such as "pre", "pre-wrap" and "break-spaces" preserve it.
	switch (whiteSpace) {
		case 'normal':
		case 'nowrap':
		case 'pre-line':
			return true;
		// Treat initial/inherit/unset as collapsing here, by the time we see a
		// computed style they should typically have been resolved, but this is a
		// safe fallback matching common expectations.
		case 'initial':
		case 'inherit':
		case 'unset':
			return true;
		case 'pre':
		case 'pre-wrap':
		case 'break-spaces':
		default:
			return false;
	}
}

function applyTextTransform(
	text: string,
	transform: string | null | undefined,
): string {
	if (!transform || transform === 'none') {
		return text;
	}

	switch (transform) {
		case 'uppercase':
			return text.toUpperCase();
		case 'lowercase':
			return text.toLowerCase();
		case 'capitalize':
			return text.replace(/\b(\p{L})/gu, (character) =>
				character.toUpperCase(),
			);
		default:
			return text;
	}
}

function hasBackgroundClipText(style: CSSStyleDeclaration): boolean {
	const clipRawParts: string[] = [];

	if (style.backgroundClip) {
		clipRawParts.push(style.backgroundClip);
	}

	// Safely check for vendor-prefixed background-clip
	const webkitClip = style.getPropertyValue('-webkit-background-clip');
	if (webkitClip) {
		clipRawParts.push(webkitClip);
	}

	if (clipRawParts.length) {
		const parts = clipRawParts
			.join(',')
			.split(',')
			.map((part) => part.trim().toLowerCase());

		if (parts.some((part) => part === 'text' || part === '-webkit-text')) {
			return true;
		}
	}

	// Fallback heuristic for the common WebKit gradient-text pattern:
	//   - background-image is set
	//   - -webkit-text-fill-color is fully transparent
	const bgImage = style.backgroundImage;

	// Use getPropertyValue to correctly read the vendor prefixed CSS property
	const webkitTextFill =
		style.webkitTextFillColor ||
		style.getPropertyValue('-webkit-text-fill-color');

	if (!bgImage || bgImage === 'none' || !webkitTextFill) {
		return false;
	}

	const normalized = webkitTextFill.replace(/\s+/g, '').toLowerCase();
	if (
		normalized === 'transparent' ||
		normalized === 'rgba(0,0,0,0)' ||
		normalized === 'hsla(0,0%,0%,0)'
	) {
		return true;
	}

	return false;
}

/**
 * Renders a texture using WebGL to achieve true perspective correctness.
 * Uses DOMMatrix to ensure 1:1 compatibility with CSS transforms.
 * @param texturePadding - Padding around the content in the texture (default 0)
 */
function renderTextureWithPerspective(
	destinationContext: CanvasRenderingContext2D,
	sourceImage: HTMLCanvasElement,
	rect: DOMRect,
	env: RenderEnvironment,
	visualRect: DOMRect, // Browser's actual bounding rect
	texturePadding: number = 0, // Padding around content in texture
	browserCorners?: Array<{x: number; y: number; w?: number}>, // Updated to accept W
): void {
	const {captureRect, scale = 1, rootElement} = env;
	const ownerDocument =
		destinationContext.canvas.ownerDocument ||
		rootElement.ownerDocument ||
		document;

	const glCanvas = ownerDocument.createElement('canvas');
	// Use high-precision context
	const gl = glCanvas.getContext('webgl', {
		premultipliedAlpha: true,
		preserveDrawingBuffer: true,
		antialias: true,
	});

	if (!gl) return;

	// VERTEX SHADER
	const vertShaderSource = `
    attribute vec3 a_position; // x, y, w
    attribute vec2 a_texCoord;
  
    uniform mat4 u_matrix;
    uniform vec2 u_resolution;
    uniform vec2 u_offset;
  
    varying vec2 v_texCoord;
  
    void main() {
      // Use the W component passed from JS (or default to 1.0)
      float w = a_position.z > 0.0 ? a_position.z : 1.0;
      
      // Standard 2D transform (u_matrix is identity here usually)
      vec4 pos = u_matrix * vec4(a_position.xy, 0.0, 1.0);
      
      // Apply offset
      pos.xy = pos.xy + u_offset;
  
      // Convert CSS pixels to clip space [-1, 1]
      // We essentially "undo" the perspective division by multiplying by W
      // so that when the GPU divides by W later, it lands back on our calculated pixel.
      float x = ((pos.x / u_resolution.x) * 2.0 - 1.0) * w;
      float y = ((1.0 - (pos.y / u_resolution.y)) * 2.0 - 1.0) * w;
  
      // Output with W component. 
      // The GPU will perform (x/w, y/w) interpolation for the pixels,
      // but use W for correct texture mapping.
      gl_Position = vec4(x, y, 0.0, w);
      v_texCoord = a_texCoord;
    }
    `;

	const fragShaderSource = `
      precision mediump float;
      varying vec2 v_texCoord;
      uniform sampler2D u_texture;
  
      void main() {
        vec4 color = texture2D(u_texture, v_texCoord);
        gl_FragColor = vec4(color.rgb * color.a, color.a);
      }
    `;

	const compileShader = (src: string, type: number) => {
		const shader = gl.createShader(type)!;
		gl.shaderSource(shader, src);
		gl.compileShader(shader);
		return shader;
	};

	const program = gl.createProgram()!;
	gl.attachShader(program, compileShader(vertShaderSource, gl.VERTEX_SHADER));
	gl.attachShader(program, compileShader(fragShaderSource, gl.FRAGMENT_SHADER));
	gl.linkProgram(program);
	gl.useProgram(program);

	// 1. Define the geometry (positions)

	const cssWidth = rect.width;
	const cssHeight = rect.height;
	let positions: Float32Array;

	// Use explicit corners if provided (Correct 3D Path)
	if (browserCorners && browserCorners.length === 4) {
		console.log(browserCorners);
		const [p1, p2, p3, p4] = browserCorners;
		// We pass X, Y, and W (depth/scale factor)
		const w1 = p1.w || 1;
		const w2 = p2.w || 1;
		const w3 = p3.w || 1;
		const w4 = p4.w || 1;

		positions = new Float32Array([
			p1.x,
			p1.y,
			w1,
			p2.x,
			p2.y,
			w2,
			p4.x,
			p4.y,
			w4,
			p4.x,
			p4.y,
			w4,
			p2.x,
			p2.y,
			w2,
			p3.x,
			p3.y,
			w3,
		]);
	} else {
		// Fallback: use axis-aligned visualRect (W = 1)
		const left = visualRect.left - captureRect.left;
		const top = visualRect.top - captureRect.top;
		const right = visualRect.right - captureRect.left;
		const bottom = visualRect.bottom - captureRect.top;
		const w = 1;

		positions = new Float32Array([
			left,
			top,
			w,
			right,
			top,
			w,
			left,
			bottom,
			w,
			left,
			bottom,
			w,
			right,
			top,
			w,
			right,
			bottom,
			w,
		]);
	}

	// 2. Define the texture coordinates

	let texCoords: Float32Array;
	if (texturePadding > 0) {
		const textureWidth = cssWidth + texturePadding * 2;
		const textureHeight = cssHeight + texturePadding * 2;

		// Slight inset to avoid bleeding edges
		const inset = 0;
		const texLeft = (texturePadding + inset) / textureWidth;
		const texTop = (texturePadding + inset) / textureHeight;
		const texRight = (cssWidth + texturePadding - inset) / textureWidth;
		const texBottom = (cssHeight + texturePadding - inset) / textureHeight;

		texCoords = new Float32Array([
			texLeft,
			texTop,
			texRight,
			texTop,
			texLeft,
			texBottom,
			texLeft,
			texBottom,
			texRight,
			texTop,
			texRight,
			texBottom,
		]);
	} else {
		texCoords = new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]);
	}

	// Buffers
	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
	const positionLocation = gl.getAttribLocation(program, 'a_position');
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

	const texCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
	const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
	gl.enableVertexAttribArray(texCoordLocation);
	gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

	// Texture
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		sourceImage,
	);

	gl.enable(gl.BLEND);
	gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

	// Viewport & Draw
	const viewportW = Math.ceil(captureRect.width * scale);
	const viewportH = Math.ceil(captureRect.height * scale);

	glCanvas.width = viewportW;
	glCanvas.height = viewportH;
	gl.viewport(0, 0, viewportW, viewportH);

	const uResolution = gl.getUniformLocation(program, 'u_resolution');
	const uMatrix = gl.getUniformLocation(program, 'u_matrix');
	const uOffset = gl.getUniformLocation(program, 'u_offset');
	const uZOffset = gl.getUniformLocation(program, 'u_zOffset');

	gl.uniform2f(uResolution, captureRect.width, captureRect.height);

	const identityMatrix = new Float32Array([
		1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
	]);

	gl.uniformMatrix4fv(uMatrix, false, identityMatrix);
	gl.uniform2f(uOffset, 0, 0);
	gl.uniform1f(uZOffset, 0);

	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLES, 0, 6);

	destinationContext.save();
	destinationContext.setTransform(1, 0, 0, 1, 0, 0);
	destinationContext.drawImage(glCanvas, 0, 0);
	destinationContext.restore();
}

// Safari / legacy Canvas2D `context.filter` polyfill. Some browsers do not implement the Canvas2D
// `filter` property. `screenshot` relies on this API to approximate
// CSS `filter` and `backdrop-filter`. To keep this package dependency-free,
// we ship a lightweight, in-place polyfill here

declare global {
	// Internal scratch slot used by the polyfill. Kept non-enumerable.
	interface CanvasRenderingContext2D {
		_filterPolyfillValue?: string;
	}
}

type Filter = (context: CanvasRenderingContext2D, ...options: string[]) => void;

type RgbaTransform = (
	red: number,
	green: number,
	blue: number,
	alpha: number,
) => [number, number, number, number];

const FILTERS: {[name: string]: Filter} = {
	none() {
		// no-op
	},

	blur(context, radius = '0') {
		const amount = normalizeLength(radius);
		if (amount <= 0) return;
		applyBoxBlur(context, amount);
	},

	brightness(context, value = '1') {
		const factor = normalizeNumberPercentage(value);
		if (!Number.isFinite(factor) || factor === 1) return;

		adjustRgb(context, (red, green, blue, alpha) => [
			clampColor(red * factor),
			clampColor(green * factor),
			clampColor(blue * factor),
			alpha,
		]);
	},

	contrast(context, value = '1') {
		const factor = normalizeNumberPercentage(value);
		if (!Number.isFinite(factor) || factor === 1) return;

		const contrastFactor = factor;
		const intercept = 128 * (1 - contrastFactor);

		adjustRgb(context, (red, green, blue, alpha) => [
			clampColor(red * contrastFactor + intercept),
			clampColor(green * contrastFactor + intercept),
			clampColor(blue * contrastFactor + intercept),
			alpha,
		]);
	},

	grayscale(context, value = '1') {
		const amount = normalizeNumberPercentage(value);
		if (!Number.isFinite(amount) || amount <= 0) return;

		adjustRgb(context, (red, green, blue, alpha) => {
			const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
			const neutralRed = clampColor(luminance);
			const neutralGreen = clampColor(luminance);
			const neutralBlue = clampColor(luminance);

			return [
				clampColor(red + (neutralRed - red) * amount),
				clampColor(green + (neutralGreen - green) * amount),
				clampColor(blue + (neutralBlue - blue) * amount),
				alpha,
			];
		});
	},

	invert(context, value = '1') {
		const amount = normalizeNumberPercentage(value);
		if (!Number.isFinite(amount) || amount <= 0) return;

		adjustRgb(context, (red, green, blue, alpha) => [
			clampColor(red + (255 - red - red) * amount),
			clampColor(green + (255 - green - green) * amount),
			clampColor(blue + (255 - blue - blue) * amount),
			alpha,
		]);
	},

	opacity(context, value = '1') {
		const amount = normalizeNumberPercentage(value);
		if (!Number.isFinite(amount) || amount >= 1) return;

		adjustRgb(context, (red, green, blue, alpha) => [
			red,
			green,
			blue,
			clampColor(alpha * amount),
		]);
	},

	saturate(context, value = '1') {
		const amount = normalizeNumberPercentage(value);
		if (!Number.isFinite(amount) || amount === 1) return;

		adjustRgb(context, (red, green, blue, alpha) => {
			// Convert to grayscale using luminance weights
			const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
			return [
				clampColor(luminance + (red - luminance) * amount),
				clampColor(luminance + (green - luminance) * amount),
				clampColor(luminance + (blue - luminance) * amount),
				alpha,
			];
		});
	},

	sepia(context, value = '1') {
		const amount = normalizeNumberPercentage(value);
		if (!Number.isFinite(amount) || amount <= 0) return;

		// Standard sepia matrix coefficients
		adjustRgb(context, (red, green, blue, alpha) => {
			const sepiaRed = 0.393 * red + 0.769 * green + 0.189 * blue;
			const sepiaGreen = 0.349 * red + 0.686 * green + 0.168 * blue;
			const sepiaBlue = 0.272 * red + 0.534 * green + 0.131 * blue;

			return [
				clampColor(red + (sepiaRed - red) * amount),
				clampColor(green + (sepiaGreen - green) * amount),
				clampColor(blue + (sepiaBlue - blue) * amount),
				alpha,
			];
		});
	},

	'hue-rotate'(context, value = '0deg') {
		// Parse angle value (supports deg, rad, turn, grad)
		let angle = 0;
		const match = value.match(/^(-?\d*\.?\d+)(deg|rad|turn|grad)?$/i);
		if (match) {
			const num = parseFloat(match[1]);
			const unit = (match[2] || 'deg').toLowerCase();
			switch (unit) {
				case 'rad':
					angle = num;
					break;
				case 'turn':
					angle = num * 2 * Math.PI;
					break;
				case 'grad':
					angle = num * (Math.PI / 200);
					break;
				default: // deg
					angle = num * (Math.PI / 180);
			}
		}

		if (angle === 0) return;

		// Hue rotation matrix coefficients
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);

		adjustRgb(context, (red, green, blue, alpha) => {
			// Hue rotation matrix per CSS filter spec
			return [
				clampColor(
					red * (0.213 + 0.787 * cos - 0.213 * sin) +
						green * (0.715 - 0.715 * cos - 0.715 * sin) +
						blue * (0.072 - 0.072 * cos + 0.928 * sin),
				),
				clampColor(
					red * (0.213 - 0.213 * cos + 0.143 * sin) +
						green * (0.715 + 0.285 * cos + 0.14 * sin) +
						blue * (0.072 - 0.072 * cos - 0.283 * sin),
				),
				clampColor(
					red * (0.213 - 0.213 * cos - 0.787 * sin) +
						green * (0.715 - 0.715 * cos + 0.715 * sin) +
						blue * (0.072 + 0.928 * cos + 0.072 * sin),
				),
				alpha,
			];
		});
	},

	// drop-shadow requires more complex implementation with convolution
	'drop-shadow': () => {},
};

// Firefox detection for filter polyfill - Firefox's native canvas filter has bugs
// with display-p3 colorSpace (e.g., sepia produces blue instead of brown)
const isFirefoxForPolyfill =
	typeof navigator !== 'undefined' && /firefox/i.test(navigator.userAgent);

function installCanvasFilterPolyfillIfNeeded(): void {
	if (typeof window === 'undefined') {
		// Server / non-DOM environment
		return;
	}

	const Canvas2D = window.CanvasRenderingContext2D as
		| typeof CanvasRenderingContext2D
		| undefined;

	if (!Canvas2D) {
		return;
	}

	const {prototype} = Canvas2D;

	// Native support present – nothing to do, unless we're in Firefox where the
	// native filter implementation has bugs with display-p3 colorSpace.
	// Some browsers (Chrome) expose `filter` as an accessor with a native getter
	// that throws if invoked with the wrong receiver, so we must avoid reading
	// `proto.filter` directly.
	if (!isFirefoxForPolyfill) {
		try {
			const descriptor = Object.getOwnPropertyDescriptor(prototype, 'filter');
			if (
				descriptor &&
				(typeof descriptor.value === 'string' ||
					typeof descriptor.get === 'function')
			) {
				return;
			}
		} catch {
			// Ignore and fall through to our polyfill if we can't safely inspect
			// the property.
		}
	}

	const defaultFilter = 'none';

	// Internal storage for the current filter string.
	Object.defineProperty(prototype, '_filterPolyfillValue', {
		configurable: true,
		enumerable: false,
		writable: true,
		value: defaultFilter,
	});

	// Define the `filter` property so code can freely read/write it.
	Object.defineProperty(prototype, 'filter', {
		configurable: true,
		enumerable: true,
		get(this: CanvasRenderingContext2D) {
			return this._filterPolyfillValue ?? defaultFilter;
		},
		set(this: CanvasRenderingContext2D, value: string) {
			this._filterPolyfillValue =
				typeof value === 'string' && value.trim() ? value : defaultFilter;
		},
	});

	// Store the original drawImage function. We need to use Function type
	// to handle the overloaded signatures properly.
	const originalDrawImage = prototype.drawImage as (
		image: CanvasImageSource,
		...args: number[]
	) => void;

	// Patch `drawImage` so that, when a filter is active, we draw into a
	// temporary offscreen canvas, apply the filter there, and then draw the
	// filtered result into the real context. This approximates the behavior of
	// the native Canvas2D filter pipeline and works well with the way
	// `screenshot` uses filters (mostly for layer compositing and
	// backdrop sampling).
	prototype.drawImage = function patchedDrawImage(
		this: CanvasRenderingContext2D,
		image: CanvasImageSource,
		...args: number[]
	): void {
		const filter = this._filterPolyfillValue;

		if (!filter || filter === 'none') {
			originalDrawImage.call(this, image, ...args);
			return;
		}

		const size = getCanvasImageSourceSize(image);
		if (!size) {
			originalDrawImage.call(this, image, ...args);
			return;
		}

		// Parse the blur radius to determine necessary padding
		let padding = 0;
		const blurMatch = filter.match(/blur\(\s*(-?\d*\.?\d+)(px)?\s*\)/i);
		if (blurMatch) {
			padding = normalizeLength(blurMatch[1]) * 3; // 3x radius for safety (Gaussian tail)
		}

		const tempCanvas = document.createElement('canvas');
		// Add padding to accommodate the blur expansion
		tempCanvas.width = size.width + padding * 2;
		tempCanvas.height = size.height + padding * 2;

		// Use the same colorSpace as the source context for consistent color handling
		const tempContext = tempCanvas.getContext('2d', {
			colorSpace: this.getContextAttributes?.()?.colorSpace || 'srgb',
		});
		if (!tempContext) {
			originalDrawImage.call(this, image, ...args);
			return;
		}

		// Draw source centered in the padded canvas
		originalDrawImage.call(
			tempContext,
			image,
			padding,
			padding,
			size.width,
			size.height,
		);

		// Apply the filter pipeline to the temporary buffer.
		applyCanvasFilterPolyfill(tempContext, filter);

		// Draw the result back, adjusting for the padding offset.
		// We need to map the inner (original) region to the destination, but draw the whole padded result.
		// If args has 2 params (dx, dy):
		if (args.length === 2) {
			originalDrawImage.call(
				this,
				tempCanvas,
				args[0] - padding,
				args[1] - padding,
			);
		}
		// If args has 4 params (dx, dy, dw, dh):
		else if (args.length === 4) {
			// Logic: The original image was drawn into (padding, padding, width, height).
			// We are drawing the WHOLE tempCanvas (width + 2p, height + 2p).
			// We need to scale the destination rect proportionally.
			const destX = args[0];
			const destY = args[1];
			const destW = args[2];
			const destH = args[3];

			const scaleX = destW / size.width;
			const scaleY = destH / size.height;

			originalDrawImage.call(
				this,
				tempCanvas,
				destX - padding * scaleX,
				destY - padding * scaleY,
				destW + padding * 2 * scaleX,
				destH + padding * 2 * scaleY,
			);
		}
		// If args has 8 params (sx, sy, sw, sh, dx, dy, dw, dh):
		else if (args.length === 8) {
			// Complex cropping case: treat padding as part of the source "virtual" image
			// For simplicity in this polyfill, we might just draw the relevant slice.
			// Ideally, adjust sx/sy by padding.
			const sx = args[0];
			const sy = args[1];
			const sw = args[2];
			const sh = args[3];
			const dx = args[4];
			const dy = args[5];
			const dw = args[6];
			const dh = args[7];

			originalDrawImage.call(
				this,
				tempCanvas,
				sx + padding, // Shift source read window by padding
				sy + padding,
				sw,
				sh,
				dx,
				dy,
				dw,
				dh,
			);
		}
	} as CanvasRenderingContext2D['drawImage'];
}

function getCanvasImageSourceSize(
	source: CanvasImageSource,
): {width: number; height: number} | null {
	// CanvasImageSource is a union type that includes HTMLImageElement, HTMLVideoElement,
	// HTMLCanvasElement, ImageBitmap, and OffscreenCanvas. We need to check for
	// properties that exist on different types.
	let width = 0;
	let height = 0;

	if ('naturalWidth' in source && 'naturalHeight' in source) {
		// HTMLImageElement
		width = source.naturalWidth;
		height = source.naturalHeight;
	} else if ('videoWidth' in source && 'videoHeight' in source) {
		// HTMLVideoElement
		width = source.videoWidth;
		height = source.videoHeight;
	} else if ('width' in source && 'height' in source) {
		// HTMLCanvasElement, ImageBitmap, OffscreenCanvas, or SVGImageElement
		const sourceWidth = source.width;
		const sourceHeight = source.height;
		// Handle SVGAnimatedLength for SVG elements
		width =
			typeof sourceWidth === 'number'
				? sourceWidth
				: (sourceWidth?.baseVal?.value ?? 0);
		height =
			typeof sourceHeight === 'number'
				? sourceHeight
				: (sourceHeight?.baseVal?.value ?? 0);
	}

	if (!width || !height) {
		return null;
	}

	return {width, height};
}

function applyCanvasFilterPolyfill(
	context: CanvasRenderingContext2D,
	filters: string,
): void {
	const tokens = filters?.match(/([-a-z]+)(?:\(([\w\d\s.%-]*)\))?/gim) ?? [];

	const tokensLength = tokens.length;
	for (let index = 0; index < tokensLength; index++) {
		const token = tokens[index];
		const match = token.match(/([-a-z]+)(?:\((.*)\))?/i);
		if (!match) continue;

		const name = match[1].toLowerCase();
		const optionsRaw = (match[2] || '').split(/\s+/);
		const options: string[] = [];
		for (let optionIndex = 0; optionIndex < optionsRaw.length; optionIndex++) {
			const trimmed = optionsRaw[optionIndex].trim();
			if (trimmed) options.push(trimmed);
		}

		const impl = FILTERS[name];
		if (impl) {
			impl(context, ...options);
		}
	}
}

function normalizeNumberPercentage(input: string): number {
	let value = parseFloat(input);
	if (Number.isNaN(value)) return 1;

	if (/%\s*$/i.test(input)) {
		value /= 100;
	}

	return value;
}

function normalizeLength(length: string): number {
	const value = parseFloat(length);
	if (!Number.isFinite(value) || value <= 0) {
		return 0;
	}

	// Handle rem/em if they reach the polyfill directly
	if (length.match(/(rem|em)$/)) {
		return Math.max(0, Math.round(value * 16));
	}

	return Math.max(0, Math.round(value));
}

function clampColor(value: number): number {
	if (value < 0) return 0;
	if (value > 255) return 255;
	return value;
}

function adjustRgb(
	context: CanvasRenderingContext2D,
	transform: RgbaTransform,
): void {
	const {canvas} = context;
	const {width} = canvas;
	const {height} = canvas;

	if (!width || !height) return;

	const imageData = context.getImageData(0, 0, width, height);
	const {data} = imageData;

	for (let index = 0; index < data.length; index += 4) {
		const [red, green, blue, alpha] = transform(
			data[index],
			data[index + 1],
			data[index + 2],
			data[index + 3],
		);

		data[index] = red;
		data[index + 1] = green;
		data[index + 2] = blue;
		data[index + 3] = alpha;
	}

	context.putImageData(imageData, 0, 0);
}

/**
 * Optimized Box Blur using a Sliding Accumulator.
 * Complexity: O(Width * Height), independent of radius.
 */
function applyBoxBlur(context: CanvasRenderingContext2D, radius: number): void {
	const {canvas} = context;
	const {width} = canvas;
	const {height} = canvas;

	if (!width || !height || radius <= 0) return;

	const imageData = context.getImageData(0, 0, width, height);
	const {data} = imageData;

	// 1. Pre-multiply alpha to prevent "dark fringe" artifacts
	for (let i = 0; i < data.length; i += 4) {
		const alpha = data[i + 3];
		if (alpha !== 255) {
			const a = alpha / 255;
			data[i] = data[i] * a;
			data[i + 1] = data[i + 1] * a;
			data[i + 2] = data[i + 2] * a;
		}
	}

	// Intermediate buffer for ping-ponging
	const buffer = new Uint8ClampedArray(data.length);

	const kernelSize = radius * 2 + 1;
	const iKernelSize = 1.0 / kernelSize;

	// 3 passes approximates a Gaussian blur
	for (let pass = 0; pass < 3; pass++) {
		// --- Horizontal Pass: Read data -> Write buffer ---
		for (let y = 0; y < height; y++) {
			const rowOffset = y * width * 4;

			let rSum = 0;
			let gSum = 0;
			let bSum = 0;
			let aSum = 0;

			// Initialize accumulator for the first pixel (x=0)
			const firstPixelOffset = rowOffset;
			const rFirst = data[firstPixelOffset];
			const gFirst = data[firstPixelOffset + 1];
			const bFirst = data[firstPixelOffset + 2];
			const aFirst = data[firstPixelOffset + 3];

			// Add 'left' side (all clamped to first pixel)
			const leftSamples = radius + 1;
			rSum += rFirst * leftSamples;
			gSum += gFirst * leftSamples;
			bSum += bFirst * leftSamples;
			aSum += aFirst * leftSamples;

			// Add 'right' side
			for (let i = 1; i <= radius; i++) {
				const clampX = Math.min(width - 1, i);
				const offset = rowOffset + clampX * 4;
				rSum += data[offset];
				gSum += data[offset + 1];
				bSum += data[offset + 2];
				aSum += data[offset + 3];
			}

			// Slide the window across the row
			for (let x = 0; x < width; x++) {
				// 1. Write average to output buffer
				const outOffset = rowOffset + x * 4;
				buffer[outOffset] = rSum * iKernelSize;
				buffer[outOffset + 1] = gSum * iKernelSize;
				buffer[outOffset + 2] = bSum * iKernelSize;
				buffer[outOffset + 3] = aSum * iKernelSize;

				// 2. Subtract the pixel leaving the window (x - radius)
				const leavingX = Math.max(0, x - radius);
				const leavingOffset = rowOffset + leavingX * 4;

				rSum -= data[leavingOffset];
				gSum -= data[leavingOffset + 1];
				bSum -= data[leavingOffset + 2];
				aSum -= data[leavingOffset + 3];

				// 3. Add the pixel entering the window (x + radius + 1)
				const enteringX = Math.min(width - 1, x + radius + 1);
				const enteringOffset = rowOffset + enteringX * 4;

				rSum += data[enteringOffset];
				gSum += data[enteringOffset + 1];
				bSum += data[enteringOffset + 2];
				aSum += data[enteringOffset + 3];
			}
		}

		// --- Vertical Pass: Read buffer -> Write data ---
		for (let x = 0; x < width; x++) {
			const colOffset = x * 4;

			let rSum = 0;
			let gSum = 0;
			let bSum = 0;
			let aSum = 0;

			// Initialize accumulator for the first pixel (y=0)
			const firstPixelOffset = colOffset;
			const rFirst = buffer[firstPixelOffset];
			const gFirst = buffer[firstPixelOffset + 1];
			const bFirst = buffer[firstPixelOffset + 2];
			const aFirst = buffer[firstPixelOffset + 3];

			const topSamples = radius + 1;
			rSum += rFirst * topSamples;
			gSum += gFirst * topSamples;
			bSum += bFirst * topSamples;
			aSum += aFirst * topSamples;

			for (let i = 1; i <= radius; i++) {
				const clampY = Math.min(height - 1, i);
				const offset = clampY * width * 4 + colOffset;
				rSum += buffer[offset];
				gSum += buffer[offset + 1];
				bSum += buffer[offset + 2];
				aSum += buffer[offset + 3];
			}

			for (let y = 0; y < height; y++) {
				// 1. Write average back to data
				const outOffset = y * width * 4 + colOffset;

				data[outOffset] = rSum * iKernelSize;
				data[outOffset + 1] = gSum * iKernelSize;
				data[outOffset + 2] = bSum * iKernelSize;
				data[outOffset + 3] = aSum * iKernelSize;

				// 2. Subtract pixel leaving top
				const leavingY = Math.max(0, y - radius);
				const leavingOffset = leavingY * width * 4 + colOffset;

				rSum -= buffer[leavingOffset];
				gSum -= buffer[leavingOffset + 1];
				bSum -= buffer[leavingOffset + 2];
				aSum -= buffer[leavingOffset + 3];

				// 3. Add pixel entering bottom
				const enteringY = Math.min(height - 1, y + radius + 1);
				const enteringOffset = enteringY * width * 4 + colOffset;

				rSum += buffer[enteringOffset];
				gSum += buffer[enteringOffset + 1];
				bSum += buffer[enteringOffset + 2];
				aSum += buffer[enteringOffset + 3];
			}
		}
	}

	// 4. Un-multiply alpha to restore standard RGBA
	for (let i = 0; i < data.length; i += 4) {
		const alpha = data[i + 3];
		if (alpha !== 0 && alpha !== 255) {
			const a = alpha / 255;
			data[i] = Math.min(255, data[i] / a);
			data[i + 1] = Math.min(255, data[i + 1] / a);
			data[i + 2] = Math.min(255, data[i + 2] / a);
		}
	}

	context.putImageData(imageData, 0, 0);
}

// Install the polyfill immediately on module evaluation so any usage of
// `context.filter` within this module (or consumers) will see the shim on
// Safari and other legacy environments.
type GetBoxQuadsBox = 'border' | 'padding' | 'content' | 'margin';

type GetBoxQuadsOptions = {
	box?: GetBoxQuadsBox;
	relativeTo?: Element;
};

function parseCssLengthValue(value: string | null | undefined): number {
	if (!value) return 0;
	const parsed = parseFloat(value);
	return Number.isFinite(parsed) ? parsed : 0;
}

function getCachedComputedStyleForQuads(element: Element): CSSStyleDeclaration {
	const {ownerDocument} = element;
	const defaultView = ownerDocument?.defaultView;
	return defaultView?.getComputedStyle(element) as CSSStyleDeclaration;
}

function parseOriginComponentForQuads(value: string, size: number): number {
	const trimmed = value.trim().toLowerCase();
	if (trimmed === 'left' || trimmed === 'top') return 0;
	if (trimmed === 'center') return size / 2;
	if (trimmed === 'right' || trimmed === 'bottom') return size;

	if (trimmed.endsWith('%')) {
		const pct = parseFloat(trimmed);
		if (Number.isFinite(pct)) return (pct / 100) * size;
	}

	const parsed = parseFloat(trimmed);
	return Number.isFinite(parsed) ? parsed : 0;
}

function parseTransformOriginForQuads(
	originValue: string,
	element: Element,
): {x: number; y: number; z: number} {
	const rect = element.getBoundingClientRect();
	const width = rect?.width ?? 0;
	const height = rect?.height ?? 0;

	const parts = originValue.split(/\s+/).filter(Boolean);
	const ox = parts[0] ?? '50%';
	const oy = parts[1] ?? '50%';
	const oz = parts[2] ?? '0';

	return {
		x: parseOriginComponentForQuads(ox, width),
		y: parseOriginComponentForQuads(oy, height),
		z: parseFloat(oz) || 0,
	};
}

const transformPropertiesForQuads = [
	'transform',
	'translate',
	'scale',
	'rotate',
	'perspective',
];
const willChangeValuesForQuads = [
	'transform',
	'translate',
	'scale',
	'rotate',
	'perspective',
	'filter',
];
const containValuesForQuads = ['paint', 'layout', 'strict', 'content'];

function isElementForQuads(value: any): value is Element {
	const elType = value?.ownerDocument?.defaultView?.Element;
	return (
		value instanceof Element || (elType != null && value instanceof elType)
	);
}

function isContainingBlockForQuads(
	elementOrCss: Element | CSSStyleDeclaration,
): boolean {
	const css = isElementForQuads(elementOrCss)
		? getCachedComputedStyleForQuads(elementOrCss)
		: elementOrCss;

	return transformPropertiesForQuads.some((v) =>
		(css as any)[v] ? (css as any)[v] !== 'none' : false,
	) || (css as any).containerType
		? (css as any).containerType !== 'normal'
		: false || (css as any).backdropFilter
			? (css as any).backdropFilter !== 'none'
			: false || (css as any).filter
				? (css as any).filter !== 'none'
				: false ||
					willChangeValuesForQuads.some((v) =>
						((css as any).willChange || '').includes(v),
					) ||
					containValuesForQuads.some((v) =>
						((css as any).contain || '').includes(v),
					);
}

function flatTreeParentForQuads(element: any): any {
	if (element?.assignedSlot) return element.assignedSlot;
	if (element?.parentNode instanceof ShadowRoot) return element.parentNode.host;
	return element?.parentNode || null;
}

function ancestorTreeScopesForQuads(element: any): Set<Node> {
	const scopes = new Set<Node>();
	let currentScope = element?.getRootNode ? element.getRootNode() : null;
	while (currentScope) {
		scopes.add(currentScope);
		const next = (currentScope as any)?.parentNode
			? (currentScope as any).parentNode.getRootNode?.()
			: null;
		currentScope = next;
	}

	return scopes;
}

function getElementSizeForQuads(
	node: Node,
	matrix?: DOMMatrix,
): {width: number; height: number} {
	const anyNode = node as any;

	const htmlCtor = anyNode?.ownerDocument?.defaultView?.HTMLElement;
	if (node instanceof HTMLElement || (htmlCtor && node instanceof htmlCtor)) {
		const element = node as HTMLElement;
		return {width: element.offsetWidth, height: element.offsetHeight};
	}

	const svgCtor = anyNode?.ownerDocument?.defaultView?.SVGSVGElement;
	if (node instanceof SVGSVGElement || (svgCtor && node instanceof svgCtor)) {
		const svg = node as SVGSVGElement;
		return {width: svg.width.baseVal.value, height: svg.height.baseVal.value};
	}

	const svgGraphicsCtor =
		anyNode?.ownerDocument?.defaultView?.SVGGraphicsElement;
	if (
		node instanceof SVGGraphicsElement ||
		(svgGraphicsCtor && node instanceof svgGraphicsCtor)
	) {
		const svg = node as SVGGraphicsElement;
		const bbox = svg.getBBox();
		return {width: bbox.width, height: bbox.height};
	}

	const mathmlCtor = anyNode?.ownerDocument?.defaultView?.MathMLElement;
	if (
		(typeof MathMLElement !== 'undefined' && node instanceof MathMLElement) ||
		(mathmlCtor && node instanceof mathmlCtor)
	) {
		const bbox = (node as Element).getBoundingClientRect();
		return {
			width: bbox.width / (matrix?.a ?? 1),
			height: bbox.height / (matrix?.d ?? 1),
		};
	}

	const textCtor = anyNode?.ownerDocument?.defaultView?.Text;
	if (node instanceof Text || (textCtor && node instanceof textCtor)) {
		const range = node.ownerDocument?.createRange();
		if (range) {
			range.selectNodeContents(node);
			const r = range.getBoundingClientRect();
			return {
				width: r.width / (matrix?.a ?? 1),
				height: r.height / (matrix?.d ?? 1),
			};
		}
	}

	return {width: 0, height: 0};
}

function getParentElementIncludingSlotsForQuads(node: Node): Element | null {
	if ((node as any).assignedSlot) return (node as any).assignedSlot;
	if (node.parentElement) return node.parentElement;
	if (node.parentNode instanceof ShadowRoot) return node.parentNode.host;
	return null;
}

function projectTo2DForQuads(m: DOMMatrix): void {
	m.m31 = 0;
	m.m32 = 0;
	m.m13 = 0;
	m.m23 = 0;
	m.m33 = 1;
	m.m43 = 0;
	m.m34 = 0;
	if (m.m14 === 0 && m.m24 === 0 && m.m44 !== 1 && m.m44 !== 0) {
		const scale = 1 / m.m44;
		m.m11 *= scale;
		m.m12 *= scale;
		m.m21 *= scale;
		m.m22 *= scale;
		m.m41 *= scale;
		m.m42 *= scale;
		m.m44 = 1;
	}
}

function getElementPerspectiveTransformForQuads(
	element: Element,
): DOMMatrix | null {
	const parent = getParentElementIncludingSlotsForQuads(element);
	if (!parent) return null;

	const style = getCachedComputedStyleForQuads(parent);
	if (!style || style.perspective === 'none') return null;

	const m = new DOMMatrix();
	const p = parseFloat(style.perspective);
	if (!Number.isFinite(p) || p === 0) return null;
	m.m34 = -1 / p;

	if (style.perspectiveOrigin) {
		const origin = style.perspectiveOrigin.split(' ');
		// Subtract the ELEMENT's offset, not the parent's offset
		const originX = parseFloat(origin[0]) - (element as HTMLElement).offsetLeft;
		const originY = parseFloat(origin[1]) - (element as HTMLElement).offsetTop;

		const mOri = new DOMMatrix().translateSelf(originX, originY);
		const mOriInv = new DOMMatrix().translateSelf(-originX, -originY);
		return mOri.multiplySelf(m.multiplySelf(mOriInv));
	}

	return m;
}

// CSS Motion Path (offset-path) Support

function parseOffsetDistanceForQuads(string: string): number {
	const trimmed = string.trim();
	if (trimmed.endsWith('%')) {
		return parseFloat(trimmed) / 100;
	}

	return parseFloat(trimmed);
}

function parseAngleForQuads(string: string | undefined): number {
	if (!string) return 0;
	const trimmed = string.trim();
	if (trimmed.endsWith('deg')) return parseFloat(trimmed);
	if (trimmed.endsWith('rad')) return parseFloat(trimmed) * (180 / Math.PI);
	if (trimmed.endsWith('grad')) return parseFloat(trimmed) * 0.9;
	return parseFloat(trimmed);
}

function parsePositionForQuads(part: string, size: number): number {
	const trimmed = part.trim();
	if (trimmed.endsWith('%')) {
		return (parseFloat(trimmed) / 100) * size;
	}

	if (trimmed.endsWith('px')) {
		return parseFloat(trimmed);
	}

	switch (trimmed) {
		case 'left':
			return 0;
		case 'top':
			return 0;
		case 'center':
			return size / 2;
		case 'right':
			return size;
		case 'bottom':
			return size;
	}

	return parseFloat(trimmed);
}

function parseOffsetAnchorForQuads(
	str: string | undefined,
	transformOrigin: string,
	element: Element,
): {x: number; y: number} {
	const width = (element as HTMLElement).offsetWidth ?? 0;
	const height = (element as HTMLElement).offsetHeight ?? 0;

	if (!str || str === 'auto') {
		str = transformOrigin;
	}

	const parts = str.split(/\s+/);
	if (parts.length === 1) {
		const x = parsePositionForQuads(parts[0], width);
		return {x, y: height / 2};
	}

	const x = parsePositionForQuads(parts[0], width);
	const y = parsePositionForQuads(parts[1], height);
	return {x, y};
}

function computePathTypeForQuads(
	pathData: string,
	distNorm: number,
): {x: number; y: number; angle: number} {
	const svgPath = document.createElementNS(
		'http://www.w3.org/2000/svg',
		'path',
	);
	svgPath.setAttribute('d', pathData);

	const total = svgPath.getTotalLength();
	const dist = distNorm <= 1 ? distNorm * total : distNorm;

	const p1 = svgPath.getPointAtLength(dist);
	const p2 = svgPath.getPointAtLength(Math.min(total, dist + 0.01));

	const angle = (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;

	return {x: p1.x, y: p1.y, angle};
}

function computeRayForQuads(
	str: string,
	t: number,
): {x: number; y: number; angle: number} {
	const m = str.match(/ray\(([^)]+)\)/);
	if (!m) return {x: 0, y: 0, angle: 0};
	const inside = m[1].trim();

	const [beforeAt, atPart] = inside.split('at').map((s) => s?.trim());

	const parts = beforeAt.split(/\s+/);
	const angleDeg = parseAngleForQuads(parts[0]);
	const angleRad = (angleDeg * Math.PI) / 180;

	let ox = 0;
	let oy = 0;
	if (atPart) {
		const positions = atPart.split(/\s+/);
		ox = parseFloat(positions[0]);
		oy = parseFloat(positions[1]);
	}

	const dist = t <= 1 ? t : t;

	const x = ox + Math.cos(angleRad) * dist;
	const y = oy + Math.sin(angleRad) * dist;

	return {x, y, angle: angleDeg};
}

function computeCircleForQuads(
	str: string,
	t: number,
): {x: number; y: number; angle: number} {
	const m = str.match(/circle\(([^)]+)\)/);
	if (!m) return {x: 0, y: 0, angle: 0};
	const inner = m[1];

	const [radiusPart, atPart] = inner.split('at').map((s) => s.trim());
	const r = parseFloat(radiusPart);
	const [cx, cy] = atPart.split(/\s+/).map(parseFloat);

	const angleRad = t * 2 * Math.PI;
	const x = cx + Math.cos(angleRad) * r;
	const y = cy + Math.sin(angleRad) * r;

	const tangentAngleDeg = (angleRad * 180) / Math.PI + 90;

	return {x, y, angle: tangentAngleDeg};
}

function computeEllipseForQuads(
	str: string,
	t: number,
): {x: number; y: number; angle: number} {
	const m = str.match(/ellipse\(([^)]+)\)/);
	if (!m) return {x: 0, y: 0, angle: 0};
	const parts = m[1].split('at');
	const radii = parts[0].trim().split(/\s+/).map(parseFloat);
	const center = parts[1].trim().split(/\s+/).map(parseFloat);

	const rx = radii[0];
	const ry = radii[1];
	const cx = center[0];
	const cy = center[1];

	const angleRad = t * 2 * Math.PI;

	const x = cx + Math.cos(angleRad) * rx;
	const y = cy + Math.sin(angleRad) * ry;

	const dx = -Math.sin(angleRad) * rx;
	const dy = Math.cos(angleRad) * ry;
	const tangentAngleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;

	return {x, y, angle: tangentAngleDeg};
}

function rectPathForQuads(
	top: number,
	left: number,
	right: number,
	bottom: number,
	t: number,
): {x: number; y: number; angle: number} {
	const width = right - left;
	const height = bottom - top;

	const perimeter = 2 * (width + height);
	let dist = t * perimeter;

	if (dist < width) {
		return {x: left + dist, y: top, angle: 0};
	}

	dist -= width;

	if (dist < height) {
		return {x: right, y: top + dist, angle: 90};
	}

	dist -= height;

	if (dist < width) {
		return {x: right - dist, y: bottom, angle: 180};
	}

	dist -= width;

	return {x: left, y: bottom - dist, angle: 270};
}

function computeRectForQuads(
	str: string,
	t: number,
): {x: number; y: number; angle: number} {
	const m = str.match(/rect\(([^)]+)\)/);
	if (!m) return {x: 0, y: 0, angle: 0};
	const nums = m[1].split(/\s+/).map((s) => parseFloat(s));
	const top = nums[0];
	const right = nums[1];
	const bottom = nums[2];
	const left = nums[3];
	return rectPathForQuads(top, left, right, bottom, t);
}

function computeXYWHForQuads(
	str: string,
	t: number,
): {x: number; y: number; angle: number} {
	const m = str.match(/xywh\(([^)]+)\)/);
	if (!m) return {x: 0, y: 0, angle: 0};
	const nums = m[1].split(/\s+/).map(parseFloat);

	const left = nums[0];
	const top = nums[1];
	const width = nums[2];
	const height = nums[3];

	return rectPathForQuads(top, left, left + width, top + height, t);
}

function computePolygonForQuads(
	str: string,
	t: number,
): {x: number; y: number; angle: number} {
	const m = str.match(/polygon\(([^)]+)\)/);
	if (!m) return {x: 0, y: 0, angle: 0};
	const pairs = m[1]
		.split(',')
		.map((p) => p.trim().split(/\s+/).map(parseFloat));

	const points = pairs;
	const lengths = [0];

	for (let pointIndex = 1; pointIndex < points.length; pointIndex++) {
		const dx = points[pointIndex][0] - points[pointIndex - 1][0];
		const dy = points[pointIndex][1] - points[pointIndex - 1][1];
		lengths.push(Math.hypot(dx, dy) + lengths[pointIndex - 1]);
	}

	const dx = points[0][0] - points[points.length - 1][0];
	const dy = points[0][1] - points[points.length - 1][1];
	lengths.push(Math.hypot(dx, dy) + lengths[lengths.length - 1]);

	const total = lengths[lengths.length - 1];
	const target = t * total;

	let index = lengths.findIndex((length) => length >= target);
	if (index <= 0) index = 1;

	const previousLength = lengths[index - 1];
	const nextLength = lengths[index];
	const segT = (target - previousLength) / (nextLength - previousLength);

	const a = points[(index - 1) % points.length];
	const b = points[index % points.length];

	const x = a[0] + (b[0] - a[0]) * segT;
	const y = a[1] + (b[1] - a[1]) * segT;

	const angle = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;

	return {x, y, angle};
}

// calc() parsing for inset

interface CalcToken {
	type: string;
	value: number | string;
	unit?: string;
}

interface CalcAstNode {
	type: string;
	value?: number;
	unit?: string;
	op?: string;
	left?: CalcAstNode;
	right?: CalcAstNode;
}

function tokenizeCalcForQuads(input: string): CalcToken[] {
	const tokens: CalcToken[] = [];
	let index = 0;

	while (index < input.length) {
		const ch = input[index];

		if (/\s/.test(ch)) {
			index++;
			continue;
		}

		if ('+-*/()'.includes(ch)) {
			tokens.push({type: ch, value: ch});
			index++;
			continue;
		}

		if (/[0-9.]/.test(ch)) {
			const start = index;
			while (/[0-9.]/.test(input[index])) index++;
			const num = input.slice(start, index);

			if (input[index] === '%') {
				index++;
				tokens.push({type: 'percentage', value: parseFloat(num)});
				continue;
			}

			if (input.slice(index, index + 2) === 'px') {
				index += 2;
				tokens.push({type: 'dimension', value: parseFloat(num), unit: 'px'});
				continue;
			}

			tokens.push({type: 'number', value: parseFloat(num)});
			continue;
		}

		if (/[a-zA-Z]/.test(ch)) {
			const start = index;
			while (/[a-zA-Z]/.test(input[index])) index++;
			const name = input.slice(start, index);

			if (name === 'calc' && input[index] === '(') {
				tokens.push({type: 'func', value: 'calc'});
				continue;
			}

			throw new Error('Unsupported function: ' + name);
		}

		throw new Error('Unexpected character in calc(): ' + ch);
	}

	return tokens;
}

function parseCalcForQuads(tokens: CalcToken[]): CalcAstNode {
	let index = 0;

	function peek(): CalcToken | undefined {
		return tokens[index];
	}

	function consume(): CalcToken {
		return tokens[index++];
	}

	function parseExpression(): CalcAstNode {
		let node = parseTerm();
		while (peek() && (peek()!.type === '+' || peek()!.type === '-')) {
			const op = consume().type;
			const right = parseTerm();
			node = {type: 'binary', op, left: node, right};
		}

		return node;
	}

	function parseTerm(): CalcAstNode {
		let node = parseFactor();
		while (peek() && (peek()!.type === '*' || peek()!.type === '/')) {
			const op = consume().type;
			const right = parseFactor();
			node = {type: 'binary', op, left: node, right};
		}

		return node;
	}

	function parseFactor(): CalcAstNode {
		const t = peek();
		if (!t) throw new Error('Unexpected end in calc()');

		if (t.type === 'number') {
			consume();
			return {type: 'number', value: t.value as number};
		}

		if (t.type === 'dimension') {
			consume();
			return {type: 'dimension', value: t.value as number, unit: t.unit};
		}

		if (t.type === 'percentage') {
			consume();
			return {type: 'percentage', value: t.value as number};
		}

		if (t.type === 'func') {
			consume();
			if (peek()?.type !== '(') throw new Error("Expected '(' after calc");
			consume();
			const node = parseExpression();
			if (!peek() || peek()!.type !== ')') throw new Error("Expected ')'");
			consume();
			return node;
		}

		if (t.type === '(') {
			consume();
			const node = parseExpression();
			if (!peek() || peek()!.type !== ')') throw new Error("Expected ')'");
			consume();
			return node;
		}

		throw new Error('Unexpected calc token ' + JSON.stringify(t));
	}

	const ast = parseExpression();
	if (index !== tokens.length) throw new Error('Extra tokens after calc');
	return ast;
}

function evalCalcForQuads(
	ast: CalcAstNode,
	env: {percentBase: number},
): number {
	switch (ast.type) {
		case 'number':
			return ast.value!;

		case 'dimension':
			return ast.value!;

		case 'percentage':
			return env.percentBase * (ast.value! / 100);

		case 'binary': {
			const l = evalCalcForQuads(ast.left!, env);
			const r = evalCalcForQuads(ast.right!, env);

			switch (ast.op) {
				case '+':
					return l + r;
				case '-':
					return l - r;
				case '*':
					return l * r;
				case '/':
					return l / r;
			}
		}
	}

	throw new Error('Invalid AST node ' + ast.type);
}

function resolveLengthForQuads(expr: string, element: Element): number {
	const trimmed = expr.trim();

	if (/^[0-9.]+px$/.test(trimmed)) return parseFloat(trimmed);

	if (/^[0-9.]+%$/.test(trimmed)) {
		const p = parseFloat(trimmed);
		const base = (element as HTMLElement).offsetWidth;
		return base * (p / 100);
	}

	const ast = parseCalcForQuads(tokenizeCalcForQuads(trimmed));
	return evalCalcForQuads(ast, {
		percentBase: (element as HTMLElement).offsetWidth,
	});
}

function parseInsetArgsForQuads(string: string): string[] {
	const inside = string
		.trim()
		.replace(/^inset\s*\(/, '')
		.replace(/\)\s*$/, '');

	const args: string[] = [];
	let current = '';
	let depth = 0;

	for (let charIndex = 0; charIndex < inside.length; charIndex++) {
		const ch = inside[charIndex];

		if (ch === '(') {
			depth++;
			current += ch;
		} else if (ch === ')') {
			depth--;
			current += ch;
		} else if (/\s/.test(ch) && depth === 0) {
			if (current.trim() !== '') {
				args.push(current.trim());
				current = '';
			}
		} else {
			current += ch;
		}
	}

	if (current.trim() !== '') {
		args.push(current.trim());
	}

	return args;
}

function computeInsetForQuads(
	str: string,
	element: Element,
	progress: number,
): {x: number; y: number; angle: number} {
	const args = parseInsetArgsForQuads(str);
	if (args.length !== 4) {
		throw new Error('inset() must have 4 arguments');
	}

	const [topPx, rightPx, bottomPx, leftPx] = args.map((a) =>
		resolveLengthForQuads(a, element),
	);

	const width = (element as HTMLElement).offsetWidth;
	const height = (element as HTMLElement).offsetHeight;

	const x1 = leftPx;
	const y1 = topPx;
	const x2 = width - rightPx;
	const y2 = height - bottomPx;

	const P = 2 * (x2 - x1 + (y2 - y1));

	let d = P * progress;

	const len1 = x2 - x1;
	if (d <= len1) return {x: x1 + d, y: y1, angle: 0};
	d -= len1;

	const len2 = y2 - y1;
	if (d <= len2) return {x: x2, y: y1 + d, angle: 90};
	d -= len2;

	const len3 = x2 - x1;
	if (d <= len3) return {x: x2 - d, y: y2, angle: 180};
	d -= len3;

	return {x: x1, y: y2 - d, angle: 270};
}

function computeOffsetPathPointForQuads(
	element: Element,
	offsetPath: string,
	distNorm: number,
): {x: number; y: number; angle: number} {
	if (!offsetPath || offsetPath === 'none') {
		return {x: 0, y: 0, angle: 0};
	}

	const value = offsetPath.trim();

	const pathMatch = value.match(/path\(["'](.+)["']\)/);
	if (pathMatch) return computePathTypeForQuads(pathMatch[1], distNorm);

	if (value.startsWith('circle('))
		return computeCircleForQuads(value, distNorm);
	if (value.startsWith('ellipse('))
		return computeEllipseForQuads(value, distNorm);
	if (value.startsWith('inset('))
		return computeInsetForQuads(value, element, distNorm);
	if (value.startsWith('rect(')) return computeRectForQuads(value, distNorm);
	if (value.startsWith('xywh(')) return computeXYWHForQuads(value, distNorm);
	if (value.startsWith('ray(')) return computeRayForQuads(value, distNorm);
	if (value.startsWith('polygon('))
		return computePolygonForQuads(value, distNorm);

	console.warn('Unsupported offset-path:', offsetPath);
	return {x: 0, y: 0, angle: 0};
}

function computeOffsetTransformMatrixForQuads(element: Element): DOMMatrix {
	const cs = getCachedComputedStyleForQuads(element);

	const {offsetPath} = cs as any;
	const offsetDistance = (cs as any).offsetDistance || '0%';
	const offsetRotate = (cs as any).offsetRotate || 'auto';
	const {offsetAnchor} = cs as any;
	const {transformOrigin} = cs;

	const distance = parseOffsetDistanceForQuads(offsetDistance);

	const {x, y, angle} = computeOffsetPathPointForQuads(
		element,
		offsetPath,
		distance,
	);

	let rotateFinal = 0;
	if (offsetRotate.startsWith('auto')) {
		const parts = offsetRotate.split(/\s+/);
		const extra = parts.length === 2 ? parseFloat(parts[1]) : 0;
		rotateFinal = angle + extra;
	} else {
		rotateFinal = parseFloat(offsetRotate);
	}

	const anchor = parseOffsetAnchorForQuads(
		offsetAnchor,
		transformOrigin,
		element,
	);

	const anchorMatrix = new DOMMatrix().translateSelf(-anchor.x, -anchor.y);

	const m = anchorMatrix.translate(x, y);
	m.multiplySelf(anchorMatrix.invertSelf());
	m.rotateSelf(rotateFinal);
	m.translateSelf(-anchor.x, -anchor.y);

	return m;
}

function getElementCombinedTransformForQuads(element: Element): DOMMatrix {
	const style = getCachedComputedStyleForQuads(element);
	if (!style) return new DOMMatrix();

	const origin = parseTransformOriginForQuads(
		style.transformOrigin || '50% 50%',
		element,
	);
	const originX = origin.x;
	const originY = origin.y;
	const originZ = origin.z;

	const originMatrix = new DOMMatrix().translateSelf(originX, originY, originZ);
	const originMatrixInv = originMatrix.inverse();

	let m = new DOMMatrix();

	if (style.translate && style.translate !== 'none') {
		let tr = style.translate;
		if (tr.includes('%')) {
			const rect = element.getBoundingClientRect();
			const v = tr.split(' ');
			if (v[0]?.endsWith('%')) {
				v[0] = (parseFloat(v[0]) * rect.width) / 100 + 'px';
			}

			if (v[1]?.endsWith('%')) {
				v[1] = (parseFloat(v[1]) * rect.height) / 100 + 'px';
			}

			tr = v.join(',');
		}

		m.multiplySelf(new DOMMatrix(`translate(${tr.replaceAll(' ', ',')})`));
	}

	if (style.rotate && style.rotate !== 'none') {
		m.multiplySelf(
			new DOMMatrix(`rotate(${style.rotate.replaceAll(' ', ',')})`),
		);
	}

	if (style.scale && style.scale !== 'none') {
		m.multiplySelf(new DOMMatrix(`scale(${style.scale.replaceAll(' ', ',')})`));
	}

	const {offsetPath} = style as any;
	if (offsetPath && offsetPath !== 'none') {
		m.multiplySelf(computeOffsetTransformMatrixForQuads(element));
	}

	if (style.transform && style.transform !== 'none') {
		m.multiplySelf(new DOMMatrix(style.transform));
	}

	m = originMatrix.multiply(m.multiply(originMatrixInv));

	const perspective = getElementPerspectiveTransformForQuads(element);
	if (perspective) {
		m = perspective.multiplySelf(m);
	}

	return m;
}

function offsetParentPolyfillForQuads(element: Element): Element | null {
	for (
		let ancestor: Node | null = element;
		ancestor;
		ancestor = flatTreeParentForQuads(ancestor)
	) {
		if (ancestor instanceof Element) {
			if (getCachedComputedStyleForQuads(ancestor).display === 'none') {
				return null;
			}
		}
	}

	for (
		let ancestor = flatTreeParentForQuads(element);
		ancestor;
		ancestor = flatTreeParentForQuads(ancestor)
	) {
		if (!(ancestor instanceof Element)) continue;
		const style = getCachedComputedStyleForQuads(ancestor);
		if (style.display === 'contents') continue;
		if (style.position !== 'static' || isContainingBlockForQuads(style)) {
			return ancestor;
		}

		if (ancestor.tagName === 'BODY') return ancestor;
	}

	return null;
}

function offsetTopLeftPolyfillForQuads(
	element: HTMLElement,
	offsetKey: 'offsetTop' | 'offsetLeft',
): number {
	let value = (element as any)[offsetKey];
	let nextOffsetParent = offsetParentPolyfillForQuads(element);
	const scopes = ancestorTreeScopesForQuads(element);

	while (
		nextOffsetParent &&
		!scopes.has((nextOffsetParent as any).getRootNode?.())
	) {
		value -= (nextOffsetParent as any)[offsetKey];
		nextOffsetParent = offsetParentPolyfillForQuads(nextOffsetParent);
	}

	return value;
}

function getElementOffsetsInContainerForQuads(
	node: Node,
	includeScroll: boolean,
): DOMPoint {
	const anyNode = node as any;
	const htmlCtor = anyNode?.ownerDocument?.defaultView?.HTMLElement;
	if (node instanceof HTMLElement || (htmlCtor && node instanceof htmlCtor)) {
		const element = node as HTMLElement;
		if (includeScroll) {
			const cs = getCachedComputedStyleForQuads(element);
			return new DOMPoint(
				element.offsetLeft -
					(element.scrollLeft - parseCssLengthValue(cs.borderLeftWidth)),
				element.offsetTop -
					(element.scrollTop - parseCssLengthValue(cs.borderTopWidth)),
			);
		}

		return new DOMPoint(element.offsetLeft, element.offsetTop);
	}

	const textCtor = anyNode?.ownerDocument?.defaultView?.Text;
	if (node instanceof Text || (textCtor && node instanceof textCtor)) {
		const range = node.ownerDocument?.createRange();
		if (range) {
			range.selectNodeContents(node);
			const r1 = range.getBoundingClientRect();
			const parent = getParentElementIncludingSlotsForQuads(
				node,
			) as HTMLElement;
			if (parent) {
				const r2 = parent.getBoundingClientRect();
				const zX = parent.offsetWidth / r2.width;
				const zY = parent.offsetHeight / r2.height;
				return new DOMPoint((r1.x - r2.x) * zX, (r1.y - r2.y) * zY);
			}
		}

		return new DOMPoint(0, 0);
	}

	const elementCtor = anyNode?.ownerDocument?.defaultView?.Element;
	if (node instanceof Element || (elementCtor && node instanceof elementCtor)) {
		const svgGraphicsCtor =
			anyNode?.ownerDocument?.defaultView?.SVGGraphicsElement;
		const svgSvgCtor = anyNode?.ownerDocument?.defaultView?.SVGSVGElement;
		if (
			(node instanceof SVGGraphicsElement ||
				(svgGraphicsCtor && node instanceof svgGraphicsCtor)) &&
			!(
				node instanceof SVGSVGElement ||
				(svgSvgCtor && node instanceof svgSvgCtor)
			)
		) {
			const bb = (node as SVGGraphicsElement).getBBox();
			return new DOMPoint(bb.x, bb.y);
		}

		const element = node as Element;
		const cs = getCachedComputedStyleForQuads(element);
		if (cs.position === 'absolute') {
			return new DOMPoint(parseFloat(cs.left) || 0, parseFloat(cs.top) || 0);
		}

		const par = getParentElementIncludingSlotsForQuads(node);
		if (par && par instanceof Element) {
			const ownerDoc = node.ownerDocument;
			const m = getResultingTransformationBetweenElementAndAllAncestorsForQuads(
				par,
				ownerDoc?.body ?? par,
			).inverse();
			const r1 = element.getBoundingClientRect();
			const r1t = m.transformPoint(r1);
			const r2 = par.getBoundingClientRect();
			const r2t = m.transformPoint(r2);
			return new DOMPoint(r1t.x - r2t.x, r1t.y - r2t.y);
		}
	}

	return new DOMPoint(0, 0);
}

function getResultingTransformationBetweenElementAndAllAncestorsForQuads(
	node: Node,
	ancestor: Element,
): DOMMatrix {
	let matrix: DOMMatrix;
	if (node instanceof Element) {
		matrix = getElementCombinedTransformForQuads(node);
	} else {
		matrix = new DOMMatrix();
	}

	// Initial flattening check based on parent's transformStyle
	const perspectiveParent = getParentElementIncludingSlotsForQuads(node);
	if (perspectiveParent && perspectiveParent instanceof Element) {
		const s = getCachedComputedStyleForQuads(perspectiveParent);
		if (s.transformStyle !== 'preserve-3d') {
			projectTo2DForQuads(matrix);
		}
	}

	let current: Node | null = node;
	let lastOffsetParent: any = null;

	while (current && current !== ancestor) {
		let parent = getParentElementIncludingSlotsForQuads(current);

		const anyCurrent = current as any;

		if (anyCurrent?.assignedSlot) {
			const l = offsetTopLeftPolyfillForQuads(
				anyCurrent as HTMLElement,
				'offsetLeft',
			);
			const t = offsetTopLeftPolyfillForQuads(
				anyCurrent as HTMLElement,
				'offsetTop',
			);
			const mv = new DOMMatrix().translateSelf(l, t);
			matrix = mv.multiplySelf(matrix);
			parent = anyCurrent.assignedSlot;
		} else if (
			current instanceof SVGGraphicsElement &&
			!(current instanceof SVGSVGElement)
		) {
			const ctm = (current as SVGGraphicsElement).getCTM();
			if (ctm) {
				const bb = (current as SVGGraphicsElement).getBBox();
				const mv = new DOMMatrix().translateSelf(bb.x, bb.y);
				matrix = mv.multiplySelf(matrix);
				matrix = new DOMMatrix([
					ctm.a,
					ctm.b,
					ctm.c,
					ctm.d,
					ctm.e,
					ctm.f,
				]).multiplySelf(matrix);
				parent = (current as SVGGraphicsElement).ownerSVGElement;
			}
		} else if (
			current instanceof HTMLElement ||
			(anyCurrent?.ownerDocument?.defaultView?.HTMLElement &&
				current instanceof anyCurrent.ownerDocument.defaultView.HTMLElement)
		) {
			const element = current as HTMLElement;
			const slotCtor = anyCurrent?.ownerDocument?.defaultView?.HTMLSlotElement;
			const isSlotElement =
				(typeof HTMLSlotElement !== 'undefined' &&
					element instanceof HTMLSlotElement) ||
				(slotCtor && element instanceof slotCtor);
			if (
				lastOffsetParent !== (element as any).offsetParent &&
				!isSlotElement
			) {
				const offsets = getElementOffsetsInContainerForQuads(
					element,
					current !== node,
				);
				lastOffsetParent = (element as any).offsetParent;
				matrix = new DOMMatrix()
					.translateSelf(offsets.x, offsets.y)
					.multiplySelf(matrix);
			}
		} else {
			const offsets = getElementOffsetsInContainerForQuads(
				current,
				current !== node,
			);
			lastOffsetParent = null;
			matrix = new DOMMatrix()
				.translateSelf(offsets.x, offsets.y)
				.multiplySelf(matrix);
		}

		if (parent) {
			const parentMatrix =
				parent instanceof Element
					? getElementCombinedTransformForQuads(parent)
					: new DOMMatrix();

			if (parent !== ancestor) {
				matrix = parentMatrix.multiply(matrix);
			}

			// Check the grandparent's transformStyle for flattening
			const perspectiveParentEl =
				getParentElementIncludingSlotsForQuads(parent);
			if (perspectiveParentEl && perspectiveParentEl instanceof Element) {
				const s = getCachedComputedStyleForQuads(perspectiveParentEl);
				if (s.transformStyle !== 'preserve-3d') {
					projectTo2DForQuads(matrix);
				}
			}

			if (parent === ancestor) {
				const ancestorEl = parent as HTMLElement;
				if (ancestorEl.scrollTop || ancestorEl.scrollLeft) {
					matrix = new DOMMatrix()
						.translate(-ancestorEl.scrollLeft, -ancestorEl.scrollTop)
						.multiply(matrix);
				}

				return matrix;
			}
		}

		current = parent;
	}

	return matrix;
}

function createDomPoint(x: number, y: number): DOMPoint {
	if (typeof DOMPoint === 'function') {
		return new DOMPoint(x, y);
	}

	return {x, y} as unknown as DOMPoint;
}

function projectPointForQuads(point: DOMPoint, m: DOMMatrix): DOMPoint {
	const z = -(point.x * m.m13 + point.y * m.m23 + m.m43) / m.m33;
	return new DOMPoint(point.x, point.y, z, 1);
}

function as2DPointForQuads(point: DOMPoint): DOMPoint {
	return new DOMPoint(point.x / point.w, point.y / point.w);
}

function transformPointBoxForQuads(
	point: DOMPointInit,
	box: GetBoxQuadsBox,
	style: CSSStyleDeclaration,
	operator: number,
): DOMPoint {
	if (box === 'margin') {
		return new DOMPoint(
			(point.x ?? 0) - operator * parseFloat(style.marginLeft),
			(point.y ?? 0) - operator * parseFloat(style.marginTop),
		);
	}

	if (box === 'padding') {
		return new DOMPoint(
			(point.x ?? 0) + operator * parseFloat(style.borderLeftWidth),
			(point.y ?? 0) + operator * parseFloat(style.borderTopWidth),
		);
	}

	if (box === 'content') {
		return new DOMPoint(
			(point.x ?? 0) +
				operator *
					(parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft)),
			(point.y ?? 0) +
				operator *
					(parseFloat(style.borderTopWidth) + parseFloat(style.paddingTop)),
		);
	}

	return new DOMPoint(point.x ?? 0, point.y ?? 0);
}

type ConvertBoxOptions = {
	fromBox?: GetBoxQuadsBox;
	toBox?: GetBoxQuadsBox;
};

function convertQuadFromNodePolyfill(
	node: Node,
	quad: DOMQuadInit,
	from: Element,
	options?: ConvertBoxOptions,
): DOMQuad {
	const ownerDocument =
		(node as any).ownerDocument ||
		(typeof document !== 'undefined' ? document : null);
	if (!ownerDocument) {
		return new DOMQuad();
	}

	const m1 = getResultingTransformationBetweenElementAndAllAncestorsForQuads(
		from,
		ownerDocument.body,
	);
	const m2 = getResultingTransformationBetweenElementAndAllAncestorsForQuads(
		node,
		ownerDocument.body,
	).inverse();

	let q = quad as DOMQuad;
	if (options?.fromBox && options.fromBox !== 'border') {
		const style = getCachedComputedStyleForQuads(from);
		q = new DOMQuad(
			transformPointBoxForQuads(q.p1, options.fromBox, style, -1),
			transformPointBoxForQuads(q.p2, options.fromBox, style, -1),
			transformPointBoxForQuads(q.p3, options.fromBox, style, -1),
			transformPointBoxForQuads(q.p4, options.fromBox, style, -1),
		);
	}

	let result = new DOMQuad(
		m2.transformPoint(m1.transformPoint(q.p1)),
		m2.transformPoint(m1.transformPoint(q.p2)),
		m2.transformPoint(m1.transformPoint(q.p3)),
		m2.transformPoint(m1.transformPoint(q.p4)),
	);

	if (options?.toBox && options.toBox !== 'border' && isElementForQuads(node)) {
		const style = getCachedComputedStyleForQuads(node as Element);
		result = new DOMQuad(
			transformPointBoxForQuads(result.p1, options.toBox, style, -1),
			transformPointBoxForQuads(result.p2, options.toBox, style, -1),
			transformPointBoxForQuads(result.p3, options.toBox, style, -1),
			transformPointBoxForQuads(result.p4, options.toBox, style, -1),
		);
	}

	return result;
}

function convertRectFromNodePolyfill(
	node: Node,
	rect: {x: number; y: number; width: number; height: number},
	from: Element,
	options?: ConvertBoxOptions,
): DOMQuad {
	const ownerDocument =
		(node as any).ownerDocument ||
		(typeof document !== 'undefined' ? document : null);
	if (!ownerDocument) {
		return new DOMQuad();
	}

	const m1 = getResultingTransformationBetweenElementAndAllAncestorsForQuads(
		from,
		ownerDocument.body.parentElement ?? ownerDocument.body,
	);
	const m2 = getResultingTransformationBetweenElementAndAllAncestorsForQuads(
		node,
		ownerDocument.body.parentElement ?? ownerDocument.body,
	).inverse();

	let r = rect;
	if (options?.fromBox && options.fromBox !== 'border') {
		const style = getCachedComputedStyleForQuads(from);
		const p = transformPointBoxForQuads(
			new DOMPoint(rect.x, rect.y),
			options.fromBox,
			style,
			1,
		);
		r = {x: p.x, y: p.y, width: rect.width, height: rect.height};
	}

	let result = new DOMQuad(
		m2.transformPoint(m1.transformPoint(new DOMPoint(r.x, r.y))),
		m2.transformPoint(m1.transformPoint(new DOMPoint(r.x + r.width, r.y))),
		m2.transformPoint(
			m1.transformPoint(new DOMPoint(r.x + r.width, r.y + r.height)),
		),
		m2.transformPoint(m1.transformPoint(new DOMPoint(r.x, r.y + r.height))),
	);

	if (options?.toBox && options.toBox !== 'border' && isElementForQuads(node)) {
		const style = getCachedComputedStyleForQuads(node as Element);
		result = new DOMQuad(
			transformPointBoxForQuads(result.p1, options.toBox, style, -1),
			transformPointBoxForQuads(result.p2, options.toBox, style, -1),
			transformPointBoxForQuads(result.p3, options.toBox, style, -1),
			transformPointBoxForQuads(result.p4, options.toBox, style, -1),
		);
	}

	return result;
}

function convertPointFromNodePolyfill(
	node: Node,
	point: DOMPointInit,
	from: Element,
	options?: ConvertBoxOptions,
): DOMPoint {
	const ownerDocument =
		(node as any).ownerDocument ||
		(typeof document !== 'undefined' ? document : null);
	if (!ownerDocument) {
		return new DOMPoint();
	}

	const m1 = getResultingTransformationBetweenElementAndAllAncestorsForQuads(
		from,
		ownerDocument.body.parentElement ?? ownerDocument.body,
	);
	const m2 = getResultingTransformationBetweenElementAndAllAncestorsForQuads(
		node,
		ownerDocument.body,
	).inverse();

	let p: DOMPointInit = point;
	if (options?.fromBox && options.fromBox !== 'border') {
		const style = getCachedComputedStyleForQuads(from);
		p = transformPointBoxForQuads(point, options.fromBox, style, 1);
	}

	let result = m2.transformPoint(m1.transformPoint(p));

	if (options?.toBox && options.toBox !== 'border' && isElementForQuads(node)) {
		const style = getCachedComputedStyleForQuads(node as Element);
		result = transformPointBoxForQuads(result, options.toBox, style, -1);
	}

	return result;
}

function polyfillGetBoxQuads(
	node: Node,
	options?: GetBoxQuadsOptions,
): DOMQuad[] {
	const ownerDocument =
		(node as any).ownerDocument ||
		(typeof document !== 'undefined' ? document : null);
	const defaultView = ownerDocument?.defaultView;

	if (!ownerDocument || !defaultView) {
		return [];
	}

	const isElement =
		node instanceof defaultView.Element ||
		node instanceof Element ||
		(defaultView.Element && node instanceof defaultView.Element);
	const isText =
		node instanceof defaultView.Text ||
		node instanceof Text ||
		(defaultView.Text && node instanceof defaultView.Text);

	if (!isElement && !isText) return [];

	const relativeTo = options?.relativeTo ?? ownerDocument.body;
	const matrix =
		getResultingTransformationBetweenElementAndAllAncestorsForQuads(
			node,
			relativeTo,
		);

	if (isText) {
		const {width, height} = getElementSizeForQuads(node, matrix);

		const textPoints = [
			createDomPoint(0, 0),
			createDomPoint(width, 0),
			createDomPoint(width, height),
			createDomPoint(0, height),
		];
		const transformedText = textPoints.map((p) => {
			const projected = projectPointForQuads(p, matrix);
			const result = projected.matrixTransform(matrix);
			return as2DPointForQuads(result);
		});

		if (typeof DOMQuad === 'function') {
			return [
				new DOMQuad(
					transformedText[0],
					transformedText[1],
					transformedText[2],
					transformedText[3],
				),
			];
		}

		return [
			{
				p1: transformedText[0],
				p2: transformedText[1],
				p3: transformedText[2],
				p4: transformedText[3],
			} as unknown as DOMQuad,
		];
	}

	const element = node as Element;
	const {width, height} = getElementSizeForQuads(element, matrix);
	const box = options?.box ?? 'border';

	const style = getCachedComputedStyleForQuads(element);
	const borderTop = parseCssLengthValue(style?.borderTopWidth);
	const borderRight = parseCssLengthValue(style?.borderRightWidth);
	const borderBottom = parseCssLengthValue(style?.borderBottomWidth);
	const borderLeft = parseCssLengthValue(style?.borderLeftWidth);
	const paddingTop = parseCssLengthValue(style?.paddingTop);
	const paddingRight = parseCssLengthValue(style?.paddingRight);
	const paddingBottom = parseCssLengthValue(style?.paddingBottom);
	const paddingLeft = parseCssLengthValue(style?.paddingLeft);
	const marginTop = parseCssLengthValue(style?.marginTop);
	const marginRight = parseCssLengthValue(style?.marginRight);
	const marginBottom = parseCssLengthValue(style?.marginBottom);
	const marginLeft = parseCssLengthValue(style?.marginLeft);

	let points: DOMPoint[];

	switch (box) {
		case 'margin':
			points = [
				createDomPoint(-marginLeft, -marginTop),
				createDomPoint(width + marginRight, -marginTop),
				createDomPoint(width + marginRight, height + marginBottom),
				createDomPoint(-marginLeft, height + marginBottom),
			];
			break;
		case 'padding':
			points = [
				createDomPoint(borderLeft, borderTop),
				createDomPoint(width - borderRight, borderTop),
				createDomPoint(width - borderRight, height - borderBottom),
				createDomPoint(borderLeft, height - borderBottom),
			];
			break;
		case 'content':
			points = [
				createDomPoint(borderLeft + paddingLeft, borderTop + paddingTop),
				createDomPoint(
					width - borderRight - paddingRight,
					borderTop + paddingTop,
				),
				createDomPoint(
					width - borderRight - paddingRight,
					height - borderBottom - paddingBottom,
				),
				createDomPoint(
					borderLeft + paddingLeft,
					height - borderBottom - paddingBottom,
				),
			];
			break;
		default:
			points = [
				createDomPoint(0, 0),
				createDomPoint(width, 0),
				createDomPoint(width, height),
				createDomPoint(0, height),
			];
	}

	const transformed = points.map((p) => {
		const projected = projectPointForQuads(p, matrix);
		const result = projected.matrixTransform(matrix);
		return as2DPointForQuads(result);
	});

	if (typeof DOMQuad === 'function') {
		return [
			new DOMQuad(
				transformed[0],
				transformed[1],
				transformed[2],
				transformed[3],
			),
		];
	}

	return [
		{
			p1: transformed[0],
			p2: transformed[1],
			p3: transformed[2],
			p4: transformed[3],
		} as unknown as DOMQuad,
	];
}

function installGetBoxQuadsPolyfillIfNeeded(): void {
	if (typeof window === 'undefined') return;
	const NodeProto = window.Node?.prototype as any;
	if (!NodeProto) return;

	if (typeof NodeProto.getBoxQuads !== 'function') {
		NodeProto.getBoxQuads = function getBoxQuads(options?: GetBoxQuadsOptions) {
			return polyfillGetBoxQuads(this, options);
		};
	}

	if (typeof NodeProto.convertQuadFromNode !== 'function') {
		NodeProto.convertQuadFromNode = function convertQuadFromNode(
			quad: DOMQuadInit,
			from: Element,
			options?: ConvertBoxOptions,
		) {
			return convertQuadFromNodePolyfill(this, quad, from, options);
		};
	}

	if (typeof NodeProto.convertRectFromNode !== 'function') {
		NodeProto.convertRectFromNode = function convertRectFromNode(
			rect: {x: number; y: number; width: number; height: number},
			from: Element,
			options?: ConvertBoxOptions,
		) {
			return convertRectFromNodePolyfill(this, rect, from, options);
		};
	}

	if (typeof NodeProto.convertPointFromNode !== 'function') {
		NodeProto.convertPointFromNode = function convertPointFromNode(
			point: DOMPointInit,
			from: Element,
			options?: ConvertBoxOptions,
		) {
			return convertPointFromNodePolyfill(this, point, from, options);
		};
	}
}

if (typeof window !== 'undefined') {
	installCanvasFilterPolyfillIfNeeded();
	installGetBoxQuadsPolyfillIfNeeded();
}
