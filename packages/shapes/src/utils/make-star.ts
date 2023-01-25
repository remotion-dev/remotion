// Copied from https://stackblitz.com/edit/svg-star-generator?file=index.js

import type {ShapeInfo} from './shape-info';
import {star} from './star';

export type MakeStarProps = {
	points: number;
	innerRadius: number;
	outerRadius: number;
	edgeRoundness: number | null;
	cornerRadius: number;
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

	const starPath = star({
		centerX,
		centerY,
		points,
		innerRadius,
		outerRadius,
		cornerRadius,
		edgeRoundness,
	});

	return {
		path: starPath,
		width,
		height,
		transformOrigin: `${centerX} ${centerY}`,
		instructions: [],
	};
};
