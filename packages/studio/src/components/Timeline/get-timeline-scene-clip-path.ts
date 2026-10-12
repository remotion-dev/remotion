import type {TimelineSceneRange} from './timeline-series-layout';

// Child rows can have different media heights, but their seams must meet.
export const TIMELINE_CHILD_TRANSITION_SEAM_Y = 7;

type TimelineSceneClipOptions = {
	readonly sceneRange: TimelineSceneRange | null;
	readonly durationInFrames: number;
	readonly offsetInFrames: number;
	readonly pixelsPerFrame: number;
	readonly height: number;
	readonly seamY: number;
	readonly transitionCutout: {
		readonly top: number;
		readonly height: number;
		readonly radius: number;
		readonly minWidth: number;
	} | null;
	readonly cropHeight: number | null;
};

export const getTimelineSceneShape = (
	{
		sceneRange,
		durationInFrames,
		offsetInFrames,
		pixelsPerFrame,
		height,
		seamY,
		transitionCutout,
		cropHeight,
	}: TimelineSceneClipOptions,
	includeOutline: boolean,
): {
	readonly clipPath: string;
	readonly path: string;
	readonly edges: {readonly left: string | null; readonly right: string | null};
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
		return {
			clipPath: 'inset(0 100% 0 0)',
			path: '',
			edges: {left: null, right: null},
		};
	}

	const incomingCutout =
		transitionCutout !== null &&
		sceneRange.transitionInEnd !== null &&
		(sceneRange.transitionInEnd - sceneRange.from) * pixelsPerFrame >=
			transitionCutout.minWidth;
	const outgoingCutout =
		transitionCutout !== null &&
		sceneRange.transitionOutStart !== null &&
		(sceneRange.end - sceneRange.transitionOutStart) * pixelsPerFrame >=
			transitionCutout.minWidth;
	const middle =
		(Math.min(
			height,
			incomingCutout
				? transitionCutout.top + transitionCutout.height
				: Math.round(seamY),
		) /
			height) *
		100;
	const outgoingInset =
		sceneRange.transitionOutStart === null ? 0 : 1 / pixelsPerFrame;
	const outgoingMiddle = outgoingCutout
		? (transitionCutout.top / height) * 100
		: (Math.min(height, Math.round(seamY)) / height) * 100 -
			(sceneRange.transitionOutStart === null ? 0 : 100 / height);
	// Snap the shared endpoints in timeline space, just like the transition
	// target. Keep both vertical gaps inside those bounds.
	const incomingStart =
		sceneRange.transitionInEnd === null
			? sceneRange.from
			: (Math.round(sceneRange.from * pixelsPerFrame) + 1) / pixelsPerFrame;
	const incomingEnd =
		sceneRange.transitionInEnd === null
			? sceneRange.from
			: Math.round(sceneRange.transitionInEnd * pixelsPerFrame) /
				pixelsPerFrame;
	const outgoingStart =
		sceneRange.transitionOutStart === null
			? sceneRange.end
			: Math.round(sceneRange.transitionOutStart * pixelsPerFrame) /
				pixelsPerFrame;
	const outgoingEnd =
		sceneRange.transitionOutStart === null
			? sceneRange.end
			: Math.round(sceneRange.end * pixelsPerFrame) / pixelsPerFrame -
				outgoingInset;
	const incoming =
		sceneRange.transitionInEnd === null
			? [
					{x: incomingStart, y: 0},
					{x: incomingStart, y: 100},
				]
			: [
					{x: incomingEnd, y: 0},
					{x: incomingEnd, y: middle},
					{x: incomingStart, y: middle},
					{x: incomingStart, y: 100},
				];
	const outgoing =
		sceneRange.transitionOutStart === null
			? [
					{x: outgoingEnd, y: 0},
					{x: outgoingEnd, y: 100},
				]
			: [
					{x: outgoingEnd, y: 0},
					{x: outgoingEnd, y: outgoingMiddle},
					{x: outgoingStart, y: outgoingMiddle},
					{x: outgoingStart, y: 100},
				];
	// Overlapping transitions can leave two disconnected teeth. Keep them as
	// separate contours instead of letting their horizontal edges cross.
	const polygons =
		incomingEnd > outgoingStart
			? [
					...(outgoingEnd > incomingEnd
						? [
								[
									{x: incomingEnd, y: 0},
									{x: outgoingEnd, y: 0},
									{x: outgoingEnd, y: outgoingMiddle},
									{x: incomingEnd, y: outgoingMiddle},
								],
							]
						: []),
					...(outgoingStart > incomingStart
						? [
								[
									{x: incomingStart, y: middle},
									{x: outgoingStart, y: middle},
									{x: outgoingStart, y: 100},
									{x: incomingStart, y: 100},
								],
							]
						: []),
				]
			: [[...outgoing, ...incoming.toReversed()]];
	const visibleHeight = cropHeight ?? height;
	const edges: {left: string | null; right: string | null} = {
		left: null,
		right: null,
	};
	if (includeOutline)
		for (const [edge, contour, transition] of [
			['left', incoming, sceneRange.transitionInEnd],
			['right', outgoing, sceneRange.transitionOutStart],
		] as const) {
			if (
				transition !== null &&
				contour.some((point, index) => {
					const next = contour[index + 1];
					return (
						next &&
						Math.max(point.x, next.x) >= offsetInFrames &&
						Math.min(point.x, next.x) <= offsetInFrames + durationInFrames &&
						Math.min(point.y, next.y) < (visibleHeight / height) * 100
					);
				})
			) {
				edges[edge] = contour
					.map(
						({x, y}, index) =>
							`${index === 0 ? 'M' : 'L'}${(x - offsetInFrames) * pixelsPerFrame},${(y / 100) * height}`,
					)
					.join('');
			}
		}

	// Intersect with the rendered bar without changing the parent row's contour.
	// Expanded rows can be taller than the child bar whose outline is visible.
	const clippedPolygons = polygons
		.map((polygon) => {
			let clippedPoints = polygon;
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
				{
					boundary: (visibleHeight / height) * 100,
					keepGreater: false,
					axis: 'y',
				},
			] as const) {
				const clipped: typeof clippedPoints = [];
				for (let index = 0; index < clippedPoints.length; index++) {
					const point = clippedPoints[index];
					const previous =
						clippedPoints[
							(index + clippedPoints.length - 1) % clippedPoints.length
						];
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

				clippedPoints = clipped;
			}

			return clippedPoints;
		})
		.filter((polygon) => polygon.length > 0);
	// Closing both contours cancels the connecting segment in the fill. The
	// selection stroke is clipped to that same fill, so it cannot bridge the gap.
	const points = clippedPolygons.flatMap((polygon) => [...polygon, polygon[0]]);

	if (points.length === 0) {
		return {
			clipPath: 'inset(0 100% 0 0)',
			path: '',
			edges: {left: null, right: null},
		};
	}

	let path = includeOutline
		? clippedPolygons
				.map(
					(polygon) =>
						polygon
							.map(
								({x, y}, index) =>
									`${index === 0 ? 'M' : 'L'}${(x - offsetInFrames) * pixelsPerFrame},${(y / 100) * height}`,
							)
							.join(' ') + ' Z',
				)
				.join(' ')
		: '';
	let clipPath = `polygon(${points
		.map(
			({x, y}) =>
				`${((x - offsetInFrames) / durationInFrames) * 100}% ${(y * height) / visibleHeight}%`,
		)
		.join(', ')})`;
	if (
		transitionCutout !== null &&
		(incomingCutout || outgoingCutout) &&
		incomingEnd <= outgoingStart
	) {
		const incomingStartX = (incomingStart - offsetInFrames) * pixelsPerFrame;
		const incomingEndX = (incomingEnd - offsetInFrames) * pixelsPerFrame;
		const outgoingStartX = (outgoingStart - offsetInFrames) * pixelsPerFrame;
		const outgoingEndX = (outgoingEnd - offsetInFrames) * pixelsPerFrame;
		const incomingY = (middle / 100) * height;
		const outgoingY = (outgoingMiddle / 100) * height;
		const {radius} = transitionCutout;
		// Follow the visible cutout rather than drawing a hidden stroke through
		// its center. The concave arcs match the marker's two rounded corners.
		path = [
			`M${outgoingEndX},0 L${outgoingEndX},${outgoingY}`,
			outgoingCutout
				? `L${outgoingStartX + radius},${outgoingY} A${radius},${radius} 0 0 0 ${outgoingStartX},${outgoingY + radius}`
				: `L${outgoingStartX},${outgoingY}`,
			`L${outgoingStartX},${height} L${incomingStartX},${height} L${incomingStartX},${incomingY}`,
			incomingCutout
				? `L${incomingEndX - radius},${incomingY} A${radius},${radius} 0 0 0 ${incomingEndX},${incomingY - radius}`
				: `L${incomingEndX},${incomingY}`,
			`L${incomingEndX},0 Z`,
		].join(' ');
		clipPath = `path('${path}')`;
	}

	return {
		edges,
		clipPath,
		path,
	};
};

export const getTimelineSceneClipPath = (
	options: TimelineSceneClipOptions,
): string | undefined => getTimelineSceneShape(options, false)?.clipPath;
