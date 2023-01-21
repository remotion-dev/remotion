import type {Instruction} from './instructions';
import {serializeInstructions} from './instructions';
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
			x: 1,
			y: 0,
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
