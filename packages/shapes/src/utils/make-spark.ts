import type {Instruction} from '@remotion/paths';
import {
	PathInternals,
	reduceInstructions,
	resetPath,
	serializeInstructions,
} from '@remotion/paths';
import {joinPoints} from './join-points';
import type {ShapeInfo} from './shape-info';

export type MakeSparkProps = {
	innerRadius: number;
	outerRadius: number;
	edgeRoundness?: number | null;
	cornerRadius?: number;
};

type SparkProps = {
	centerX: number;
	centerY: number;
	innerRadius: number;
	outerRadius: number;
	edgeRoundness: number | null;
	cornerRadius: number;
};

/**
 * @description Generates a spark SVG path.
 * @param {Number} innerRadius The inner radius of the spark.
 * @param {Number} outerRadius The outer radius of the spark.
 * @param {Number} cornerRadius Rounds the corner using an arc. Similar to CSS's border-radius. Cannot be used together with edgeRoundness.
 * @param {null|Number} edgeRoundness Allows to modify the shape by rounding the edges using bezier curves. Default null.
 * @see [Documentation](https://www.remotion.dev/docs/shapes/make-spark)
 */
const spark = ({
	centerX,
	centerY,
	innerRadius,
	outerRadius,
	cornerRadius,
	edgeRoundness,
}: SparkProps): Instruction[] => {
	const points = 4;
	const degreeIncrement = (Math.PI * 2) / (points * 2);
	const d = new Array(points * 2).fill(true).map((_p, i): [number, number] => {
		const radius = i % 2 === 0 ? outerRadius : innerRadius;
		const angle = degreeIncrement * i - Math.PI / 2;
		const point = {
			x: centerX + radius * Math.cos(angle),
			y: centerY + radius * Math.sin(angle),
		};

		return [point.x, point.y];
	});

	return [
		...joinPoints([...d, d[0]], {
			edgeRoundness,
			cornerRadius,
			roundCornerStrategy: cornerRadius > 0 ? 'bezier' : 'arc',
		}),
		{type: 'Z'},
	];
};

export const makeSpark = ({
	innerRadius,
	outerRadius,
	cornerRadius = 0,
	edgeRoundness = null,
}: MakeSparkProps): ShapeInfo => {
	const width = outerRadius * 2;
	const height = outerRadius * 2;

	const centerX = width / 2;
	const centerY = height / 2;

	const sparkPathInstructions = spark({
		centerX,
		centerY,
		innerRadius,
		outerRadius,
		cornerRadius,
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
