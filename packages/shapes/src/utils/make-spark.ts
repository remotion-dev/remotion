import type {Instruction} from '@remotion/paths';
import {
	PathInternals,
	reduceInstructions,
	resetPath,
	serializeInstructions,
} from '@remotion/paths';
import type {ShapeInfo} from './shape-info';

export type MakeSparkProps = {
	width: number;
	height: number;
	innerRadius: number;
	points?: number;
	rotation?: number;
	edgeRoundness?: number | null;
	tipRoundness?: number;
	valleyRoundness?: number;
};

type Point = {
	x: number;
	y: number;
};

type SparkProps = Required<Omit<MakeSparkProps, 'edgeRoundness'>> & {
	centerX: number;
	centerY: number;
	edgeRoundness: number | null;
};

const distance = (a: Point, b: Point) => {
	return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
};

const interpolate = (from: Point, to: Point, amount: number): Point => {
	const length = distance(from, to);
	if (length === 0) {
		return from;
	}

	const progress = amount / length;
	return {
		x: from.x + (to.x - from.x) * progress,
		y: from.y + (to.y - from.y) * progress,
	};
};

const getVertices = ({
	centerX,
	centerY,
	width,
	height,
	innerRadius,
	points,
	rotation,
}: Pick<
	SparkProps,
	| 'centerX'
	| 'centerY'
	| 'width'
	| 'height'
	| 'innerRadius'
	| 'points'
	| 'rotation'
>): Point[] => {
	const outerRadiusX = width / 2;
	const outerRadiusY = height / 2;
	const degreeIncrement = (Math.PI * 2) / (points * 2);

	return new Array(points * 2).fill(true).map((_p, i): Point => {
		const isTip = i % 2 === 0;
		const angle = degreeIncrement * i - Math.PI / 2 + rotation;
		const radiusX = isTip ? outerRadiusX : innerRadius;
		const radiusY = isTip ? outerRadiusY : innerRadius;

		return {
			x: centerX + radiusX * Math.cos(angle),
			y: centerY + radiusY * Math.sin(angle),
		};
	});
};

const spark = ({
	centerX,
	centerY,
	width,
	height,
	innerRadius,
	points,
	rotation,
	tipRoundness,
	valleyRoundness,
	edgeRoundness,
}: SparkProps): Instruction[] => {
	const vertices = getVertices({
		centerX,
		centerY,
		width,
		height,
		innerRadius,
		points,
		rotation,
	});

	const roundedVertices = vertices.map((vertex, i) => {
		const previous = vertices[(i - 1 + vertices.length) % vertices.length];
		const next = vertices[(i + 1) % vertices.length];
		const requestedRoundness = i % 2 === 0 ? tipRoundness : valleyRoundness;
		const roundness = Math.min(
			requestedRoundness,
			distance(vertex, previous) / 2,
			distance(vertex, next) / 2,
		);

		return {
			vertex,
			roundness,
			start: interpolate(vertex, previous, roundness),
			end: interpolate(vertex, next, roundness),
		};
	});

	const instructions: Instruction[] = [
		{
			type: 'M',
			x: roundedVertices[0].end.x,
			y: roundedVertices[0].end.y,
		},
	];

	for (let i = 0; i < roundedVertices.length; i++) {
		const current = roundedVertices[i];
		const next = roundedVertices[(i + 1) % roundedVertices.length];
		const edgeStart = current.end;
		const edgeEnd = next.start;

		if (edgeRoundness === null || edgeRoundness === 0) {
			instructions.push({
				type: 'L',
				x: edgeEnd.x,
				y: edgeEnd.y,
			});
		} else {
			const offset = {
				x: centerX - (edgeStart.x + edgeEnd.x) / 2,
				y: centerY - (edgeStart.y + edgeEnd.y) / 2,
			};
			const controlPoint1 = {
				x:
					edgeStart.x +
					(edgeEnd.x - edgeStart.x) / 3 +
					offset.x * edgeRoundness * 0.5,
				y:
					edgeStart.y +
					(edgeEnd.y - edgeStart.y) / 3 +
					offset.y * edgeRoundness * 0.5,
			};
			const controlPoint2 = {
				x:
					edgeStart.x +
					((edgeEnd.x - edgeStart.x) * 2) / 3 +
					offset.x * edgeRoundness * 0.5,
				y:
					edgeStart.y +
					((edgeEnd.y - edgeStart.y) * 2) / 3 +
					offset.y * edgeRoundness * 0.5,
			};

			instructions.push({
				type: 'C',
				cp1x: controlPoint1.x,
				cp1y: controlPoint1.y,
				cp2x: controlPoint2.x,
				cp2y: controlPoint2.y,
				x: edgeEnd.x,
				y: edgeEnd.y,
			});
		}

		if (next.roundness > 0) {
			instructions.push({
				type: 'Q',
				cpx: next.vertex.x,
				cpy: next.vertex.y,
				x: next.end.x,
				y: next.end.y,
			});
		}
	}

	instructions.push({type: 'Z'});

	return instructions;
};

/**
 * @description Generates a spark SVG path.
 * @param {Number} width The width of the spark.
 * @param {Number} height The height of the spark.
 * @param {Number} innerRadius The radius of the inner spark valleys.
 * @param {Number} points The amount of points of the spark. Default 4.
 * @param {Number} rotation Rotates the spark around its center in radians. Default 0.
 * @param {Number} tipRoundness Rounds the outer tips of the spark. Default 0.
 * @param {Number} valleyRoundness Rounds the inner valleys of the spark. Default 0.
 * @param {null|Number} edgeRoundness Curves the spark edges toward or away from the center. Default null.
 * @see [Documentation](https://www.remotion.dev/docs/shapes/make-spark)
 */
export const makeSpark = ({
	width,
	height,
	innerRadius,
	points = 4,
	rotation = 0,
	tipRoundness = 0,
	valleyRoundness = 0,
	edgeRoundness = null,
}: MakeSparkProps): ShapeInfo => {
	const centerX = width / 2;
	const centerY = height / 2;

	const sparkPathInstructions = spark({
		centerX,
		centerY,
		width,
		height,
		innerRadius,
		points,
		rotation,
		tipRoundness,
		valleyRoundness,
		edgeRoundness,
	});

	const reduced = reduceInstructions(sparkPathInstructions);
	const path = resetPath(serializeInstructions(reduced));
	const boundingBox = PathInternals.getBoundingBoxFromInstructions(reduced);

	return {
		path,
		width: boundingBox.width,
		height: boundingBox.height,
		transformOrigin: `${centerX} ${centerY}`,
		instructions: sparkPathInstructions,
	};
};
