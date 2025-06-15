import type {Instruction} from '@remotion/paths';
import {serializeInstructions} from '@remotion/paths';
import type {ShapeInfo} from './shape-info';

export type MakeHeartProps = {
	size: number;
};

/**
 * @description Generates a heart SVG path.
 * @param {Number} size The size of the heart.
 * @see [Documentation](https://www.remotion.dev/docs/shapes/make-heart)
 */
export const makeHeart = ({size}: MakeHeartProps): ShapeInfo => {
	// Center the heart within the size x size bounding box
	const centerX = size / 2;
	const centerY = size / 2;
	
	// Scale factor for the heart proportions (normalized to 100px base size)
	const scale = size / 100;

	// Create heart shape using bezier curves
	// Heart is made of two rounded lobes at the top and a point at the bottom
	const instructions: Instruction[] = [
		// Start at the bottom point of the heart
		{
			type: 'M',
			x: centerX,
			y: centerY + 35 * scale,
		},
		// Left side curve - from bottom point to left lobe
		{
			type: 'C',
			cp1x: centerX - 25 * scale,
			cp1y: centerY + 15 * scale,
			cp2x: centerX - 40 * scale,
			cp2y: centerY - 5 * scale,
			x: centerX - 25 * scale,
			y: centerY - 15 * scale,
		},
		// Left lobe top curve
		{
			type: 'C',
			cp1x: centerX - 10 * scale,
			cp1y: centerY - 25 * scale,
			cp2x: centerX - 5 * scale,
			cp2y: centerY - 25 * scale,
			x: centerX,
			y: centerY - 15 * scale,
		},
		// Right lobe top curve
		{
			type: 'C',
			cp1x: centerX + 5 * scale,
			cp1y: centerY - 25 * scale,
			cp2x: centerX + 10 * scale,
			cp2y: centerY - 25 * scale,
			x: centerX + 25 * scale,
			y: centerY - 15 * scale,
		},
		// Right side curve - from right lobe back to bottom point
		{
			type: 'C',
			cp1x: centerX + 40 * scale,
			cp1y: centerY - 5 * scale,
			cp2x: centerX + 25 * scale,
			cp2y: centerY + 15 * scale,
			x: centerX,
			y: centerY + 35 * scale,
		},
		{
			type: 'Z',
		},
	];

	const path = serializeInstructions(instructions);
	const width = size;
	const height = size;

	return {
		path,
		width,
		height,
		transformOrigin: `${centerX} ${centerY}`,
		instructions,
	};
};