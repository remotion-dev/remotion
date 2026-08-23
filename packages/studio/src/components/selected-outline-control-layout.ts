import type {OutlinePoint, SelectedOutline} from './selected-outline-geometry';

export type SelectedOutlineControlCorner =
	| 'top-left'
	| 'top-right'
	| 'bottom-right'
	| 'bottom-left';

// Outline points are measured in overlay pixels, keeping these sizes independent of canvas zoom.
const handleSize = 8;
const targetHalfSize = 4.5;
const smallOutlineSize = handleSize * 4;
const tinyOutlineSize = handleSize * 2;

const distance = (from: OutlinePoint, to: OutlinePoint) =>
	Math.hypot(to.x - from.x, to.y - from.y);

const normalize = (point: OutlinePoint): OutlinePoint | null => {
	const length = Math.hypot(point.x, point.y);
	if (length < 0.001) {
		return null;
	}

	return {x: point.x / length, y: point.y / length};
};

const getRotationHandlePoint = ({
	corner,
	points,
	radius,
}: {
	readonly corner: SelectedOutlineControlCorner;
	readonly points: SelectedOutline['points'];
	readonly radius: number;
}): OutlinePoint => {
	const [topLeft, topRight, bottomRight, bottomLeft] = points;
	const {point, adjacent} = {
		'top-left': {point: topLeft, adjacent: [topRight, bottomLeft]},
		'top-right': {point: topRight, adjacent: [topLeft, bottomRight]},
		'bottom-right': {point: bottomRight, adjacent: [topRight, bottomLeft]},
		'bottom-left': {point: bottomLeft, adjacent: [topLeft, bottomRight]},
	}[corner];
	const firstDirection = normalize({
		x: point.x - adjacent[0].x,
		y: point.y - adjacent[0].y,
	});
	const secondDirection = normalize({
		x: point.x - adjacent[1].x,
		y: point.y - adjacent[1].y,
	});
	const outlineCenter = {
		x: (topLeft.x + topRight.x + bottomRight.x + bottomLeft.x) / 4,
		y: (topLeft.y + topRight.y + bottomRight.y + bottomLeft.y) / 4,
	};
	const fallbackDirection = normalize({
		x: point.x - outlineCenter.x,
		y: point.y - outlineCenter.y,
	});
	const direction =
		firstDirection === null || secondDirection === null
			? fallbackDirection
			: normalize({
					x: firstDirection.x + secondDirection.x,
					y: firstDirection.y + secondDirection.y,
				});

	if (direction === null) {
		return point;
	}

	return {
		x: point.x + direction.x * radius,
		y: point.y + direction.y * radius,
	};
};

export const getSelectedOutlineControlLayout = (
	points: SelectedOutline['points'],
) => {
	const [topLeft, topRight, bottomRight, bottomLeft] = points;
	const horizontalExtent =
		(distance(topLeft, topRight) + distance(bottomLeft, bottomRight)) / 2;
	const verticalExtent =
		(distance(topLeft, bottomLeft) + distance(topRight, bottomRight)) / 2;
	const isSmallX = horizontalExtent < smallOutlineSize;
	const isSmallY = verticalExtent < smallOutlineSize;
	const isTinyX = horizontalExtent < tinyOutlineSize;
	const isTinyY = verticalExtent < tinyOutlineSize;
	const targetHalfSizeX = isSmallX ? targetHalfSize / 2 : targetHalfSize;
	const targetHalfSizeY = isSmallY ? targetHalfSize / 2 : targetHalfSize;
	const rotationHandleRadius = Math.max(targetHalfSizeX, targetHalfSizeY) * 1.5;
	const scaleEdges = (['top', 'right', 'bottom', 'left'] as const).filter(
		(edge) => {
			if (edge === 'top' || edge === 'bottom') {
				return !isTinyY;
			}

			return !isTinyX;
		},
	);
	const rotationCorners = (
		['top-left', 'top-right', 'bottom-right', 'bottom-left'] as const
	).map((corner) => ({
		corner,
		point: getRotationHandlePoint({
			corner,
			points,
			radius: rotationHandleRadius,
		}),
	}));

	return {
		rotationCorners: isTinyX || isTinyY ? [] : rotationCorners,
		rotationHandleRadius,
		scaleEdges,
		scaleHitWidth: {
			horizontal: targetHalfSizeY * 2,
			vertical: targetHalfSizeX * 2,
		},
	};
};
