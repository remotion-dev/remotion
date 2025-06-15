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
	const centerX = size;
	const centerY = size * 0.8;

	// Create heart shape using bezier curves
	// Heart is made of two rounded lobes at the top and a point at the bottom
	const instructions: Instruction[] = [
		// Start at the bottom point of the heart
		{
			type: 'M',
			x: centerX,
			y: centerY + size * 0.4,
		},
		// Left side of heart - curve up to left lobe
		{
			type: 'C',
			cp1x: centerX - size * 0.6,
			cp1y: centerY + size * 0.1,
			cp2x: centerX - size * 0.8,
			cp2y: centerY - size * 0.3,
			x: centerX - size * 0.4,
			y: centerY - size * 0.4,
		},
		// Left lobe - rounded top
		{
			type: 'C',
			cp1x: centerX - size * 0.1,
			cp1y: centerY - size * 0.6,
			cp2x: centerX + size * 0.1,
			cp2y: centerY - size * 0.6,
			x: centerX + size * 0.4,
			y: centerY - size * 0.4,
		},
		// Right lobe - curve back down to bottom point
		{
			type: 'C',
			cp1x: centerX + size * 0.8,
			cp1y: centerY - size * 0.3,
			cp2x: centerX + size * 0.6,
			cp2y: centerY + size * 0.1,
			x: centerX,
			y: centerY + size * 0.4,
		},
		{
			type: 'Z',
		},
	];

	const path = serializeInstructions(instructions);
	const width = size * 2;
	const height = size * 1.6;

	return {
		path,
		width,
		height,
		transformOrigin: `${centerX} ${centerY}`,
		instructions,
	};
};