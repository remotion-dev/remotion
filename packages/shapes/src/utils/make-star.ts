// Copied from https://stackblitz.com/edit/svg-star-generator?file=index.js

import type {Instruction} from './instructions';
import {serializeInstructions} from './instructions';
import {joinPoints} from './join-points';
import type {ShapeInfo} from './shape-info';

export type MakeStarProps = {
	points: number;
	innerRadius: number;
	outerRadius: number;
	edgeRoundness: number | null;
	cornerRadius: number;
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

const star = ({
	centerX,
	centerY,
	points,
	innerRadius,
	outerRadius,
	cornerRadius,
	edgeRoundness,
}: StarProps): Instruction[] => {
	const degreeIncrement = 360 / (points * 2);
	const d = new Array(points * 2)
		.fill('true')
		.map((_p, i): [number, number] => {
			const radius = i % 2 === 0 ? outerRadius : innerRadius;
			const degrees = degreeIncrement * i;
			const angleInRadians = ((degrees - 90) * Math.PI) / 180.0;
			const point = {
				x: centerX + radius * Math.cos(angleInRadians),
				y: centerY + radius * Math.sin(angleInRadians),
			};

			return [point.x, point.y];
		});

	return joinPoints([...d, d[0]], {
		edgeRoundness,
		cornerRadius,
		roundCornerStrategy: 'arc',
	});
};

export const makeStar = ({
	points,
	innerRadius,
	outerRadius,
	cornerRadius,
	edgeRoundness,
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

	return {
		path: serializeInstructions(starPathInstructions),
		width,
		height,
		transformOrigin: `${centerX} ${centerY}`,
		instructions: starPathInstructions,
	};
};
