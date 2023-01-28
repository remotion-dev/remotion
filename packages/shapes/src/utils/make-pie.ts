import type {Instruction} from './instructions';
import {serializeInstructions} from './instructions';

export type MakePieProps = {
	radius: number;
	fillAmount: number;
};

export const makePie = ({fillAmount, radius}: MakePieProps) => {
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
			x: radius * 2,
			y: 0,
		},
		fillAmount > 0.5
			? {
					type: 'a',
					rx: radius,
					ry: radius,
					xAxisRotation: 0,
					largeArcFlag: true,
					sweepFlag: false,
					x: -radius * 2,
					y: 0,
			  }
			: null,
		{
			type: 'z',
		},
	].filter(Boolean) as Instruction[];

	const path = serializeInstructions(instructions);

	return {
		height: radius * 2,
		width: radius * 2,
		path,
		instructions,
		transformOrigin: `${radius} ${radius}`,
	};
};
