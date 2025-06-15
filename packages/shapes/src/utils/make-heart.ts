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
	// Heart shape using a classic approach with proper proportions
	const centerX = size / 2;
	const centerY = size / 2;
	
	// Heart scaling factor
	const scale = size / 100;
	
	// Heart key points
	const bottomX = centerX;
	const bottomY = centerY + 35 * scale; // Bottom point
	
	// Lobe parameters for classic heart shape
	const lobeOffsetX = 25 * scale;  // How far lobes are from center
	const lobeRadius = 18 * scale;   // Size of each lobe
	const lobeY = centerY - 15 * scale; // Vertical center of lobes
	
	const leftLobeX = centerX - lobeOffsetX;
	const rightLobeX = centerX + lobeOffsetX;

	// Create heart with 4 bezier curves (M + 4 C + Z = 6 instructions)
	const instructions: Instruction[] = [
		// Start at the bottom point
		{
			type: 'M',
			x: bottomX,
			y: bottomY,
		},
		// Left side - from bottom to left lobe
		{
			type: 'C',
			cp1x: bottomX - 30 * scale,
			cp1y: bottomY - 15 * scale,
			cp2x: leftLobeX - lobeRadius,
			cp2y: lobeY + lobeRadius * 0.5,
			x: leftLobeX - lobeRadius,
			y: lobeY,
		},
		// Left lobe - semicircular top, ending at center dip
		{
			type: 'C',
			cp1x: leftLobeX - lobeRadius,
			cp1y: lobeY - lobeRadius,
			cp2x: leftLobeX + lobeRadius * 0.8,
			cp2y: lobeY - lobeRadius,
			x: centerX,
			y: lobeY + lobeRadius * 0.2,
		},
		// Right lobe - from center dip to right lobe edge
		{
			type: 'C',
			cp1x: rightLobeX - lobeRadius * 0.8,
			cp1y: lobeY - lobeRadius,
			cp2x: rightLobeX + lobeRadius,
			cp2y: lobeY - lobeRadius,
			x: rightLobeX + lobeRadius,
			y: lobeY,
		},
		// Right side - from right lobe back to bottom
		{
			type: 'C',
			cp1x: rightLobeX + lobeRadius,
			cp1y: lobeY + lobeRadius * 0.5,
			cp2x: bottomX + 30 * scale,
			cp2y: bottomY - 15 * scale,
			x: bottomX,
			y: bottomY,
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