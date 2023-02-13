import type {Instruction} from '@remotion/paths';
import {serializeInstructions} from '@remotion/paths';
import type {ShapeInfo} from './shape-info';

export type MakeEllipseOptions = {
	rx: number;
	ry: number;
};

export const makeEllipse = ({rx, ry}: MakeEllipseOptions): ShapeInfo => {
	const instructions: Instruction[] = [
		{
			type: 'M',
			x: rx,
			y: 0,
		},
		{
			type: 'a',
			rx,
			ry,
			xAxisRotation: 0,
			largeArcFlag: true,
			sweepFlag: false,
			dx: 1,
			dy: 0,
		},
		{
			type: 'Z',
		},
	];

	const path = serializeInstructions(instructions);

	return {
		width: rx * 2,
		height: ry * 2,
		path,
		instructions,
		transformOrigin: `${rx} ${ry}`,
	};
};
