import type {Instruction} from './instructions';
import {serializeInstructions} from './instructions';

export type MakePieProps = {
	radius: number;
	fillAmount: number;
};

export const makePie = ({fillAmount, radius}: MakePieProps) => {
	const actualFillAmount = Math.min(Math.max(fillAmount, 0), 1);

	const endAngleX =
		Math.cos(-actualFillAmount * Math.PI * 2 + Math.PI) * radius + radius;
	const endAngleY =
		Math.sin(-actualFillAmount * Math.PI * 2 + Math.PI) * radius + radius;

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
			x: actualFillAmount <= 0.5 ? endAngleX : radius * 2,
			y: actualFillAmount <= 0.5 ? endAngleY : radius,
		},
		actualFillAmount > 0.5
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
		actualFillAmount > 0 && actualFillAmount < 1
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
