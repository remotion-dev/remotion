import type {Instruction} from './instructions';
import {serializeInstructions} from './instructions';

export type MakePieProps = {
	radius: number;
	fillAmount: number;
	closePath?: boolean;
};

export const makePie = ({
	fillAmount,
	radius,
	closePath = true,
}: MakePieProps) => {
	const actualFillAmount = Math.min(Math.max(fillAmount, 0), 1);

	const endAngleX =
		Math.cos(actualFillAmount * Math.PI * 2 + Math.PI * 1.5) * radius + radius;
	const endAngleY =
		Math.sin(actualFillAmount * Math.PI * 2 + Math.PI * 1.5) * radius + radius;

	const start = {x: radius, y: 0};
	const end = {x: endAngleX, y: endAngleY};

	const instructions: Instruction[] = [
		{
			type: 'M',
			...start,
		},
		{
			type: 'A',
			rx: radius,
			ry: radius,
			xAxisRotation: 0,
			largeArcFlag: false,
			sweepFlag: true,
			x: actualFillAmount <= 0.5 ? endAngleX : radius,
			y: actualFillAmount <= 0.5 ? endAngleY : radius * 2,
		},
		actualFillAmount > 0.5
			? {
					type: 'A',
					rx: radius,
					ry: radius,
					xAxisRotation: 0,
					largeArcFlag: false,
					sweepFlag: true,
					...end,
			  }
			: null,
		actualFillAmount > 0 && actualFillAmount < 1 && closePath
			? {
					type: 'L',
					x: radius,
					y: radius,
			  }
			: null,
		closePath
			? {
					type: 'z',
			  }
			: null,
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
