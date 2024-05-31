// Copied from https://stackblitz.com/edit/svg-star-generator?file=index.js

import type {Instruction} from '@remotion/paths';
import {
	PathInternals,
	reduceInstructions,
	resetPath,
	serializeInstructions,
} from '@remotion/paths';
import {joinPoints} from './join-points';
import type {ShapeInfo} from './shape-info';

export type MakeStarProps = {
	points: number;
	innerRadius: number;
	outerRadius: number;
	edgeRoundness?: number | null;
	cornerRadius?: number;
};

export type StarProps = {
	centerX: number;
	centerY: number;
	points: number;
	innerRadius: number;
	outerRadius: number;
	edgeRoundness: number | null;
	cornerRadius: number;
};

/**
 * @description Generates a star SVG path.
 * @param {Number} innerRadius The inner radius of the star.
 * @param {Number} outerRadius The outer radius of the star.
 * @param {Number} points The amount of points of the star.
 * @param {Number} cornerRadius Rounds the corner using an arc. Similar to CSS's border-radius. Cannot be used together with edgeRoundness.
 * @param {null|Number} edgeRoundness Allows to modify the shape by rounding the edges using bezier curves. Default null.
 * @see [Documentation](https://www.remotion.dev/docs/shapes/make-star)
 */
const star = ({
	centerX,
	centerY,
	points,
	innerRadius,
	outerRadius,
	cornerRadius,
	edgeRoundness,
}: StarProps): Instruction[] => {
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

export const makeStar = ({
	points,
	innerRadius,
	outerRadius,
	cornerRadius = 0,
	edgeRoundness = null,
}: MakeStarProps): ShapeInfo => {
	const width = outerRadius * 2;
	const height = outerRadius * 2;

	const centerX = width / 2;
	const centerY = height / 2;

	const starPathInstructions = star({
		centerX,
		centerY,
		points,
		innerRadius,
		outerRadius,
		cornerRadius,
		edgeRoundness,
	});

	const reduced = reduceInstructions(starPathInstructions);
	const path = resetPath(serializeInstructions(reduced));
	const boundingBox = PathInternals.getBoundingBoxFromInstructions(reduced);

	return {
		path,
		width: boundingBox.width,
		height: boundingBox.height,
		transformOrigin: `${centerX} ${centerY}`,
		instructions: starPathInstructions,
	};
};
