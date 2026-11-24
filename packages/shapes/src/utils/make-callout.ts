import type {Instruction} from '@remotion/paths';
import {serializeInstructions} from '@remotion/paths';
import {joinPoints} from './join-points';
import type {ShapeInfo} from './shape-info';

type PointerDirection = 'up' | 'down' | 'left' | 'right';
type Point = [number, number];
type CalloutPoint = {
	readonly point: Point;
	readonly round: boolean;
};

export type MakeCalloutProps = {
	width?: number;
	height?: number;
	pointerLength?: number;
	pointerBaseWidth?: number;
	pointerPosition?: number;
	pointerDirection?: PointerDirection;
	edgeRoundness?: number | null;
	cornerRadius?: number;
};

const ensurePositive = (name: string, value: number) => {
	if (typeof value !== 'number' || value <= 0) {
		throw new Error(`"${name}" must be a positive number, got ${value}`);
	}
};

const pointerInterval = ({
	availableLength,
	pointerBaseWidth,
	pointerPosition,
}: {
	readonly availableLength: number;
	readonly pointerBaseWidth: number;
	readonly pointerPosition: number;
}) => {
	const center = availableLength * pointerPosition;
	const half = pointerBaseWidth / 2;

	return {
		center,
		start: Math.max(0, center - half),
		end: Math.min(availableLength, center + half),
	};
};

const areSamePoint = (a: Point, b: Point) => {
	return a[0] === b[0] && a[1] === b[1];
};

const normalizeClosedPoints = (points: CalloutPoint[]) => {
	const deduplicated = points.reduce<CalloutPoint[]>((acc, entry) => {
		const previous = acc[acc.length - 1];

		if (previous && areSamePoint(previous.point, entry.point)) {
			acc[acc.length - 1] = {
				point: previous.point,
				round: previous.round && entry.round,
			};

			return acc;
		}

		return [...acc, entry];
	}, []);

	if (deduplicated.length === 0) {
		return deduplicated;
	}

	const first = deduplicated[0];
	const last = deduplicated[deduplicated.length - 1];

	if (areSamePoint(first.point, last.point)) {
		const [firstEntry, ...rest] = deduplicated;
		const withoutLast = rest.slice(0, -1);
		const mergedFirst = {
			point: firstEntry.point,
			round: firstEntry.round && last.round,
		};

		return [mergedFirst, ...withoutLast, mergedFirst];
	}

	return [...deduplicated, first];
};

const unitDir = (from: Point, to: Point): Point => {
	const dx = to[0] - from[0];
	const dy = to[1] - from[1];
	const len = Math.sqrt(dx * dx + dy * dy);

	if (len === 0) {
		return [0, 0];
	}

	return [dx / len, dy / len];
};

const pointDistance = (a: Point, b: Point): number => {
	const dx = b[0] - a[0];
	const dy = b[1] - a[1];
	return Math.sqrt(dx * dx + dy * dy);
};

const makeInstructions = ({
	points,
	edgeRoundness,
	cornerRadius,
}: {
	readonly points: CalloutPoint[];
	readonly edgeRoundness: number | null;
	readonly cornerRadius: number;
}): Instruction[] => {
	const rawPoints = points.map((p) => p.point);

	if (edgeRoundness !== null || cornerRadius === 0) {
		return [
			...joinPoints(rawPoints, {
				edgeRoundness,
				cornerRadius,
				roundCornerStrategy: 'arc',
			}),
			{
				type: 'Z',
			},
		];
	}

	const uniquePoints = areSamePoint(
		points[0].point,
		points[points.length - 1].point,
	)
		? points.slice(0, -1)
		: points;

	const n = uniquePoints.length;
	const radii = uniquePoints.map((current, i) => {
		if (!current.round) {
			return 0;
		}

		const prevPoint = uniquePoints[(i - 1 + n) % n];
		const nextPoint = uniquePoints[(i + 1) % n];
		const incomingLen = pointDistance(prevPoint.point, current.point);
		const outgoingLen = pointDistance(current.point, nextPoint.point);

		const maxIncoming = prevPoint.round ? incomingLen / 2 : incomingLen;
		const maxOutgoing = nextPoint.round ? outgoingLen / 2 : outgoingLen;

		return Math.max(0, Math.min(cornerRadius, maxIncoming, maxOutgoing));
	});

	const firstPoint = uniquePoints[0];
	const firstRadius = radii[0];
	const startDir =
		firstPoint.round && firstRadius > 0
			? unitDir(uniquePoints[0].point, uniquePoints[1].point)
			: null;
	const startPoint: Point = startDir
		? [
				firstPoint.point[0] + startDir[0] * firstRadius,
				firstPoint.point[1] + startDir[1] * firstRadius,
			]
		: firstPoint.point;
	const instructions: Instruction[] = [
		{type: 'M', x: startPoint[0], y: startPoint[1]},
	];

	for (let i = 1; i < uniquePoints.length; i++) {
		const current = uniquePoints[i];
		const r = radii[i];

		if (!current.round || r === 0) {
			instructions.push({
				type: 'L',
				x: current.point[0],
				y: current.point[1],
			});
			continue;
		}

		const previous = uniquePoints[i - 1].point;
		const next = uniquePoints[(i + 1) % n].point;
		const incoming = unitDir(previous, current.point);
		const outgoing = unitDir(current.point, next);
		const arcStart: Point = [
			current.point[0] - incoming[0] * r,
			current.point[1] - incoming[1] * r,
		];

		instructions.push(
			{
				type: 'L',
				x: arcStart[0],
				y: arcStart[1],
			},
			{
				type: 'a',
				rx: r,
				ry: r,
				xAxisRotation: 0,
				dx: incoming[0] * r + outgoing[0] * r,
				dy: incoming[1] * r + outgoing[1] * r,
				largeArcFlag: false,
				sweepFlag: true,
			},
		);
	}

	if (firstPoint.round && firstRadius > 0) {
		const previous = uniquePoints[n - 1].point;
		const incoming = unitDir(previous, firstPoint.point);

		instructions.push(
			{
				type: 'L',
				x: firstPoint.point[0] - incoming[0] * firstRadius,
				y: firstPoint.point[1] - incoming[1] * firstRadius,
			},
			{
				type: 'a',
				rx: firstRadius,
				ry: firstRadius,
				xAxisRotation: 0,
				dx: incoming[0] * firstRadius + startDir![0] * firstRadius,
				dy: incoming[1] * firstRadius + startDir![1] * firstRadius,
				largeArcFlag: false,
				sweepFlag: true,
			},
		);
	}

	instructions.push({type: 'Z'});

	return instructions;
};

/**
 * @description Generates an SVG path for a callout shape.
 * @param {Number} width The width of the callout body. Default 500.
 * @param {Number} height The height of the callout body. Default 200.
 * @param {Number} pointerLength The length of the pointer. Default 40.
 * @param {Number} pointerBaseWidth The width of the pointer where it meets the body. Default 60.
 * @param {Number} pointerPosition Position of the pointer along its side, from 0 to 1. Default 0.5.
 * @param {string} pointerDirection The direction the pointer points. Default 'down'.
 * @param {null|Number} edgeRoundness Allows to modify the shape by rounding the edges using bezier curves. Default null.
 * @param {Number} cornerRadius Rounds the corner using an arc. Similar to CSS's border-radius. Cannot be used together with edgeRoundness.
 * @see [Documentation](https://www.remotion.dev/docs/shapes/make-callout)
 */
export const makeCallout = ({
	width = 500,
	height = 200,
	pointerLength = 40,
	pointerBaseWidth = 60,
	pointerPosition = 0.5,
	pointerDirection = 'down',
	edgeRoundness = null,
	cornerRadius = 0,
}: MakeCalloutProps): ShapeInfo => {
	ensurePositive('width', width);
	ensurePositive('height', height);
	ensurePositive('pointerLength', pointerLength);
	ensurePositive('pointerBaseWidth', pointerBaseWidth);

	if (
		typeof pointerPosition !== 'number' ||
		pointerPosition < 0 ||
		pointerPosition > 1
	) {
		throw new Error(
			`"pointerPosition" must be a number between 0 and 1, got ${pointerPosition}`,
		);
	}

	const horizontalInterval = pointerInterval({
		availableLength: width,
		pointerBaseWidth,
		pointerPosition,
	});
	const verticalInterval = pointerInterval({
		availableLength: height,
		pointerBaseWidth,
		pointerPosition,
	});

	const pointsByDirection: Record<PointerDirection, CalloutPoint[]> = {
		up: [
			{point: [0, pointerLength], round: true},
			{point: [horizontalInterval.start, pointerLength], round: false},
			{point: [horizontalInterval.center, 0], round: false},
			{point: [horizontalInterval.end, pointerLength], round: false},
			{point: [width, pointerLength], round: true},
			{point: [width, height + pointerLength], round: true},
			{point: [0, height + pointerLength], round: true},
			{point: [0, pointerLength], round: true},
		],
		down: [
			{point: [0, 0], round: true},
			{point: [width, 0], round: true},
			{point: [width, height], round: true},
			{point: [horizontalInterval.end, height], round: false},
			{
				point: [horizontalInterval.center, height + pointerLength],
				round: false,
			},
			{point: [horizontalInterval.start, height], round: false},
			{point: [0, height], round: true},
			{point: [0, 0], round: true},
		],
		left: [
			{point: [pointerLength, 0], round: true},
			{point: [width + pointerLength, 0], round: true},
			{point: [width + pointerLength, height], round: true},
			{point: [pointerLength, height], round: true},
			{point: [pointerLength, verticalInterval.end], round: false},
			{point: [0, verticalInterval.center], round: false},
			{point: [pointerLength, verticalInterval.start], round: false},
			{point: [pointerLength, 0], round: true},
		],
		right: [
			{point: [0, 0], round: true},
			{point: [width, 0], round: true},
			{point: [width, verticalInterval.start], round: false},
			{point: [width + pointerLength, verticalInterval.center], round: false},
			{point: [width, verticalInterval.end], round: false},
			{point: [width, height], round: true},
			{point: [0, height], round: true},
			{point: [0, 0], round: true},
		],
	};
	const points = normalizeClosedPoints(pointsByDirection[pointerDirection]);

	const instructions = makeInstructions({points, edgeRoundness, cornerRadius});
	const path = serializeInstructions(instructions);
	const shapeWidth =
		pointerDirection === 'left' || pointerDirection === 'right'
			? width + pointerLength
			: width;
	const shapeHeight =
		pointerDirection === 'up' || pointerDirection === 'down'
			? height + pointerLength
			: height;
	const bodyX = pointerDirection === 'left' ? pointerLength : 0;
	const bodyY = pointerDirection === 'up' ? pointerLength : 0;

	return {
		width: shapeWidth,
		height: shapeHeight,
		instructions,
		path,
		transformOrigin: `${bodyX + width / 2} ${bodyY + height / 2}`,
	};
};
