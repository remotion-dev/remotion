import type {CanvasOutline} from './outline-geometry';

export const canvasOutlineSnapThresholdPx = 10;

export type CanvasOutlineSnapAxis = 'x' | 'y';

export type CanvasOutlineSnapTargetType =
	| 'canvas-left'
	| 'canvas-right'
	| 'canvas-top'
	| 'canvas-bottom'
	| 'canvas-horizontal-center'
	| 'canvas-vertical-center'
	| 'guide-vertical'
	| 'guide-horizontal';

export type CanvasOutlineSnapTarget = {
	readonly axis: CanvasOutlineSnapAxis;
	readonly position: number;
	readonly type: CanvasOutlineSnapTargetType;
};

/** A host-defined line in composition pixels that outlines snap to. */
export type CanvasOutlineSnapGuide = {
	readonly orientation: 'horizontal' | 'vertical';
	readonly position: number;
	readonly show: boolean;
};

export type CanvasOutlineSnapEdge =
	| 'left'
	| 'right'
	| 'center-x'
	| 'top'
	| 'bottom'
	| 'center-y';

export type CanvasOutlineSnapPoint = {
	readonly distance: number;
	readonly edge: CanvasOutlineSnapEdge;
	readonly target: CanvasOutlineSnapTarget;
};

export type CanvasOutlineSnapResult = {
	readonly activeSnapPoints: readonly CanvasOutlineSnapPoint[];
	readonly snapOffsetX: number | null;
	readonly snapOffsetY: number | null;
};

type EdgeCheck = {
	readonly edge: CanvasOutlineSnapEdge;
	readonly position: number;
};

const EPSILON = 0.000001;

export const getCanvasOutlineSnapTargets = ({
	compositionHeight,
	compositionWidth,
	guides,
}: {
	readonly compositionHeight: number;
	readonly compositionWidth: number;
	readonly guides: readonly CanvasOutlineSnapGuide[];
}): readonly CanvasOutlineSnapTarget[] => {
	return [
		{axis: 'x', position: 0, type: 'canvas-left'},
		{
			axis: 'x',
			position: compositionWidth / 2,
			type: 'canvas-horizontal-center',
		},
		{axis: 'x', position: compositionWidth, type: 'canvas-right'},
		{axis: 'y', position: 0, type: 'canvas-top'},
		{
			axis: 'y',
			position: compositionHeight / 2,
			type: 'canvas-vertical-center',
		},
		{axis: 'y', position: compositionHeight, type: 'canvas-bottom'},
		...guides.flatMap((guide): CanvasOutlineSnapTarget[] => {
			if (!guide.show) {
				return [];
			}

			return [
				guide.orientation === 'vertical'
					? {
							axis: 'x',
							position: guide.position,
							type: 'guide-vertical',
						}
					: {
							axis: 'y',
							position: guide.position,
							type: 'guide-horizontal',
						},
			];
		}),
	];
};

const canSnapEdgeToTarget = (
	edge: CanvasOutlineSnapEdge,
	target: CanvasOutlineSnapTarget,
): boolean => {
	if (target.type === 'canvas-horizontal-center') {
		return edge === 'center-x';
	}

	if (target.type === 'canvas-vertical-center') {
		return edge === 'center-y';
	}

	if (target.type === 'canvas-left' || target.type === 'canvas-right') {
		return edge === 'left' || edge === 'right';
	}

	if (target.type === 'guide-vertical') {
		return edge === 'left' || edge === 'right' || edge === 'center-x';
	}

	if (target.type === 'canvas-top' || target.type === 'canvas-bottom') {
		return edge === 'top' || edge === 'bottom';
	}

	return edge === 'top' || edge === 'bottom' || edge === 'center-y';
};

const findBestSnapForAxis = ({
	edges,
	targets,
	threshold,
}: {
	readonly edges: readonly EdgeCheck[];
	readonly targets: readonly CanvasOutlineSnapTarget[];
	readonly threshold: number;
}): {
	readonly offset: number;
	readonly snapPoint: CanvasOutlineSnapPoint;
} | null => {
	let bestDistance = Infinity;
	let bestSnaps: {
		readonly offset: number;
		readonly snapPoint: CanvasOutlineSnapPoint;
	}[] = [];

	for (const target of targets) {
		for (const edge of edges) {
			if (!canSnapEdgeToTarget(edge.edge, target)) {
				continue;
			}

			const distance = Math.abs(edge.position - target.position);
			if (distance > threshold || distance > bestDistance + EPSILON) {
				continue;
			}

			if (distance < bestDistance - EPSILON) {
				bestSnaps = [];
				bestDistance = distance;
			}

			bestSnaps.push({
				offset: target.position - edge.position,
				snapPoint: {
					distance,
					edge: edge.edge,
					target,
				},
			});
		}
	}

	if (bestSnaps.length > 1) {
		const centerSnap = bestSnaps.find(
			(snap) =>
				snap.snapPoint.target.type === 'canvas-horizontal-center' ||
				snap.snapPoint.target.type === 'canvas-vertical-center',
		);
		if (centerSnap) {
			return centerSnap;
		}
	}

	return bestSnaps[0] ?? null;
};

/**
 * Finds the closest snap for the bounding box of the outlines after moving
 * them by the delta. Outlines are in overlay pixels, deltas and the result in
 * composition pixels.
 */
export const findCanvasOutlineSnap = ({
	allowX,
	allowY,
	deltaX,
	deltaY,
	outlines,
	scale,
	targets,
}: {
	readonly allowX: boolean;
	readonly allowY: boolean;
	readonly deltaX: number;
	readonly deltaY: number;
	readonly outlines: readonly CanvasOutline[];
	readonly scale: number;
	readonly targets: readonly CanvasOutlineSnapTarget[];
}): CanvasOutlineSnapResult => {
	if (outlines.length === 0) {
		return {
			activeSnapPoints: [],
			snapOffsetX: null,
			snapOffsetY: null,
		};
	}

	const points = outlines.flatMap((outline) => outline.points);
	const left = Math.min(...points.map((point) => point.x)) / scale + deltaX;
	const right = Math.max(...points.map((point) => point.x)) / scale + deltaX;
	const top = Math.min(...points.map((point) => point.y)) / scale + deltaY;
	const bottom = Math.max(...points.map((point) => point.y)) / scale + deltaY;
	const threshold = canvasOutlineSnapThresholdPx / scale;
	const snapX = allowX
		? findBestSnapForAxis({
				edges: [
					{edge: 'left', position: left},
					{edge: 'center-x', position: left + (right - left) / 2},
					{edge: 'right', position: right},
				],
				targets: targets.filter((target) => target.axis === 'x'),
				threshold,
			})
		: null;
	const snapY = allowY
		? findBestSnapForAxis({
				edges: [
					{edge: 'top', position: top},
					{edge: 'center-y', position: top + (bottom - top) / 2},
					{edge: 'bottom', position: bottom},
				],
				targets: targets.filter((target) => target.axis === 'y'),
				threshold,
			})
		: null;

	return {
		activeSnapPoints: [
			snapX?.snapPoint ?? null,
			snapY?.snapPoint ?? null,
		].filter((snapPoint) => snapPoint !== null),
		snapOffsetX: snapX?.offset ?? null,
		snapOffsetY: snapY?.offset ?? null,
	};
};
