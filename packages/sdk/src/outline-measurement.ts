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
	containerRect: Pick<DOMRect, 'left' | 'top'>,
	scale: number,
): CanvasOutline['points'] => {
	return [
		{
			x: (quad.p1.x - containerRect.left) * scale,
			y: (quad.p1.y - containerRect.top) * scale,
		},
		{
			x: (quad.p2.x - containerRect.left) * scale,
			y: (quad.p2.y - containerRect.top) * scale,
		},
		{
			x: (quad.p3.x - containerRect.left) * scale,
			y: (quad.p3.y - containerRect.top) * scale,
		},
		{
			x: (quad.p4.x - containerRect.left) * scale,
			y: (quad.p4.y - containerRect.top) * scale,
		},
	];
};

type OutlineCoordinateSpace = {
	readonly root: Element;
	readonly scale: number;
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
 *    composition root, or to the document element for viewport measurements.
 * 2. `element.getCTM()`, the pure SVG-internal transform from user units to
 *    the root <svg>'s viewport. Cross-browser consistent, no CSS involved.
 *
 * Composition coordinates are projected to the host scale. Viewport measurements
 * subtract window scroll and the overlay origin, like HTML quads.
 */
const getSvgElementScreenMatrix = (
	element: SVGGraphicsElement,
	coordinateSpace: OutlineCoordinateSpace | null,
): (SvgScreenCtm & {readonly is2D: boolean}) | null => {
	const ownerSvg = element.ownerSVGElement;
	const {documentElement} = element.ownerDocument;
	const win = element.ownerDocument.defaultView;
	if (!ownerSvg || !documentElement || !win) {
		return null;
	}

	const relativeSpace = coordinateSpace?.root.contains(ownerSvg)
		? coordinateSpace
		: null;

	let walk;
	try {
		// Walking the root <svg> (not the path) avoids the polyfill's
		// bbox-translate branch for SVG children, which would shift the
		// coordinates by the path's `getBBox()` origin.
		walk = getResultingTransformationBetweenElementAndAllAncestors(
			ownerSvg,
			relativeSpace?.root ?? documentElement,
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
	const scrollX =
		relativeSpace === null
			? (win.scrollX ?? documentElement.scrollLeft ?? 0)
			: 0;
	const scrollY =
		relativeSpace === null
			? (win.scrollY ?? documentElement.scrollTop ?? 0)
			: 0;
	const scale = relativeSpace?.scale ?? 1;

	return {
		a: matrix.a * scale,
		b: matrix.b * scale,
		c: matrix.c * scale,
		d: matrix.d * scale,
		e: matrix.e * scale - scrollX,
		f: matrix.f * scale - scrollY,
		is2D: matrix.is2D,
	};
};

const getSvgSvgElementOutlinePoints = (
	element: SVGSVGElement,
	containerRect: DOMRect,
	coordinateSpace: OutlineCoordinateSpace | null,
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

	const relativeSpace = coordinateSpace?.root.contains(element)
		? coordinateSpace
		: null;

	let walk;
	try {
		// The walk on the root <svg> includes its own CSS transform, unlike
		// `getScreenCTM()` in WebKit, which ignores ancestor CSS transforms.
		walk = getResultingTransformationBetweenElementAndAllAncestors(
			element,
			relativeSpace?.root ?? documentElement,
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
	// dependency-free. `walk` maps viewport px into the chosen coordinate space.
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

	const scrollX =
		relativeSpace === null
			? (win.scrollX ?? documentElement.scrollLeft ?? 0)
			: 0;
	const scrollY =
		relativeSpace === null
			? (win.scrollY ?? documentElement.scrollTop ?? 0)
			: 0;
	const scale = relativeSpace?.scale ?? 1;

	return getTransformedSvgViewportPoints({
		viewport,
		ctm: {
			a: walk.a * scaleX * scale,
			b: walk.b * scaleX * scale,
			c: walk.c * scaleY * scale,
			d: walk.d * scaleY * scale,
			e: (walk.a * translateX + walk.c * translateY + walk.e) * scale - scrollX,
			f: (walk.b * translateX + walk.d * translateY + walk.f) * scale - scrollY,
		},
		containerRect: relativeSpace === null ? containerRect : {left: 0, top: 0},
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
	coordinateSpace,
}: {
	readonly element: SVGPathElement;
	readonly containerRect: DOMRect;
	readonly coordinateSpace: OutlineCoordinateSpace | null;
}): CanvasOutlinePath | null => {
	const d = element.getAttribute('d');
	if (d === null || d === '') {
		return null;
	}

	const ctm = getSvgElementScreenMatrix(element, coordinateSpace);
	if (ctm === null || !ctm.is2D) {
		// In a 3D CSS context no single 2D matrix can place the path; the
		// polygon outline from `getBoxQuads` still applies.
		return null;
	}

	const origin = coordinateSpace?.root.contains(element.ownerSVGElement)
		? {left: 0, top: 0}
		: containerRect;
	return {
		d,
		matrix: {
			a: ctm.a,
			b: ctm.b,
			c: ctm.c,
			d: ctm.d,
			e: ctm.e - origin.left,
			f: ctm.f - origin.top,
		},
	};
};

const getElementOutlinePoints = (
	element: Element,
	elementRect: DOMRect,
	containerRect: DOMRect,
	coordinateSpace: OutlineCoordinateSpace | null,
): CanvasOutline['points'] | null => {
	if (elementRect.width === 0 && elementRect.height === 0) {
		return null;
	}

	if (isSvgSvgElement(element)) {
		return getSvgSvgElementOutlinePoints(
			element,
			containerRect,
			coordinateSpace,
		);
	}

	// The composition root is a real ancestor. Measuring relative to it avoids
	// rounding the host's fractional viewport offsets before normalization.
	// The sibling overlay cannot be used as `relativeTo` by the ponyfill.
	const relativeTo = coordinateSpace?.root.contains(element)
		? coordinateSpace.root
		: null;
	const quads = getBoxQuadsPonyfill(
		element,
		relativeTo === null ? {box: 'border'} : {box: 'border', relativeTo},
	);
	const quad = quads?.[0];
	if (!quad) {
		return rectToPoints(elementRect, containerRect);
	}

	return relativeTo === null
		? quadToPoints(quad, containerRect, 1)
		: quadToPoints(quad, {left: 0, top: 0}, coordinateSpace?.scale ?? 1);
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
	coordinateSpace: OutlineCoordinateSpace | null,
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
			coordinateSpace,
		);
		if (uncroppedPoints === null) {
			continue;
		}

		const points = cropCanvasOutlinePoints(uncroppedPoints, target.crop);
		const ownerHTMLElement = element.ownerDocument.defaultView?.HTMLElement;

		const path = isSvgPathElement(element)
			? getPathOutline({element, containerRect, coordinateSpace})
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
