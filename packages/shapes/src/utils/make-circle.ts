import type {Instruction} from '@remotion/paths';
import {serializeInstructions} from '@remotion/paths';
import type {ShapeInfo} from './shape-info';

export type MakeCircleProps = {
	radius: number;
};

export const makeCircle = ({radius}: MakeCircleProps): ShapeInfo => {
	const instructions: Instruction[] = [
		{
			type: 'M',
			x: 0,
			y: radius,
		},
		{
			type: 'a',
			rx: radius,
			ry: radius,
			xAxisRotation: 0,
			largeArcFlag: true,
			sweepFlag: false,
			dx: radius * 2,
			dy: 0,
		},
		{
			type: 'a',
			rx: radius,
			ry: radius,
			xAxisRotation: 0,
			largeArcFlag: true,
			sweepFlag: false,
			dx: -radius * 2,
			dy: 0,
		},
		{
			type: 'z',
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
