import type {Instruction} from '@remotion/paths';
import {
	PathInternals,
	reduceInstructions,
	resetPath,
	serializeInstructions,
} from '@remotion/paths';
import type {ShapeInfo} from './shape-info';

export type MakeHeartProps = {
	width: number;
	height: number;
};

/**
 * @description Generates a heart SVG path.
 * @param {Number} width The width of the heart.
 * @param {Number} height The height of the heart.
 * @see [Documentation](https://www.remotion.dev/docs/shapes/make-heart)
 */
const heart = ({
	width,
	height,
}: MakeHeartProps): Instruction[] => {
	// Create a heart shape using a simple approach
	// Heart is composed of two circles at the top and a triangle at the bottom
	const centerX = width / 2;
	const lobeRadius = width / 4;
	const leftCenter = centerX - lobeRadius / 2;
	const rightCenter = centerX + lobeRadius / 2;
	const topY = lobeRadius;
	const bottomY = height;
	
	const instructions: Instruction[] = [
		// Start at the top-center dip
		{
			type: 'M',
			x: centerX,
			y: topY,
		},
		// Left arc (top of heart)
		{
			type: 'A',
			rx: lobeRadius,
			ry: lobeRadius,
			xAxisRotation: 0,
			largeArcFlag: false,
			sweepFlag: false,
			x: leftCenter,
			y: topY,
		},
		// Line from left lobe to bottom point
		{
			type: 'L',
			x: centerX,
			y: bottomY,
		},
		// Line from bottom point to right lobe
		{
			type: 'L',
			x: rightCenter,
			y: topY,
		},
		// Right arc (top of heart)
		{
			type: 'A',
			rx: lobeRadius,
			ry: lobeRadius,
			xAxisRotation: 0,
			largeArcFlag: false,
			sweepFlag: false,
			x: centerX,
			y: topY,
		},
		// Close the path
		{type: 'Z'},
	];

	return instructions;
};

export const makeHeart = ({
	width,
	height,
}: MakeHeartProps): ShapeInfo => {
	const heartPathInstructions = heart({
		width,
		height,
	});

	const reduced = reduceInstructions(heartPathInstructions);
	const path = resetPath(serializeInstructions(reduced));
	const boundingBox = PathInternals.getBoundingBoxFromInstructions(reduced);

	return {
		path,
		width: boundingBox.width,
		height: boundingBox.height,
		transformOrigin: `${width / 2} ${height / 2}`,
		instructions: heartPathInstructions,
	};
};