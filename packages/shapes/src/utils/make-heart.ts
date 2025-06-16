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
	const instructions: Instruction[] = [
		/**
M55 100
C32.4107 69.2427 0 60.5922 0 27.9126
C0 13.4951 12.7679 1 27.5 1
C40.2679 1 50.0893 7.72816 55 17.3398

		 */
		{
			type: 'M',
			x: 55,
			y: 100,
		},
		{
			type: 'C',
			cp1x: 32,
			cp1y: 69,
			cp2x: 0,
			cp2y: 60,
			x: 0,
			y: 27,
		},
		{
			type: 'C',
			cp1x: 0,
			cp1y: 13,
			cp2x: 12,
			cp2y: 1,
			x: 27.5,
			y: 1,
		},
		{
			type: 'C',
			cp1x: 40,
			cp1y: 1,
			cp2x: 50,
			cp2y: 7,
			x: 55,
			y: 17,
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
