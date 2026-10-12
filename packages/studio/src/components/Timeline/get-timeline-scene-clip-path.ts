import type {TimelineSceneRange} from './timeline-series-layout';

type TimelineSceneClipOptions = {
	readonly sceneRange: TimelineSceneRange | null;
	readonly durationInFrames: number;
	readonly offsetInFrames: number;
	readonly pixelsPerFrame: number;
	readonly height: number;
	readonly cropHeight: number | null;
};

export const getTimelineSceneShape = ({
	sceneRange,
	durationInFrames,
	offsetInFrames,
	pixelsPerFrame,
	height,
	cropHeight,
}: TimelineSceneClipOptions): {
	readonly clipPath: string;
	readonly points: string;
} | null => {
	if (
		sceneRange === null ||
		durationInFrames <= 0 ||
		pixelsPerFrame <= 0 ||
		height <= 0 ||
		(cropHeight !== null && cropHeight <= 0)
	) {
		return null;
	}

	if (sceneRange.end <= sceneRange.from) {
		return {clipPath: 'inset(0 100% 0 0)', points: ''};
	}

	// Move only the outgoing diagonal inward by one perpendicular pixel, so
	// adjacent clips retain the same gap at any transition width or row height.
	const outgoingInset =
		sceneRange.transitionOutStart === null
			? 0
			: Math.hypot(
					(sceneRange.end - sceneRange.transitionOutStart) / height,
					1 / pixelsPerFrame,
				);
	// The outgoing scene ends at the top; the incoming scene starts at the bottom.
	let points = [
		{x: sceneRange.transitionInEnd ?? sceneRange.from, y: 0},
		{x: sceneRange.end - outgoingInset, y: 0},
		{
			x: (sceneRange.transitionOutStart ?? sceneRange.end) - outgoingInset,
			y: 100,
		},
		{x: sceneRange.from, y: 100},
	];

	const visibleHeight = cropHeight ?? height;
	// Intersect with the rendered bar without changing the parent row's slope.
	// Expanded rows can be taller than the child bar whose outline is visible.
	for (const {boundary, keepGreater, axis} of [
		{
			boundary: Math.max(offsetInFrames, sceneRange.from),
			keepGreater: true,
			axis: 'x',
		},
		{
			boundary: Math.min(offsetInFrames + durationInFrames, sceneRange.end),
			keepGreater: false,
			axis: 'x',
		},
		{boundary: (visibleHeight / height) * 100, keepGreater: false, axis: 'y'},
	] as const) {
		const clipped: typeof points = [];
		for (let index = 0; index < points.length; index++) {
			const point = points[index];
			const previous = points[(index + points.length - 1) % points.length];
			const inside = keepGreater
				? point[axis] >= boundary
				: point[axis] <= boundary;
			const previousInside = keepGreater
				? previous[axis] >= boundary
				: previous[axis] <= boundary;
			if (inside !== previousInside) {
				const progress =
					(boundary - previous[axis]) / (point[axis] - previous[axis]);
				clipped.push({
					x:
						axis === 'x'
							? boundary
							: previous.x + (point.x - previous.x) * progress,
					y:
						axis === 'y'
							? boundary
							: previous.y + (point.y - previous.y) * progress,
				});
			}

			if (inside) {
				clipped.push(point);
			}
		}

		points = clipped;
	}

	if (points.length === 0) {
		return {clipPath: 'inset(0 100% 0 0)', points: ''};
	}

	return {
		clipPath: `polygon(${points
			.map(
				({x, y}) =>
					`${((x - offsetInFrames) / durationInFrames) * 100}% ${(y * height) / visibleHeight}%`,
			)
			.join(', ')})`,
		points: points
			.map(
				({x, y}) =>
					`${(x - offsetInFrames) * pixelsPerFrame},${(y / 100) * height}`,
			)
			.join(' '),
	};
};

export const getTimelineSceneClipPath = (
	options: TimelineSceneClipOptions,
): string | undefined => getTimelineSceneShape(options)?.clipPath;
