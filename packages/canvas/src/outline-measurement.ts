import {useCache as resetBoxQuadsCache} from './get-box-quads-polyfill-internals.js';
import {getBoxQuadsPonyfill} from './get-box-quads-ponyfill';
import type {
	CanvasOutline,
	CanvasOutlinePoint,
	CanvasOutlineTarget,
} from './outline-geometry';
import {getCanvasOutlinePoint, getCanvasOutlineUv} from './outline-geometry';

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

const getSvgSvgElementOutlinePoints = (
	element: SVGSVGElement,
	containerRect: DOMRect,
): CanvasOutline['points'] | null => {
	const ctm = element.getScreenCTM();
	const viewport = getSvgSvgElementViewport(element);
	if (ctm === null || (viewport.width === 0 && viewport.height === 0)) {
		return null;
	}

	return getTransformedSvgViewportPoints({
		viewport,
		ctm,
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

const pathSampleSpacing = 8;
const maxPathSamples = 400;

const getPathPoints = ({
	element,
	containerRect,
}: {
	readonly element: SVGPathElement;
	readonly containerRect: DOMRect;
}): readonly CanvasOutlinePoint[] | null => {
	const ctm = element.getScreenCTM();
	if (ctm === null) {
		return null;
	}

	const totalLength = element.getTotalLength();
	if (totalLength === 0) {
		return null;
	}

	const count = Math.min(
		maxPathSamples,
		Math.max(2, Math.ceil(totalLength / pathSampleSpacing) + 1),
	);
	const points: CanvasOutlinePoint[] = [];
	for (let i = 0; i < count; i++) {
		// Walk the length so each sample is equidistant along the geometry.
		const length = (totalLength * i) / (count - 1);
		const point = element.getPointAtLength(length);
		points.push({
			x: ctm.a * point.x + ctm.c * point.y + ctm.e - containerRect.left,
			y: ctm.b * point.x + ctm.d * point.y + ctm.f - containerRect.top,
		});
	}

	return points;
};

const cropPathPoints = (
	pathPoints: readonly CanvasOutlinePoint[],
	uncroppedPoints: CanvasOutline['uncroppedPoints'],
	crop: CanvasOutlineTarget['crop'],
): readonly CanvasOutlinePoint[] => {
	if (
		crop.left === 0 &&
		crop.right === 0 &&
		crop.top === 0 &&
		crop.bottom === 0
	) {
		return pathPoints;
	}

	if (uncroppedPoints === null) {
		return pathPoints;
	}

	return pathPoints.map((point) => {
		const uv = getCanvasOutlineUv(uncroppedPoints, point);
		return getCanvasOutlinePoint(
			cropCanvasOutlinePoints(uncroppedPoints, crop),
			uv,
		);
	});
};

const getElementOutlinePoints = (
	element: Element,
	containerRect: DOMRect,
	includeOutsideContainer: boolean,
): CanvasOutline['points'] | null => {
	const elementRect = element.getBoundingClientRect();

	if (elementRect.width === 0 && elementRect.height === 0) {
		return null;
	}

	if (
		!includeOutsideContainer &&
		(elementRect.right <= containerRect.left ||
			elementRect.left >= containerRect.right ||
			elementRect.bottom <= containerRect.top ||
			elementRect.top >= containerRect.bottom)
	) {
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

	for (const target of targets) {
		const element = target.ref.current;
		if (element === null) {
			continue;
		}

		const uncroppedPoints = getElementOutlinePoints(
			element,
			containerRect,
			target.includeOutsideContainer,
		);
		if (uncroppedPoints === null) {
			continue;
		}

		const points = cropCanvasOutlinePoints(uncroppedPoints, target.crop);
		const ownerHTMLElement = element.ownerDocument.defaultView?.HTMLElement;

		const pathPoints = isSvgPathElement(element)
			? (() => {
					const sampled = getPathPoints({element, containerRect});
					return sampled === null
						? null
						: cropPathPoints(sampled, uncroppedPoints, target.crop);
				})()
			: null;

		outlines.push({
			key: target.key,
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
			points,
			pathPoints,
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

		const aPathPoints = a[i].pathPoints;
		const bPathPoints = b[i].pathPoints;
		if ((aPathPoints === null) !== (bPathPoints === null)) {
			return false;
		}

		if (aPathPoints !== null && bPathPoints !== null) {
			if (aPathPoints.length !== bPathPoints.length) {
				return false;
			}

			for (let j = 0; j < aPathPoints.length; j++) {
				if (
					Math.abs(aPathPoints[j].x - bPathPoints[j].x) > 0.01 ||
					Math.abs(aPathPoints[j].y - bPathPoints[j].y) > 0.01
				) {
					return false;
				}
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
