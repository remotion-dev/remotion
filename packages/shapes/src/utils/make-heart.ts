import type {Instruction} from '@remotion/paths';
import {serializeInstructions} from '@remotion/paths';
import type {ShapeInfo} from './shape-info';

export type MakeHeartProps = {
	height: number;
	aspectRatio?: number;
	bottomRoundnessAdjustment?: number;
	depthAdjustment?: number;
};

/**
 * @description Generates a heart SVG path.
 * @param {Number} size The size of the heart.
 * @see [Documentation](https://www.remotion.dev/docs/shapes/make-heart)
 */
export const makeHeart = ({
	height,
	aspectRatio = 1.1,
	bottomRoundnessAdjustment = 0,
	depthAdjustment = 0,
}: MakeHeartProps): ShapeInfo => {
	const width = height * aspectRatio;
	const bottomControlPointX =
		(23 / 110) * width + bottomRoundnessAdjustment * width;
	const bottomControlPointY = (69 / 100) * height;
	const bottomLeftControlPointY = (60 / 100) * height;
	const topLeftControlPoint = (13 / 100) * height;
	const topBezierWidth = (29 / 110) * width;
	const topRightControlPointX = (15 / 110) * width;
	const innerControlPointX = (5 / 110) * width;
	const innerControlPointY = (7 / 100) * height;
	const depth = (17 / 100) * height + depthAdjustment * height;

	const instructions: Instruction[] = [
		{
			type: 'M',
			x: width / 2,
			y: height,
		},
		{
			type: 'C',
			cp1x: width / 2 - bottomControlPointX,
			cp1y: bottomControlPointY,
			cp2x: 0,
			cp2y: bottomLeftControlPointY,
			x: 0,
			y: height / 4,
		},
		{
			type: 'C',
			cp1x: 0,
			cp1y: topLeftControlPoint,
			cp2x: width / 4 - topBezierWidth / 2,
			cp2y: 0,
			x: width / 4,
			y: 0,
		},
		{
			type: 'C',
			cp1x: width / 4 + topBezierWidth / 2,
			cp1y: 0,
			cp2x: width / 2 - innerControlPointX,
			cp2y: innerControlPointY,
			x: width / 2,
			y: depth,
		},
		{
			type: 'C',
			cp1x: width / 2 + innerControlPointX,
			cp1y: innerControlPointY,
			cp2x: width / 2 + topRightControlPointX,
			cp2y: 0,
			x: (width / 4) * 3,
			y: 0,
		},
		{
			type: 'C',
			cp1x: (width / 4) * 3 + topBezierWidth / 2,
			cp1y: 0,
			cp2x: width,
			cp2y: topLeftControlPoint,
			x: width,
			y: height / 4,
		},
		{
			type: 'C',
			x: width / 2,
			y: height,
			cp1x: width,
			cp1y: bottomLeftControlPointY,
			cp2x: width / 2 + bottomControlPointX,
			cp2y: bottomControlPointY,
		},
		{
			type: 'Z',
		},
	];

	const path = serializeInstructions(instructions);

	return {
		path,
		width,
		height,
		transformOrigin: `${width / 2} ${height / 2}`,
		instructions,
	};
};
