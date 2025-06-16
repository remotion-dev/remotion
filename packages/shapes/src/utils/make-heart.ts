import type {Instruction} from '@remotion/paths';
import {serializeInstructions} from '@remotion/paths';
import type {ShapeInfo} from './shape-info';

export type MakeHeartProps = {
	width: number;
	height: number;
};

/**
 * @description Generates a heart SVG path.
 * @param {Number} size The size of the heart.
 * @see [Documentation](https://www.remotion.dev/docs/shapes/make-heart)
 */
export const makeHeart = ({width, height}: MakeHeartProps): ShapeInfo => {
	const bottomControlPointX = (32 / 110) * width;
	const bottomControlPointY = (69 / 100) * height;
	const bottomLeftControlPointY = (60 / 100) * height;
	const topLeftControlPointY = (13 / 100) * height;
	const topRightControlPointX = (40 / 110) * width;
	const innerControlPointX = (50 / 110) * width;
	const innerControlPointY = (7 / 100) * height;
	const depth = (17 / 100) * height;

	const instructions: Instruction[] = [
		{
			type: 'M',
			x: width / 2,
			y: height,
		},
		{
			type: 'C',
			cp1x: bottomControlPointX,
			cp1y: bottomControlPointY,
			cp2x: 0,
			cp2y: bottomLeftControlPointY,
			x: 0,
			y: height / 4,
		},
		{
			type: 'C',
			cp1x: 0,
			cp1y: topLeftControlPointY,
			cp2x: topLeftControlPointY,
			cp2y: 0,
			x: width / 4,
			y: 0,
		},
		{
			type: 'C',
			cp1x: topRightControlPointX,
			cp1y: 0,
			cp2x: innerControlPointX,
			cp2y: innerControlPointY,
			x: width / 2,
			y: depth,
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
