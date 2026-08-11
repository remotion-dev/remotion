import type {Instruction} from '@remotion/paths';
import {serializeInstructions} from '@remotion/paths';
import type {ShapeInfo} from './shape-info';

export type MakeCircleProps = {
	radius: number;
};

/**
 * @description Generates a circle SVG path.
 * @param {Number} radius The radius of the circle.
 * @see [Documentation](https://www.remotion.dev/docs/shapes/make-circle)
 */
export const makeCircle = ({radius}: MakeCircleProps): ShapeInfo => {
	const instructions: Instruction[] = [
		{
			type: 'M',
			x: radius,
			y: 0,
		},
		{
			type: 'a',
			rx: radius,
			ry: radius,
			xAxisRotation: 0,
			largeArcFlag: true,
			sweepFlag: true,
			dx: 0,
			dy: radius * 2,
		},
		{
			type: 'a',
			rx: radius,
			ry: radius,
			xAxisRotation: 0,
			largeArcFlag: true,
			sweepFlag: true,
			dx: 0,
			dy: -radius * 2,
		},
		{
			type: 'Z',
		},
	];

	const path = serializeInstructions(instructions);

	return {
		height: radius * 2,
		width: radius * 2,
		path,
		instructions,
		transformOrigin: `${radius} ${radius}`,
	};
};
