import type {Instruction} from './instructions';
import {serializeInstructions} from './instructions';

export type MakePieProps = {
	radius: number;
	progress: number;
	closePath?: boolean;
};

export const makePie = ({progress, radius, closePath = true}: MakePieProps) => {
	const actualProgress = Math.min(Math.max(progress, 0), 1);

	const endAngleX =
		Math.cos(actualProgress * Math.PI * 2 + Math.PI * 1.5) * radius + radius;
	const endAngleY =
		Math.sin(actualProgress * Math.PI * 2 + Math.PI * 1.5) * radius + radius;

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
			x: actualProgress <= 0.5 ? endAngleX : radius,
			y: actualProgress <= 0.5 ? endAngleY : radius * 2,
		},
		actualProgress > 0.5
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
		actualProgress > 0 && actualProgress < 1 && closePath
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
