import type {LogLevel} from 'remotion';
import {
	calculateTransforms,
	preserves3DChildren,
	type TransformStyleCache,
} from './drawing/calculate-transforms';
import {
	clipPolygonToHalfPlanes,
	clipSourceRectToViewport,
	isScaleTooBig,
} from './drawing/get-pretransform-rect';
import {getPrecomposeRectFor3DTransform} from './drawing/handle-3d-transform';
import {getElementsNeedingIsolation} from './drawing/isolation';
import {roundToExpandRect} from './drawing/round-to-expand-rect';
import {getBiggestBoundingClientRect} from './get-biggest-bounding-client-rect';
import type {InternalState} from './internal-state';
import {createTreeWalkerCleanupAfterChildren} from './tree-walker-cleanup-after-children';
import {walkOverNode} from './walk-over-node';
import {skipToNextNonDescendant} from './walk-tree';

const getFilterFunction = (node: Node) => {
	if (!(node instanceof Element)) {
		// Must be a text node!
		return NodeFilter.FILTER_ACCEPT;
	}

	// SVG does have children, but we process SVG elements in its
	// entirety
	if (node.parentElement instanceof SVGSVGElement) {
		return NodeFilter.FILTER_REJECT;
	}

	// Canvas children are fallback/layout content. The canvas bitmap already
	// contains their rendered output, including any <HtmlInCanvas> effects.
	if (node.parentElement instanceof HTMLCanvasElement) {
		return NodeFilter.FILTER_REJECT;
	}

	const computedStyle = getComputedStyle(node);

	if (computedStyle.display === 'none') {
		return NodeFilter.FILTER_REJECT;
	}

	return NodeFilter.FILTER_ACCEPT;
};

// Sort only overlapping, non-intersecting planes within one preserve-3d context.
// An edge means the first plane must paint behind the second plane.
type PlanePoint = {x: number; y: number};
const projectedPlane = (
	matrix: DOMMatrix,
	rect: DOMRect,
	viewport: DOMRect | null,
) => {
	const corners = [
		[rect.left, rect.top],
		[rect.right, rect.top],
		[rect.right, rect.bottom],
		[rect.left, rect.bottom],
	].map(([x, y]) => {
		const p = matrix.transformPoint({x, y, z: 0, w: 1});
		return {x: p.x, y: p.y, z: p.z, w: p.w};
	});
	if (corners.some((p) => ![p.x, p.y, p.z, p.w].every(Number.isFinite)))
		return null;
	const distances: ((p: {
		x: number;
		y: number;
		z: number;
		w: number;
	}) => number)[] = [(p) => p.w - 1e-7];
	if (viewport)
		distances.push(
			(p) => p.x - viewport.left * p.w,
			(p) => viewport.right * p.w - p.x,
			(p) => p.y - viewport.top * p.w,
			(p) => viewport.bottom * p.w - p.y,
		);
	const clipped = clipPolygonToHalfPlanes(corners, distances);
	if (clipped.length < 3) return null;
	const points = clipped.map((p) => ({
		x: p.x / p.w,
		y: p.y / p.w,
		z: p.z / p.w,
	}));
	const a = points[0];
	// Clipping can introduce collinear vertices; choose a nondegenerate triangle.
	for (let i = 1; i < points.length - 1; i++) {
		const b = points[i];
		const c = points[i + 1];
		const u = {x: b.x - a.x, y: b.y - a.y, z: b.z - a.z};
		const v = {x: c.x - a.x, y: c.y - a.y, z: c.z - a.z};
		const normal = {
			x: u.y * v.z - u.z * v.y,
			y: u.z * v.x - u.x * v.z,
			z: u.x * v.y - u.y * v.x,
		};
		if (Math.abs(normal.z) >= 1e-8)
			return {
				points,
				depthAt: (p: PlanePoint) =>
					a.z - (normal.x * (p.x - a.x) + normal.y * (p.y - a.y)) / normal.z,
			};
	}

	return null;
};

const planeCross = (a: PlanePoint, b: PlanePoint, p: PlanePoint) =>
	(b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
const intersectPlanePolygons = (subject: PlanePoint[], clip: PlanePoint[]) => {
	const area = clip.reduce((sum, p, i) => {
		const q = clip[(i + 1) % clip.length];
		return sum + p.x * q.y - p.y * q.x;
	}, 0);
	const orientation = area < 0 ? -1 : 1;
	let polygon = subject;
	for (let i = 0; i < clip.length && polygon.length; i++) {
		const a = clip[i];
		const b = clip[(i + 1) % clip.length];
		const input = polygon;
		polygon = [];
		for (let j = 0; j < input.length; j++) {
			const p = input[j];
			const q = input[(j + 1) % input.length];
			const dp = orientation * planeCross(a, b, p);
			const dq = orientation * planeCross(a, b, q);
			if (dp >= -1e-7) polygon.push(p);
			if (dp >= -1e-7 !== dq >= -1e-7) {
				const t = dp / (dp - dq);
				polygon.push({x: p.x + t * (q.x - p.x), y: p.y + t * (q.y - p.y)});
			}
		}
	}

	return polygon;
};

type Preserve3DPlane = {
	node: HTMLElement | SVGElement;
	projection: NonNullable<ReturnType<typeof projectedPlane>>;
	forceSubtreePrecompositing: boolean;
};
const orderPreserve3DPlanes = (planes: Preserve3DPlane[]) => {
	// Computed CSS matrices are rounded: nominally coplanar tiles can differ
	// by a few ten-thousandths of a projected CSS pixel. Keep these DOM ties
	// instead of treating rounding noise as a context-wide intersection.
	const edges: number[][] = planes.map(() => []);
	const incoming = planes.map(() => 0);
	for (let i = 0; i < planes.length; i++) {
		for (let j = i + 1; j < planes.length; j++) {
			const overlap = intersectPlanePolygons(
				planes[i].projection.points,
				planes[j].projection.points,
			);
			if (overlap.length < 3) continue;
			const differences = overlap.map(
				(p) =>
					planes[i].projection.depthAt(p) - planes[j].projection.depthAt(p),
			);
			const min = Math.min(...differences);
			const max = Math.max(...differences);
			// An intersecting pair cannot be painted correctly without splitting its
			// textures. Keep this entire context's established order in that case.
			if (min < -1e-3 && max > 1e-3) return planes;
			const behind =
				max <= 1e-3 && min < -1e-3 ? i : min >= -1e-3 && max > 1e-3 ? j : null;
			// Overlapping coplanar siblings must retain DOM order even when a
			// third plane delays one of them in the topological traversal.
			const front = behind === null ? j : behind === i ? j : i;
			const back = behind === null ? i : behind;
			edges[back].push(front);
			incoming[front]++;
		}
	}

	const ordered: Preserve3DPlane[] = [];
	const painted = new Set();
	while (ordered.length < planes.length) {
		const next = incoming.findIndex(
			(count, i) => count === 0 && !painted.has(i),
		);
		if (next === -1) return planes;
		painted.add(next);
		ordered.push(planes[next]);
		for (const front of edges[next]) incoming[front]--;
	}

	return ordered;
};

const planPreserve3DPlanes = ({
	element,
	rootElement,
	parentRect,
	transformStyleCache,
	isolatedElements,
}: {
	element: HTMLElement | SVGElement;
	rootElement: HTMLElement | SVGElement;
	parentRect: DOMRect;
	transformStyleCache: TransformStyleCache;
	isolatedElements: WeakSet<Element>;
}) => {
	const planes: Preserve3DPlane[] = [];
	let supported = true;
	const visit = (node: Node): Node[] | null | undefined => {
		if (!supported) return;
		// Text in a preserve-3d element has no independent border-box plane. Its
		// normal text wrapper path remains in charge until it is explicitly modeled.
		if (!(node instanceof HTMLElement || node instanceof SVGElement)) {
			if (node.textContent?.trim()) supported = false;
			return;
		}

		if (getFilterFunction(node) === NodeFilter.FILTER_REJECT) return;
		const transforms = calculateTransforms({
			element: node,
			rootElement,
			transformStyleCache,
			isolated: isolatedElements.has(node),
		});
		try {
			const preserving = transforms.preserves3DChildren;
			if (
				!preserving ||
				(transforms.dimensions.width > 0 && transforms.dimensions.height > 0)
			) {
				if (
					!transforms.totalMatrix.is2D &&
					isScaleTooBig(transforms.totalMatrix)
				) {
					supported = false;
					return;
				}

				const paintRect = transforms.totalMatrix.is2D
					? clipSourceRectToViewport(
							getBiggestBoundingClientRect(node, preserving),
							transforms.totalMatrix,
							parentRect,
						)
					: getPrecomposeRectFor3DTransform({
							element: node,
							parentRect,
							matrix: transforms.totalMatrix,
							onlyOwnPlane: preserving,
						});
				if (!paintRect) {
					// An invisible own plane does not invalidate the other context planes.
					return preserving ? [...node.childNodes] : null;
				}

				const projection = projectedPlane(
					transforms.totalMatrix,
					roundToExpandRect(paintRect),
					parentRect,
				);
				if (!projection) {
					supported = false;
					return;
				}

				// Bound quadratic overlap planning for large unrelated compositions.
				if (planes.length >= 256) {
					supported = false;
					return;
				}

				planes.push({
					node,
					projection,
					forceSubtreePrecompositing:
						!preserving &&
						(transforms.totalMatrix.is2D ||
							transforms.dimensions.width <= 0 ||
							transforms.dimensions.height <= 0) &&
						node.childNodes.length > 0,
				});
			}

			if (preserving) {
				// Restore measurement mutations before visiting descendants, so each
				// plane snapshots the authored ancestor styles rather than neutral ones.
				return [...node.childNodes];
			}
		} finally {
			transforms[Symbol.dispose]();
		}

		return null;
	};

	const walk = (node: Node) => {
		const children = visit(node);
		if (children) for (const child of children) walk(child);
	};

	walk(element);
	return supported ? orderPreserve3DPlanes(planes) : null;
};

export const compose = async ({
	element,
	onlyOwnPlane = false,
	context,
	logLevel,
	parentRect,
	internalState,
	onlyBackgroundClipText,
	scale,
	waitForPageResponsiveness,
}: {
	element: HTMLElement | SVGElement;
	onlyOwnPlane?: boolean;
	context: OffscreenCanvasRenderingContext2D;
	logLevel: LogLevel;
	parentRect: DOMRect;
	internalState: InternalState;
	onlyBackgroundClipText: boolean;
	scale: number;
	waitForPageResponsiveness: (() => Promise<void>) | null;
}) => {
	const treeWalker = document.createTreeWalker(
		element,
		onlyBackgroundClipText
			? NodeFilter.SHOW_TEXT
			: NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
		getFilterFunction,
	);
	const transformStyleCache: TransformStyleCache = new WeakMap();
	const isolatedElements = onlyBackgroundClipText
		? new WeakSet<Element>()
		: getElementsNeedingIsolation({
				rootElement: element,
				acceptNode: getFilterFunction,
			});

	// Skip to the first text node
	if (onlyBackgroundClipText) {
		treeWalker.nextNode();
		if (!treeWalker.currentNode) {
			return;
		}
	}

	using treeWalkerClean = createTreeWalkerCleanupAfterChildren(treeWalker);
	const {checkCleanUpAtBeginningOfIteration, addCleanup} = treeWalkerClean;

	while (true) {
		checkCleanUpAtBeginningOfIteration();

		const plannedPlanes =
			!onlyOwnPlane &&
			!onlyBackgroundClipText &&
			(treeWalker.currentNode instanceof HTMLElement ||
				treeWalker.currentNode instanceof SVGElement) &&
			preserves3DChildren(getComputedStyle(treeWalker.currentNode))
				? planPreserve3DPlanes({
						element: treeWalker.currentNode,
						rootElement: element,
						parentRect,
						transformStyleCache,
						isolatedElements,
					})
				: null;
		let val;
		if (plannedPlanes) {
			for (const plane of plannedPlanes) {
				const planeResult = await walkOverNode({
					node: plane.node,
					context,
					logLevel,
					parentRect,
					internalState,
					rootElement: element,
					onlyBackgroundClipText,
					scale,
					waitForPageResponsiveness,
					transformStyleCache,
					isolatedElements,
					forceSubtreePrecompositing: plane.forceSubtreePrecompositing,
				});
				if (planeResult.type === 'continue' && planeResult.cleanupAfterChildren)
					planeResult.cleanupAfterChildren();
				if (waitForPageResponsiveness !== null)
					await waitForPageResponsiveness();
			}

			val = {type: 'skip-children'} as const;
		} else {
			val = await walkOverNode({
				node: treeWalker.currentNode,
				context,
				logLevel,
				parentRect,
				internalState,
				rootElement: element,
				onlyBackgroundClipText,
				scale,
				waitForPageResponsiveness,
				transformStyleCache,
				isolatedElements,
			});
		}

		if (onlyOwnPlane) {
			if (val.type === 'continue' && val.cleanupAfterChildren) {
				val.cleanupAfterChildren();
			}

			break;
		}

		if (val.type === 'skip-children') {
			if (!skipToNextNonDescendant(treeWalker)) {
				break;
			}
		} else {
			if (val.type === 'continue' && val.cleanupAfterChildren) {
				addCleanup(treeWalker.currentNode, val.cleanupAfterChildren);
			}

			if (!treeWalker.nextNode()) {
				break;
			}
		}

		if (waitForPageResponsiveness !== null) {
			await waitForPageResponsiveness();
		}
	}
};
