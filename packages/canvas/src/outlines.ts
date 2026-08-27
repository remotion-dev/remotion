import {useState, useSyncExternalStore, type RefObject} from 'react';
import {useCache as resetBoxQuadsCache} from './get-box-quads-polyfill-internals.js';
import {getBoxQuadsPonyfill} from './get-box-quads-ponyfill';

export type CanvasOutlinePoint = {
	readonly x: number;
	readonly y: number;
};

export type CanvasOutline = {
	readonly key: string;
	readonly dimensions: {
		readonly width: number;
		readonly height: number;
	} | null;
	readonly uncroppedPoints:
		| readonly [
				CanvasOutlinePoint,
				CanvasOutlinePoint,
				CanvasOutlinePoint,
				CanvasOutlinePoint,
		  ]
		| null;
	readonly points: readonly [
		CanvasOutlinePoint,
		CanvasOutlinePoint,
		CanvasOutlinePoint,
		CanvasOutlinePoint,
	];
};

export type CanvasOutlineTarget = {
	readonly key: string;
	readonly ref: RefObject<Element | null>;
	readonly crop: {
		readonly left: number;
		readonly right: number;
		readonly top: number;
		readonly bottom: number;
	};
	readonly includeOutsideContainer: boolean;
};

export type CanvasOutlinesSnapshot<
	Target extends CanvasOutlineTarget = CanvasOutlineTarget,
> = {
	readonly outlines: readonly CanvasOutline[];
	readonly targets: readonly Target[];
};

export type CanvasOutlinesController<
	Target extends CanvasOutlineTarget = CanvasOutlineTarget,
> = {
	readonly getSnapshot: () => CanvasOutlinesSnapshot<Target>;
	readonly subscribe: (listener: () => void) => () => void;
	readonly update: (
		container: SVGSVGElement | null,
		targets: readonly Target[],
	) => void;
	readonly disconnect: () => void;
};

export type CanvasOutlineTargetsAreEqual<
	Target extends CanvasOutlineTarget = CanvasOutlineTarget,
> = (previous: readonly Target[], next: readonly Target[]) => boolean;

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
	return [
		{x: quad.p1.x - containerRect.left, y: quad.p1.y - containerRect.top},
		{x: quad.p2.x - containerRect.left, y: quad.p2.y - containerRect.top},
		{x: quad.p3.x - containerRect.left, y: quad.p3.y - containerRect.top},
		{x: quad.p4.x - containerRect.left, y: quad.p4.y - containerRect.top},
	];
};

const isSvgSvgElement = (element: Element): element is SVGSVGElement => {
	const svgElement = element.ownerDocument.defaultView?.SVGSVGElement;
	return svgElement !== undefined && element instanceof svgElement;
};

const isHtmlElement = (element: Element): element is HTMLElement => {
	const htmlElement = element.ownerDocument.defaultView?.HTMLElement;
	return htmlElement !== undefined && element instanceof htmlElement;
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

	const quad = getBoxQuadsPonyfill(element, {box: 'border'})?.[0];
	return quad
		? quadToPoints(quad, containerRect)
		: rectToPoints(elementRect, containerRect);
};

export const clampCanvasOutlineValue = (
	value: number,
	min: number,
	max: number,
): number => Math.min(max, Math.max(min, value));

export const mixCanvasOutlineValues = (
	from: number,
	to: number,
	progress: number,
): number => from + (to - from) * progress;

export const mixCanvasOutlinePoints = (
	from: CanvasOutlinePoint,
	to: CanvasOutlinePoint,
	progress: number,
): CanvasOutlinePoint => ({
	x: mixCanvasOutlineValues(from.x, to.x, progress),
	y: mixCanvasOutlineValues(from.y, to.y, progress),
});

type ProjectiveTransform = {
	readonly a: number;
	readonly b: number;
	readonly c: number;
	readonly d: number;
	readonly e: number;
	readonly f: number;
	readonly g: number;
	readonly h: number;
};

const projectiveEpsilon = 0.000001;

const getProjectiveTransform = (
	points: CanvasOutline['points'],
): ProjectiveTransform | null => {
	const [tl, tr, br, bl] = points;
	const dx1 = tr.x - br.x;
	const dx2 = bl.x - br.x;
	const dx3 = tl.x - tr.x + br.x - bl.x;
	const dy1 = tr.y - br.y;
	const dy2 = bl.y - br.y;
	const dy3 = tl.y - tr.y + br.y - bl.y;

	let g = 0;
	let h = 0;
	if (Math.abs(dx3) > projectiveEpsilon || Math.abs(dy3) > projectiveEpsilon) {
		const determinant = dx1 * dy2 - dx2 * dy1;
		if (Math.abs(determinant) < projectiveEpsilon) {
			return null;
		}

		g = (dx3 * dy2 - dx2 * dy3) / determinant;
		h = (dx1 * dy3 - dx3 * dy1) / determinant;
	}

	return {
		a: tr.x - tl.x + g * tr.x,
		b: bl.x - tl.x + h * bl.x,
		c: tl.x,
		d: tr.y - tl.y + g * tr.y,
		e: bl.y - tl.y + h * bl.y,
		f: tl.y,
		g,
		h,
	};
};

export const getCanvasOutlinePointAtUv = (
	points: CanvasOutline['points'],
	uv: readonly [number, number],
): CanvasOutlinePoint => {
	const projectiveTransform = getProjectiveTransform(points);
	if (projectiveTransform !== null) {
		const denominator =
			projectiveTransform.g * uv[0] + projectiveTransform.h * uv[1] + 1;
		return {
			x:
				(projectiveTransform.a * uv[0] +
					projectiveTransform.b * uv[1] +
					projectiveTransform.c) /
				denominator,
			y:
				(projectiveTransform.d * uv[0] +
					projectiveTransform.e * uv[1] +
					projectiveTransform.f) /
				denominator,
		};
	}

	const [tl, tr, br, bl] = points;
	return mixCanvasOutlinePoints(
		mixCanvasOutlinePoints(tl, tr, uv[0]),
		mixCanvasOutlinePoints(bl, br, uv[0]),
		uv[1],
	);
};

const getBilinearCanvasOutlineUvForPoint = (
	points: CanvasOutline['points'],
	point: CanvasOutlinePoint,
): readonly [number, number] => {
	const [tl, tr, br, bl] = points;
	let u = 0.5;
	let v = 0.5;

	for (let i = 0; i < 8; i++) {
		const current = getCanvasOutlinePointAtUv(points, [u, v]);
		const errorX = current.x - point.x;
		const errorY = current.y - point.y;
		if (Math.abs(errorX) + Math.abs(errorY) < 0.001) {
			break;
		}

		const du = {
			x: mixCanvasOutlineValues(tr.x - tl.x, br.x - bl.x, v),
			y: mixCanvasOutlineValues(tr.y - tl.y, br.y - bl.y, v),
		};
		const top = mixCanvasOutlinePoints(tl, tr, u);
		const bottom = mixCanvasOutlinePoints(bl, br, u);
		const dv = {x: bottom.x - top.x, y: bottom.y - top.y};
		const determinant = du.x * dv.y - du.y * dv.x;
		if (Math.abs(determinant) < projectiveEpsilon) {
			break;
		}

		u -= (errorX * dv.y - errorY * dv.x) / determinant;
		v -= (du.x * errorY - du.y * errorX) / determinant;
	}

	return [u, v];
};

export const getCanvasOutlineUvForPoint = (
	points: CanvasOutline['points'],
	point: CanvasOutlinePoint,
): readonly [number, number] => {
	const transform = getProjectiveTransform(points);
	if (transform === null) {
		return getBilinearCanvasOutlineUvForPoint(points, point);
	}

	const determinant =
		transform.a * (transform.e - transform.f * transform.h) -
		transform.b * (transform.d - transform.f * transform.g) +
		transform.c * (transform.d * transform.h - transform.e * transform.g);
	if (Math.abs(determinant) < projectiveEpsilon) {
		return getBilinearCanvasOutlineUvForPoint(points, point);
	}

	const inverseA = transform.e - transform.f * transform.h;
	const inverseB = transform.c * transform.h - transform.b;
	const inverseC = transform.b * transform.f - transform.c * transform.e;
	const inverseD = transform.f * transform.g - transform.d;
	const inverseE = transform.a - transform.c * transform.g;
	const inverseF = transform.c * transform.d - transform.a * transform.f;
	const inverseG = transform.d * transform.h - transform.e * transform.g;
	const inverseH = transform.b * transform.g - transform.a * transform.h;
	const inverseI = transform.a * transform.e - transform.b * transform.d;

	const denominator = inverseG * point.x + inverseH * point.y + inverseI;
	if (Math.abs(denominator) < projectiveEpsilon) {
		return getBilinearCanvasOutlineUvForPoint(points, point);
	}

	return [
		(inverseA * point.x + inverseB * point.y + inverseC) / denominator,
		(inverseD * point.x + inverseE * point.y + inverseF) / denominator,
	];
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

	const right = 1 - crop.right;
	const bottom = 1 - crop.bottom;
	return [
		getCanvasOutlinePointAtUv(points, [crop.left, crop.top]),
		getCanvasOutlinePointAtUv(points, [right, crop.top]),
		getCanvasOutlinePointAtUv(points, [right, bottom]),
		getCanvasOutlinePointAtUv(points, [crop.left, bottom]),
	];
};

export const measureCanvasOutlines = <Target extends CanvasOutlineTarget>(
	container: Element,
	targets: readonly Target[],
): CanvasOutline[] => {
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

		outlines.push({
			key: target.key,
			dimensions: isHtmlElement(element)
				? {width: element.offsetWidth, height: element.offsetHeight}
				: isSvgSvgElement(element)
					? {
							width: element.width.baseVal.value,
							height: element.height.baseVal.value,
						}
					: null,
			uncroppedPoints,
			points: cropCanvasOutlinePoints(uncroppedPoints, target.crop),
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
		if (
			a[i].key !== b[i].key ||
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

export const createCanvasOutlinesController = <
	Target extends CanvasOutlineTarget = CanvasOutlineTarget,
>(
	areTargetsEqual: CanvasOutlineTargetsAreEqual<Target> = Object.is,
): CanvasOutlinesController<Target> => {
	let snapshot: CanvasOutlinesSnapshot<Target> = {outlines: [], targets: []};
	let container: SVGSVGElement | null = null;
	let targets: readonly Target[] = [];
	let resizeObserver: ResizeObserver | null = null;
	let resizeAnimationFrame: number | null = null;
	let observedElements = new Set<Element>();
	const listeners = new Set<() => void>();

	const publish = (outlines: readonly CanvasOutline[]) => {
		if (
			snapshot.targets === targets &&
			canvasOutlinesAreEqual(snapshot.outlines, outlines)
		) {
			return;
		}

		snapshot = {
			outlines: canvasOutlinesAreEqual(snapshot.outlines, outlines)
				? snapshot.outlines
				: outlines,
			targets,
		};
		for (const listener of listeners) {
			listener();
		}
	};

	const calculate = () => {
		publish(
			container === null || targets.length === 0
				? []
				: measureCanvasOutlines(container, targets),
		);
	};

	const cancelScheduledCalculation = () => {
		if (resizeAnimationFrame === null) {
			return;
		}

		container?.ownerDocument.defaultView?.cancelAnimationFrame(
			resizeAnimationFrame,
		);
		resizeAnimationFrame = null;
	};

	const disconnectObserver = () => {
		cancelScheduledCalculation();
		resizeObserver?.disconnect();
		resizeObserver = null;
		observedElements = new Set();
	};

	const scheduleCalculation = () => {
		if (resizeAnimationFrame !== null || container === null) {
			return;
		}

		const ownerWindow = container.ownerDocument.defaultView;
		if (ownerWindow?.requestAnimationFrame === undefined) {
			calculate();
			return;
		}

		resizeAnimationFrame = ownerWindow.requestAnimationFrame(() => {
			resizeAnimationFrame = null;
			calculate();
		});
	};

	const updateObserver = (containerChanged: boolean) => {
		const ResizeObserverConstructor =
			container?.ownerDocument.defaultView?.ResizeObserver;
		if (container === null || ResizeObserverConstructor === undefined) {
			disconnectObserver();
			return;
		}

		if (resizeObserver === null || containerChanged) {
			disconnectObserver();
			resizeObserver = new ResizeObserverConstructor(scheduleCalculation);
		}

		const nextObservedElements = new Set<Element>([container]);
		for (const target of targets) {
			if (target.ref.current !== null) {
				nextObservedElements.add(target.ref.current);
			}
		}

		for (const element of observedElements) {
			if (!nextObservedElements.has(element)) {
				resizeObserver.unobserve(element);
			}
		}

		for (const element of nextObservedElements) {
			if (!observedElements.has(element)) {
				resizeObserver.observe(element);
			}
		}

		observedElements = nextObservedElements;
	};

	return {
		getSnapshot: () => snapshot,
		subscribe: (listener) => {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
		update: (nextContainer, nextTargets) => {
			const containerChanged = container !== nextContainer;
			container = nextContainer;

			if (!areTargetsEqual(targets, nextTargets)) {
				targets = nextTargets;
			}

			updateObserver(containerChanged);
			calculate();
		},
		disconnect: () => {
			disconnectObserver();
			container = null;
			targets = [];
			publish([]);
		},
	};
};

export const useCanvasOutlinesController = <
	Target extends CanvasOutlineTarget = CanvasOutlineTarget,
>(
	areTargetsEqual: CanvasOutlineTargetsAreEqual<Target> = Object.is,
): CanvasOutlinesController<Target> => {
	const [controller] = useState(() =>
		createCanvasOutlinesController(areTargetsEqual),
	);
	return controller;
};

export const useCanvasOutlines = <Target extends CanvasOutlineTarget>(
	controller: CanvasOutlinesController<Target>,
): CanvasOutlinesSnapshot<Target> => {
	return useSyncExternalStore(
		controller.subscribe,
		controller.getSnapshot,
		controller.getSnapshot,
	);
};
