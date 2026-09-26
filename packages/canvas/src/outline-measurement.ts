import {
	getResultingTransformationBetweenElementAndAllAncestors,
	useCache as resetBoxQuadsCache,
} from './get-box-quads-polyfill-internals.js';
import {getBoxQuadsPonyfill} from './get-box-quads-ponyfill';
import type {
	CanvasOutline,
	CanvasOutlinePoint,
	CanvasOutlinePath,
	CanvasOutlineTarget,
} from './outline-geometry';
import {getCanvasOutlinePoint} from './outline-geometry';
import {getCanvasOutlineNodes} from './outline-nodes';

const rectToPoints = (
	elementRect: DOMRect,
	containerRect: DOMRect,
): CanvasOutline['points'] => {
	const left = elementRect.left - containerRect.left;
	const top = elementRect.top - containerRect.top;
	const right = elementRect.right - containerRect.left;
	const bottom = elementRect.bottom - containerRect.top;

	return [
		{x: left, y: top},
		{x: right, y: top},
		{x: right, y: bottom},
		{x: left, y: bottom},
	];
};

type SvgViewport = {
	readonly x: number;
	readonly y: number;
	readonly width: number;
	readonly height: number;
};

type SvgScreenCtm = Pick<DOMMatrixReadOnly, 'a' | 'b' | 'c' | 'd' | 'e' | 'f'>;

export const getTransformedSvgViewportPoints = ({
	viewport,
	ctm,
	containerRect,
}: {
	readonly viewport: SvgViewport;
	readonly ctm: SvgScreenCtm;
	readonly containerRect: Pick<DOMRect, 'left' | 'top'>;
}): CanvasOutline['points'] => {
	const transformPoint = (x: number, y: number): CanvasOutlinePoint => ({
		x: ctm.a * x + ctm.c * y + ctm.e - containerRect.left,
		y: ctm.b * x + ctm.d * y + ctm.f - containerRect.top,
	});

	const left = viewport.x;
	const top = viewport.y;
	const right = viewport.x + viewport.width;
	const bottom = viewport.y + viewport.height;

	return [
		transformPoint(left, top),
		transformPoint(right, top),
		transformPoint(right, bottom),
		transformPoint(left, bottom),
	];
};

const quadToPoints = (
	quad: DOMQuad,
	containerRect: DOMRect,
): CanvasOutline['points'] => {
	// `getBoxQuads`/the ponyfill returns the quad in viewport coordinates.
	// The overlay <svg> is unscaled (the canvas `scale()`/pan live on a sibling
	// container, not the svg), so 1 user unit == 1 px and we only need to move
	// the quad into the svg's local space by subtracting its viewport origin.
	// We deliberately do not pass `relativeTo` to the ponyfill: when the target
	// is not an ancestor of the element, the polyfill cannot resolve the
	// coordinate space and leaves the quad in viewport coordinates.
	return [
		{x: quad.p1.x - containerRect.left, y: quad.p1.y - containerRect.top},
		{x: quad.p2.x - containerRect.left, y: quad.p2.y - containerRect.top},
		{x: quad.p3.x - containerRect.left, y: quad.p3.y - containerRect.top},
		{x: quad.p4.x - containerRect.left, y: quad.p4.y - containerRect.top},
	];
};

const isSvgSvgElement = (element: Element): element is SVGSVGElement => {
	const ownerSvgSvgElement = element.ownerDocument.defaultView?.SVGSVGElement;
	return (
		(typeof SVGSVGElement !== 'undefined' &&
			element instanceof SVGSVGElement) ||
		(ownerSvgSvgElement !== undefined && element instanceof ownerSvgSvgElement)
	);
};

const getSvgSvgElementViewport = (element: SVGSVGElement): SvgViewport => {
	const viewBox = element.viewBox.baseVal;
	if (viewBox.width > 0 && viewBox.height > 0) {
		return {
			x: viewBox.x,
			y: viewBox.y,
			width: viewBox.width,
			height: viewBox.height,
		};
	}

	return {
		x: 0,
		y: 0,
		width: element.width.baseVal.value,
		height: element.height.baseVal.value,
	};
};

/**
 * Maps SVG user units to viewport pixels, including ancestor CSS transforms.
 *
 * `getScreenCTM()` is the obvious API for this, but WebKit ignores ancestor
 * CSS transforms in it, while Blink/Gecko include them — so a Studio fit-scale
 * wrapper would make the outline render at the wrong size in Safari. Instead
 * we compose two consistent transforms:
 *
 * 1. The polyfill's CSS-transform-aware walk from the root <svg> to the
 *    document element (document coordinates, no viewport scroll — FIX 15).
 * 2. `element.getCTM()`, the pure SVG-internal transform from user units to
 *    the root <svg>'s viewport. Cross-browser consistent, no CSS involved.
 *
 * Finally we mirror `toViewportRelativeDocumentElementQuad`: subtract window
 * scroll to land in viewport coordinates, then subtract the overlay origin
 * (like `quadToPoints` does for HTML quads).
 */
const getSvgElementScreenMatrix = (
	element: SVGGraphicsElement,
): (SvgScreenCtm & {readonly is2D: boolean}) | null => {
	const ownerSvg = element.ownerSVGElement;
	const {documentElement} = element.ownerDocument;
	const win = element.ownerDocument.defaultView;
	if (!ownerSvg || !documentElement || !win) {
		return null;
	}

	let walk;
	try {
		// Walking the root <svg> (not the path) avoids the polyfill's
		// bbox-translate branch for SVG children, which would shift the
		// coordinates by the path's `getBBox()` origin.
		walk = getResultingTransformationBetweenElementAndAllAncestors(
			ownerSvg,
			documentElement,
			[],
		);
	} catch {
		// Mirrors getBoxQuadsPonyfill's try/catch contract for exotic DOMs.
		return null;
	}

	const ctm = element.getCTM();
	if (ctm === null) {
		return null;
	}

	const matrix = walk.multiply(ctm);
	const scrollX = win.scrollX ?? documentElement.scrollLeft ?? 0;
	const scrollY = win.scrollY ?? documentElement.scrollTop ?? 0;

	return {
		a: matrix.a,
		b: matrix.b,
		c: matrix.c,
		d: matrix.d,
		e: matrix.e - scrollX,
		f: matrix.f - scrollY,
		is2D: matrix.is2D,
	};
};

const getSvgSvgElementOutlinePoints = (
	element: SVGSVGElement,
	containerRect: DOMRect,
): CanvasOutline['points'] | null => {
	const viewport = getSvgSvgElementViewport(element);
	if (viewport.width === 0 && viewport.height === 0) {
		return null;
	}

	const {documentElement} = element.ownerDocument;
	const win = element.ownerDocument.defaultView;
	if (!documentElement || !win) {
		return null;
	}

	let walk;
	try {
		// The walk on the root <svg> includes its own CSS transform, unlike
		// `getScreenCTM()` in WebKit, which ignores ancestor CSS transforms.
		walk = getResultingTransformationBetweenElementAndAllAncestors(
			element,
			documentElement,
			[],
		);
	} catch {
		// Mirrors getBoxQuadsPonyfill's try/catch contract for exotic DOMs.
		return null;
	}

	if (!walk.is2D) {
		return null;
	}

	// Compose the viewBox→viewport transform manually: root-svg `getCTM()`
	// semantics are unreliable across browsers, and this keeps the math
	// dependency-free. `walk` maps viewport px → document coordinates.
	const viewBox = element.viewBox.baseVal;
	const hasViewBox = viewBox.width > 0 && viewBox.height > 0;
	const viewportWidth = element.width.baseVal.value;
	const viewportHeight = element.height.baseVal.value;

	let scaleX = 1;
	let scaleY = 1;
	let translateX = 0;
	let translateY = 0;
	if (hasViewBox) {
		// SVG_PRESERVEASPECTRATIO_NONE = 1, XMINYMIN = 2 … XMAXYMAX = 10;
		// SVG_MEETORSLICE_MEET = 1, SVG_MEETORSLICE_SLICE = 2.
		const {align, meetOrSlice} = element.preserveAspectRatio.baseVal;
		if (align === 1) {
			scaleX = viewportWidth / viewBox.width;
			scaleY = viewportHeight / viewBox.height;
		} else {
			const uniform =
				meetOrSlice === 2
					? Math.max(
							viewportWidth / viewBox.width,
							viewportHeight / viewBox.height,
						)
					: Math.min(
							viewportWidth / viewBox.width,
							viewportHeight / viewBox.height,
						);
			scaleX = uniform;
			scaleY = uniform;
			// x alignment: align % 3 → 2 = xMin, 0 = xMid, 1 = xMax.
			translateX =
				align % 3 === 0
					? (viewportWidth - viewBox.width * uniform) / 2
					: align % 3 === 1
						? viewportWidth - viewBox.width * uniform
						: 0;
			// y alignment: YMIN = 2–4, YMID = 5–7, YMAX = 8–10.
			translateY =
				align <= 4
					? 0
					: align <= 7
						? (viewportHeight - viewBox.height * uniform) / 2
						: viewportHeight - viewBox.height * uniform;
		}

		translateX -= viewBox.x * scaleX;
		translateY -= viewBox.y * scaleY;
	}

	const scrollX = win.scrollX ?? documentElement.scrollLeft ?? 0;
	const scrollY = win.scrollY ?? documentElement.scrollTop ?? 0;

	return getTransformedSvgViewportPoints({
		viewport,
		ctm: {
			a: walk.a * scaleX,
			b: walk.b * scaleX,
			c: walk.c * scaleY,
			d: walk.d * scaleY,
			e: walk.a * translateX + walk.c * translateY + walk.e - scrollX,
			f: walk.b * translateX + walk.d * translateY + walk.f - scrollY,
		},
		containerRect,
	});
};

const isSvgPathElement = (element: Element): element is SVGPathElement => {
	const ownerSvgPathElement = element.ownerDocument.defaultView?.SVGPathElement;
	return (
		(typeof SVGPathElement !== 'undefined' &&
			element instanceof SVGPathElement) ||
		(ownerSvgPathElement !== undefined &&
			element instanceof ownerSvgPathElement)
	);
};

const getPathOutline = ({
	element,
	containerRect,
}: {
	readonly element: SVGPathElement;
	readonly containerRect: DOMRect;
}): CanvasOutlinePath | null => {
	const d = element.getAttribute('d');
	if (d === null || d === '') {
		return null;
	}

	const ctm = getSvgElementScreenMatrix(element);
	if (ctm === null || !ctm.is2D) {
		// In a 3D CSS context no single 2D matrix can place the path; the
		// polygon outline from `getBoxQuads` still applies.
		return null;
	}

	// Shift the translation into the overlay svg's local space, like every
	// other point source.
	return {
		d,
		matrix: {
			a: ctm.a,
			b: ctm.b,
			c: ctm.c,
			d: ctm.d,
			e: ctm.e - containerRect.left,
			f: ctm.f - containerRect.top,
		},
	};
};

const getElementOutlinePoints = (
	element: Element,
	elementRect: DOMRect,
	containerRect: DOMRect,
): CanvasOutline['points'] | null => {
	if (elementRect.width === 0 && elementRect.height === 0) {
		return null;
	}

	if (isSvgSvgElement(element)) {
		return getSvgSvgElementOutlinePoints(element, containerRect);
	}

	const quads = getBoxQuadsPonyfill(element, {
		box: 'border',
	});
	const quad = quads?.[0];
	if (!quad) {
		return rectToPoints(elementRect, containerRect);
	}

	return quadToPoints(quad, containerRect);
};

export const cropCanvasOutlinePoints = (
	points: CanvasOutline['points'],
	crop: CanvasOutlineTarget['crop'],
): CanvasOutline['points'] => {
	if (
		crop.left === 0 &&
		crop.right === 0 &&
		crop.top === 0 &&
		crop.bottom === 0
	) {
		return points;
	}

	const {left, top} = crop;
	const right = 1 - crop.right;
	const bottom = 1 - crop.bottom;

	return [
		getCanvasOutlinePoint(points, [left, top]),
		getCanvasOutlinePoint(points, [right, top]),
		getCanvasOutlinePoint(points, [right, bottom]),
		getCanvasOutlinePoint(points, [left, bottom]),
	];
};

/**
 * Measures a batch against an unscaled overlay container. Shared ancestor
 * transforms are cached only within this measurement batch.
 */
export const measureCanvasOutlineTargets = (
	container: Element,
	targets: readonly CanvasOutlineTarget[],
): CanvasOutline[] => {
	// Reuse shared ancestor geometry within this synchronous batch only.
	resetBoxQuadsCache();
	const containerRect = container.getBoundingClientRect();
	const outlines: CanvasOutline[] = [];
	const rects = new Map<Element | Text, DOMRect>();
	const geometry = new Map<
		Element,
		Pick<CanvasOutline, 'dimensions' | 'path'> & {
			uncroppedPoints: CanvasOutline['points'];
		}
	>();

	for (const target of targets) {
		const customOutline = target.ref.current;
		if (customOutline !== null && !(customOutline instanceof Element)) {
			const customMeasurement = customOutline.measure();
			if (customMeasurement === null) {
				continue;
			}

			const toContainerPoint = (point: CanvasOutlinePoint) => ({
				x: point.x - containerRect.left,
				y: point.y - containerRect.top,
			});
			const customPoints: CanvasOutline['points'] = [
				toContainerPoint(customMeasurement.points[0]),
				toContainerPoint(customMeasurement.points[1]),
				toContainerPoint(customMeasurement.points[2]),
				toContainerPoint(customMeasurement.points[3]),
			];
			outlines.push({
				key: target.key,
				dimensions: customMeasurement.dimensions,
				uncroppedPoints: customPoints,
				points: cropCanvasOutlinePoints(customPoints, target.crop),
				path: null,
			});
			continue;
		}

		const nodes = getCanvasOutlineNodes(target.ref);
		let left = Infinity;
		let top = Infinity;
		let right = -Infinity;
		let bottom = -Infinity;
		const measurableNodes: (Element | Text)[] = [];
		for (const node of nodes) {
			let rect = rects.get(node);
			if (rect === undefined) {
				if (node.nodeType === 3) {
					const range = node.ownerDocument.createRange();
					range.selectNodeContents(node);
					rect = range.getBoundingClientRect();
				} else {
					rect = (node as Element).getBoundingClientRect();
				}

				rects.set(node, rect);
			}

			if (rect.width === 0 && rect.height === 0) {
				continue;
			}

			measurableNodes.push(node);
			left = Math.min(left, rect.left);
			top = Math.min(top, rect.top);
			right = Math.max(right, rect.right);
			bottom = Math.max(bottom, rect.bottom);
		}

		if (
			measurableNodes.length === 0 ||
			(!target.includeOutsideContainer &&
				(right <= containerRect.left ||
					left >= containerRect.right ||
					bottom <= containerRect.top ||
					top >= containerRect.bottom))
		) {
			continue;
		}

		if (measurableNodes.length !== 1 || measurableNodes[0].nodeType !== 1) {
			const groupPoints: CanvasOutline['points'] = [
				{x: left - containerRect.left, y: top - containerRect.top},
				{x: right - containerRect.left, y: top - containerRect.top},
				{x: right - containerRect.left, y: bottom - containerRect.top},
				{x: left - containerRect.left, y: bottom - containerRect.top},
			];
			outlines.push({
				key: target.key,
				points: groupPoints,
				uncroppedPoints: groupPoints,
				dimensions: null,
				path: null,
			});
			continue;
		}

		const element = measurableNodes[0] as Element;
		const cached = geometry.get(element);
		if (cached) {
			outlines.push({
				...cached,
				key: target.key,
				points: cropCanvasOutlinePoints(cached.uncroppedPoints, target.crop),
			});
			continue;
		}

		const elementRect = rects.get(element);
		if (elementRect === undefined) {
			throw new Error('Expected a measured outline element');
		}

		const uncroppedPoints = getElementOutlinePoints(
			element,
			elementRect,
			containerRect,
		);
		if (uncroppedPoints === null) {
			continue;
		}

		const points = cropCanvasOutlinePoints(uncroppedPoints, target.crop);
		const ownerHTMLElement = element.ownerDocument.defaultView?.HTMLElement;

		const path = isSvgPathElement(element)
			? getPathOutline({element, containerRect})
			: null;

		const measured = {
			dimensions:
				(typeof HTMLElement !== 'undefined' &&
					element instanceof HTMLElement) ||
				(ownerHTMLElement !== undefined && element instanceof ownerHTMLElement)
					? {
							width: element.offsetWidth,
							height: element.offsetHeight,
						}
					: isSvgSvgElement(element)
						? {
								width: element.width.baseVal.value,
								height: element.height.baseVal.value,
							}
						: null,
			uncroppedPoints,
			path,
		};
		geometry.set(element, measured);
		outlines.push({...measured, key: target.key, points});
	}

	return outlines;
};

export const canvasOutlinesAreEqual = (
	a: readonly CanvasOutline[],
	b: readonly CanvasOutline[],
): boolean => {
	if (a.length !== b.length) {
		return false;
	}

	for (let i = 0; i < a.length; i++) {
		if (a[i].key !== b[i].key) {
			return false;
		}

		if (
			a[i].dimensions?.width !== b[i].dimensions?.width ||
			a[i].dimensions?.height !== b[i].dimensions?.height
		) {
			return false;
		}

		const aUncropped = a[i].uncroppedPoints;
		const bUncropped = b[i].uncroppedPoints;
		if ((aUncropped === null) !== (bUncropped === null)) {
			return false;
		}

		if (aUncropped !== null && bUncropped !== null) {
			for (let j = 0; j < aUncropped.length; j++) {
				if (
					Math.abs(aUncropped[j].x - bUncropped[j].x) > 0.01 ||
					Math.abs(aUncropped[j].y - bUncropped[j].y) > 0.01
				) {
					return false;
				}
			}
		}

		const aPath = a[i].path;
		const bPath = b[i].path;
		if ((aPath === null) !== (bPath === null)) {
			return false;
		}

		if (aPath !== null && bPath !== null) {
			if (aPath.d !== bPath.d) {
				return false;
			}

			if (
				Math.abs(aPath.matrix.a - bPath.matrix.a) > 0.01 ||
				Math.abs(aPath.matrix.b - bPath.matrix.b) > 0.01 ||
				Math.abs(aPath.matrix.c - bPath.matrix.c) > 0.01 ||
				Math.abs(aPath.matrix.d - bPath.matrix.d) > 0.01 ||
				Math.abs(aPath.matrix.e - bPath.matrix.e) > 0.01 ||
				Math.abs(aPath.matrix.f - bPath.matrix.f) > 0.01
			) {
				return false;
			}
		}

		for (let j = 0; j < a[i].points.length; j++) {
			if (
				Math.abs(a[i].points[j].x - b[i].points[j].x) > 0.01 ||
				Math.abs(a[i].points[j].y - b[i].points[j].y) > 0.01
			) {
				return false;
			}
		}
	}

	return true;
};
