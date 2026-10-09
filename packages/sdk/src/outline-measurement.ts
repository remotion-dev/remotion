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
	contentRoot: HTMLElement,
	rootRect: DOMRect,
): CanvasOutline['points'] => {
	const scaleX = rootRect.width / contentRoot.offsetWidth;
	const scaleY = rootRect.height / contentRoot.offsetHeight;
	const left = (elementRect.left - rootRect.left) / scaleX;
	const top = (elementRect.top - rootRect.top) / scaleY;
	const right = (elementRect.right - rootRect.left) / scaleX;
	const bottom = (elementRect.bottom - rootRect.top) / scaleY;

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

const quadToPoints = (quad: DOMQuad): CanvasOutline['points'] => {
	return [
		{x: quad.p1.x, y: quad.p1.y},
		{x: quad.p2.x, y: quad.p2.y},
		{x: quad.p3.x, y: quad.p3.y},
		{x: quad.p4.x, y: quad.p4.y},
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
 * Maps SVG user units to composition pixels, including ancestor CSS transforms.
 *
 * `getScreenCTM()` is the obvious API for this, but WebKit ignores ancestor
 * CSS transforms in it, while Blink/Gecko include them — so a Studio fit-scale
 * wrapper would make the outline render at the wrong size in Safari. Instead
 * we compose two consistent transforms:
 *
 * 1. The polyfill's CSS-transform-aware walk from the root <svg> to the
 *    composition root.
 * 2. `element.getCTM()`, the pure SVG-internal transform from user units to
 *    the root <svg>'s viewport. Cross-browser consistent, no CSS involved.
 *
 */
const getSvgElementCompositionMatrix = (
	element: SVGGraphicsElement,
	contentRoot: HTMLElement,
): (SvgScreenCtm & {readonly is2D: boolean}) | null => {
	const ownerSvg = element.ownerSVGElement;
	if (!ownerSvg) {
		return null;
	}

	let walk;
	try {
		// Walking the root <svg> (not the path) avoids the polyfill's
		// bbox-translate branch for SVG children, which would shift the
		// coordinates by the path's `getBBox()` origin.
		walk = getResultingTransformationBetweenElementAndAllAncestors(
			ownerSvg,
			contentRoot,
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

	return walk.multiply(ctm);
};

const getSvgSvgElementOutlinePoints = (
	element: SVGSVGElement,
	contentRoot: HTMLElement,
): CanvasOutline['points'] | null => {
	const viewport = getSvgSvgElementViewport(element);
	if (viewport.width === 0 && viewport.height === 0) {
		return null;
	}

	let walk;
	try {
		// The walk on the root <svg> includes its own CSS transform, unlike
		// `getScreenCTM()` in WebKit, which ignores ancestor CSS transforms.
		walk = getResultingTransformationBetweenElementAndAllAncestors(
			element,
			contentRoot,
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

	return getTransformedSvgViewportPoints({
		viewport,
		ctm: {
			a: walk.a * scaleX,
			b: walk.b * scaleX,
			c: walk.c * scaleY,
			d: walk.d * scaleY,
			e: walk.a * translateX + walk.c * translateY + walk.e,
			f: walk.b * translateX + walk.d * translateY + walk.f,
		},
		containerRect: {left: 0, top: 0},
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
	contentRoot,
}: {
	readonly element: SVGPathElement;
	readonly contentRoot: HTMLElement;
}): CanvasOutlinePath | null => {
	const d = element.getAttribute('d');
	if (d === null || d === '') {
		return null;
	}

	const ctm = getSvgElementCompositionMatrix(element, contentRoot);
	if (ctm === null || !ctm.is2D) {
		// In a 3D CSS context no single 2D matrix can place the path; the
		// polygon outline from `getBoxQuads` still applies.
		return null;
	}

	return {
		d,
		matrix: {
			a: ctm.a,
			b: ctm.b,
			c: ctm.c,
			d: ctm.d,
			e: ctm.e,
			f: ctm.f,
		},
	};
};

const getElementOutlinePoints = (
	element: Element,
	elementRect: DOMRect,
	contentRoot: HTMLElement,
	rootRect: DOMRect,
): CanvasOutline['points'] | null => {
	if (elementRect.width === 0 && elementRect.height === 0) {
		return null;
	}

	if (isSvgSvgElement(element)) {
		return getSvgSvgElementOutlinePoints(element, contentRoot);
	}

	// The composition root is a real ancestor. Measuring relative to it avoids
	// rounding the host's fractional viewport offsets before normalization.
	// The sibling overlay cannot be used as `relativeTo` by the ponyfill.
	const quads = getBoxQuadsPonyfill(element, {
		box: 'border',
		relativeTo: contentRoot,
	});
	const quad = quads?.[0];
	if (!quad) {
		return rectToPoints(elementRect, contentRoot, rootRect);
	}

	return quadToPoints(quad);
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
 * Measures a batch in composition pixels at scale 1. Shared ancestor transforms
 * are cached only within this measurement batch.
 */
export const measureCanvasOutlineTargets = (
	contentRoot: HTMLElement,
	targets: readonly CanvasOutlineTarget[],
): CanvasOutline[] => {
	resetBoxQuadsCache();
	const rootRect = contentRoot.getBoundingClientRect();
	const outlines: CanvasOutline[] = [];
	if (rootRect.width === 0 || rootRect.height === 0) {
		return outlines;
	}

	const geometry = new Map<
		Element | Text,
		| (Pick<CanvasOutline, 'dimensions' | 'path'> & {
				uncroppedPoints: CanvasOutline['points'];
		  })
		| null
	>();
	for (const target of targets) {
		const customOutline = target.ref.current;
		if (customOutline !== null && !(customOutline instanceof Element)) {
			const customMeasurement = customOutline.measure();
			if (customMeasurement === null) {
				continue;
			}

			const scaleX =
				contentRoot.offsetWidth > 0
					? rootRect.width / contentRoot.offsetWidth
					: 1;
			const scaleY =
				contentRoot.offsetHeight > 0
					? rootRect.height / contentRoot.offsetHeight
					: 1;
			const toContainerPoint = (point: CanvasOutlinePoint) => ({
				x: (point.x - rootRect.left) / scaleX,
				y: (point.y - rootRect.top) / scaleY,
			});
			const customPoints: CanvasOutline['points'] = [
				toContainerPoint(customMeasurement.points[0]),
				toContainerPoint(customMeasurement.points[1]),
				toContainerPoint(customMeasurement.points[2]),
				toContainerPoint(customMeasurement.points[3]),
			];
			outlines.push({
				key: target.key,
				dimensions:
					customMeasurement.dimensions === null
						? null
						: {
								width: customMeasurement.dimensions.width / scaleX,
								height: customMeasurement.dimensions.height / scaleY,
							},
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
			if (!geometry.has(node)) {
				if (node.nodeType === 3) {
					const text = node as Text;
					const quads = getBoxQuadsPonyfill(text, {relativeTo: contentRoot});
					let textPoints = quads?.flatMap(quadToPoints) ?? [];
					if (textPoints.length === 0) {
						const range = text.ownerDocument.createRange();
						range.selectNodeContents(text);
						const rect = range.getBoundingClientRect();
						if (rect.width !== 0 || rect.height !== 0) {
							textPoints = [...rectToPoints(rect, contentRoot, rootRect)];
						}
					}

					if (textPoints.length === 0) {
						geometry.set(node, null);
					} else {
						const xs = textPoints.map((point) => point.x);
						const ys = textPoints.map((point) => point.y);
						const textLeft = Math.min(...xs);
						const textTop = Math.min(...ys);
						const textRight = Math.max(...xs);
						const textBottom = Math.max(...ys);
						geometry.set(
							node,
							textLeft === textRight && textTop === textBottom
								? null
								: {
										dimensions: null,
										path: null,
										uncroppedPoints: [
											{x: textLeft, y: textTop},
											{x: textRight, y: textTop},
											{x: textRight, y: textBottom},
											{x: textLeft, y: textBottom},
										],
									},
						);
					}
				} else {
					const element = node as Element;
					const uncroppedPoints = getElementOutlinePoints(
						element,
						element.getBoundingClientRect(),
						contentRoot,
						rootRect,
					);
					const ownerHTMLElement =
						element.ownerDocument.defaultView?.HTMLElement;
					geometry.set(
						node,
						uncroppedPoints === null
							? null
							: {
									dimensions:
										ownerHTMLElement !== undefined &&
										element instanceof ownerHTMLElement
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
									path: isSvgPathElement(element)
										? getPathOutline({element, contentRoot})
										: null,
									uncroppedPoints,
								},
					);
				}
			}

			const measured = geometry.get(node);
			if (!measured) {
				continue;
			}

			measurableNodes.push(node);
			for (const point of measured.uncroppedPoints) {
				left = Math.min(left, point.x);
				top = Math.min(top, point.y);
				right = Math.max(right, point.x);
				bottom = Math.max(bottom, point.y);
			}
		}

		if (
			measurableNodes.length === 0 ||
			(!target.includeOutsideContainer &&
				(right <= 0 ||
					left >= contentRoot.offsetWidth ||
					bottom <= 0 ||
					top >= contentRoot.offsetHeight))
		) {
			continue;
		}

		if (measurableNodes.length !== 1 || measurableNodes[0].nodeType !== 1) {
			const groupPoints: CanvasOutline['points'] = [
				{x: left, y: top},
				{x: right, y: top},
				{x: right, y: bottom},
				{x: left, y: bottom},
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

		const elementGeometry = geometry.get(measurableNodes[0]);
		if (!elementGeometry) {
			throw new Error('Expected measured outline geometry');
		}

		outlines.push({
			...elementGeometry,
			key: target.key,
			points: cropCanvasOutlinePoints(
				elementGeometry.uncroppedPoints,
				target.crop,
			),
		});
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
