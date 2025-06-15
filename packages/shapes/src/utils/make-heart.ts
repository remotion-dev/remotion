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
	// Heart shape is roughly 1:1 aspect ratio in its natural form
	// We'll scale it to fit the desired width/height
	const centerX = width / 2;
	const heartWidth = width;
	const heartHeight = height;
	
	// Heart shape using bezier curves
	// Based on a mathematical heart curve adapted for SVG paths
	const topHeight = heartHeight * 0.3; // Height of the top lobes
	const lobeRadius = heartWidth * 0.25; // Radius of each lobe
	
	// Calculate key points
	const leftLobeCenter = centerX - heartWidth * 0.25;
	const rightLobeCenter = centerX + heartWidth * 0.25;
	const bottomPointX = centerX;
	const bottomPointY = heartHeight;
	
	const instructions: Instruction[] = [
		// Start at the center top
		{
			type: 'M',
			x: centerX,
			y: topHeight,
		},
		// Left lobe (top arc)
		{
			type: 'C',
			cp1x: centerX - lobeRadius * 0.5,
			cp1y: 0,
			cp2x: leftLobeCenter - lobeRadius,
			cp2y: topHeight * 0.5,
			x: leftLobeCenter,
			y: topHeight,
		},
		// Left lobe (bottom arc)
		{
			type: 'C',
			cp1x: leftLobeCenter - lobeRadius,
			cp1y: topHeight + lobeRadius * 0.5,
			cp2x: leftLobeCenter - lobeRadius * 0.3,
			cp2y: topHeight + lobeRadius,
			x: bottomPointX,
			y: bottomPointY,
		},
		// Right lobe (bottom arc)
		{
			type: 'C',
			cp1x: rightLobeCenter + lobeRadius * 0.3,
			cp1y: topHeight + lobeRadius,
			cp2x: rightLobeCenter + lobeRadius,
			cp2y: topHeight + lobeRadius * 0.5,
			x: rightLobeCenter,
			y: topHeight,
		},
		// Right lobe (top arc)
		{
			type: 'C',
			cp1x: rightLobeCenter + lobeRadius,
			cp1y: topHeight * 0.5,
			cp2x: centerX + lobeRadius * 0.5,
			cp2y: 0,
			x: centerX,
			y: topHeight,
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

	const centerX = width / 2;
	const centerY = height / 2;

	return {
		path,
		width: boundingBox.width,
		height: boundingBox.height,
		transformOrigin: `${centerX} ${centerY}`,
		instructions: heartPathInstructions,
	};
};