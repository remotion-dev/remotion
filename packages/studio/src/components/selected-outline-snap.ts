import type {Guide} from '../state/editor-guides';
import type {SelectedOutline} from './selected-outline-geometry';

export const selectedOutlineSnapThresholdPx = 10;
export const selectedOutlineSnapIndicatorColor = '#ff00ff';

export type SelectedOutlineSnapAxis = 'x' | 'y';

export type SelectedOutlineSnapTargetType =
	| 'canvas-left'
	| 'canvas-right'
	| 'canvas-top'
	| 'canvas-bottom'
	| 'canvas-horizontal-center'
	| 'canvas-vertical-center'
	| 'guide-vertical'
	| 'guide-horizontal';

export type SelectedOutlineSnapTarget = {
	readonly axis: SelectedOutlineSnapAxis;
	readonly position: number;
	readonly type: SelectedOutlineSnapTargetType;
};

export type SelectedOutlineSnapEdge =
	| 'left'
	| 'right'
	| 'center-x'
	| 'top'
	| 'bottom'
	| 'center-y';

export type SelectedOutlineSnapPoint = {
	readonly distance: number;
	readonly edge: SelectedOutlineSnapEdge;
	readonly target: SelectedOutlineSnapTarget;
};

export type SelectedOutlineSnapResult = {
	readonly activeSnapPoints: readonly SelectedOutlineSnapPoint[];
	readonly snapOffsetX: number | null;
	readonly snapOffsetY: number | null;
};

type SelectedOutlineBounds = {
	readonly left: number;
	readonly right: number;
	readonly top: number;
	readonly bottom: number;
	readonly centerX: number;
	readonly centerY: number;
};

type EdgeCheck = {
	readonly edge: SelectedOutlineSnapEdge;
	readonly position: number;
};

const EPSILON = 0.000001;

export const getSelectedOutlineSnapTargets = ({
	compositionHeight,
	compositionWidth,
	guides,
}: {
	readonly compositionHeight: number;
	readonly compositionWidth: number;
	readonly guides: readonly Guide[];
}): readonly SelectedOutlineSnapTarget[] => {
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
		...guides.flatMap((guide): SelectedOutlineSnapTarget[] => {
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

const getSelectedOutlineBounds = ({
	deltaX,
	deltaY,
	outlines,
	scale,
}: {
	readonly deltaX: number;
	readonly deltaY: number;
	readonly outlines: readonly SelectedOutline[];
	readonly scale: number;
}): SelectedOutlineBounds | null => {
	if (outlines.length === 0) {
		return null;
	}

	const points = outlines.flatMap((outline) => outline.points);
	const left = Math.min(...points.map((point) => point.x)) / scale + deltaX;
	const right = Math.max(...points.map((point) => point.x)) / scale + deltaX;
	const top = Math.min(...points.map((point) => point.y)) / scale + deltaY;
	const bottom = Math.max(...points.map((point) => point.y)) / scale + deltaY;

	return {
		left,
		right,
		top,
		bottom,
		centerX: left + (right - left) / 2,
		centerY: top + (bottom - top) / 2,
	};
};

const canSnapEdgeToTarget = (
	edge: SelectedOutlineSnapEdge,
	target: SelectedOutlineSnapTarget,
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
	readonly targets: readonly SelectedOutlineSnapTarget[];
	readonly threshold: number;
}): {
	readonly offset: number;
	readonly snapPoint: SelectedOutlineSnapPoint;
} | null => {
	let bestDistance = Infinity;
	let bestSnaps: {
		readonly offset: number;
		readonly snapPoint: SelectedOutlineSnapPoint;
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

export const findSelectedOutlineSnap = ({
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
	readonly outlines: readonly SelectedOutline[];
	readonly scale: number;
	readonly targets: readonly SelectedOutlineSnapTarget[];
}): SelectedOutlineSnapResult => {
	const bounds = getSelectedOutlineBounds({deltaX, deltaY, outlines, scale});
	if (bounds === null) {
		return {
			activeSnapPoints: [],
			snapOffsetX: null,
			snapOffsetY: null,
		};
	}

	const threshold = selectedOutlineSnapThresholdPx / scale;
	const snapX = allowX
		? findBestSnapForAxis({
				edges: [
					{edge: 'left', position: bounds.left},
					{edge: 'center-x', position: bounds.centerX},
					{edge: 'right', position: bounds.right},
				],
				targets: targets.filter((target) => target.axis === 'x'),
				threshold,
			})
		: null;
	const snapY = allowY
		? findBestSnapForAxis({
				edges: [
					{edge: 'top', position: bounds.top},
					{edge: 'center-y', position: bounds.centerY},
					{edge: 'bottom', position: bounds.bottom},
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
