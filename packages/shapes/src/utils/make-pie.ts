import type {Instruction} from './instructions';
import {serializeInstructions} from './instructions';

export type MakePieProps = {
	radius: number;
	fillAmount: number;
};

export const makePie = ({fillAmount, radius}: MakePieProps) => {
	const endAngleX =
		Math.cos(-fillAmount * Math.PI * 2 + Math.PI) * radius + radius;
	const endAngleY =
		Math.sin(-fillAmount * Math.PI * 2 + Math.PI) * radius + radius;

	const instructions: Instruction[] = [
		{
			type: 'M',
			x: 0,
			y: radius,
		},
		{
			type: 'A',
			rx: radius,
			ry: radius,
			xAxisRotation: 0,
			largeArcFlag: false,
			sweepFlag: false,
			x: fillAmount <= 0.5 ? endAngleX : radius * 2,
			y: fillAmount <= 0.5 ? endAngleY : radius,
		},
		fillAmount > 0.5
			? {
					type: 'A',
					rx: radius,
					ry: radius,
					xAxisRotation: 0,
					largeArcFlag: false,
					sweepFlag: false,
					x: endAngleX,
					y: endAngleY,
			  }
			: null,
		fillAmount > 0 && fillAmount < 1
			? {
					type: 'L',
					x: radius,
					y: radius,
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
