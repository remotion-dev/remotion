import type {Instruction} from '@remotion/paths';
import {serializeInstructions} from '@remotion/paths';

export type MakePieProps = {
	radius: number;
	progress: number;
	closePath?: boolean;
	counterClockwise?: boolean;
	rotation?: number;
};

const getCoord = ({
	counterClockwise,
	actualProgress,
	rotation,
	radius,
	coord,
}: {
	counterClockwise: boolean;
	actualProgress: number;
	rotation: number;
	radius: number;
	coord: 'x' | 'y';
}): number => {
	const factor = counterClockwise ? -1 : 1;

	const val =
		Math[coord === 'x' ? 'cos' : 'sin'](
			factor * actualProgress * Math.PI * 2 + Math.PI * 1.5 + rotation
		) *
			radius +
		radius;

	const rounded = Math.round(val * 100000) / 100000;
	return rounded;
};

export const makePie = ({
	progress,
	radius,
	closePath = true,
	counterClockwise = false,
	rotation = 0,
}: MakePieProps) => {
	const actualProgress = Math.min(Math.max(progress, 0), 1);

	const endAngleX = getCoord({
		actualProgress,
		coord: 'x',
		counterClockwise,
		radius,
		rotation,
	});
	const endAngleY = getCoord({
		actualProgress,
		coord: 'y',
		counterClockwise,
		radius,
		rotation,
	});

	const start = {
		x: getCoord({
			actualProgress: 0,
			coord: 'x',
			counterClockwise,
			radius,
			rotation,
		}),
		y: getCoord({
			actualProgress: 0,
			coord: 'y',
			counterClockwise,
			radius,
			rotation,
		}),
	};
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
			sweepFlag: !counterClockwise,
			x:
				actualProgress <= 0.5
					? endAngleX
					: getCoord({
							actualProgress: 0.5,
							coord: 'x',
							counterClockwise,
							radius,
							rotation,
					  }),
			y:
				actualProgress <= 0.5
					? endAngleY
					: getCoord({
							actualProgress: 0.5,
							coord: 'y',
							counterClockwise,
							radius,
							rotation,
					  }),
		},
		actualProgress > 0.5
			? {
					type: 'A',
					rx: radius,
					ry: radius,
					xAxisRotation: 0,
					largeArcFlag: false,
					sweepFlag: !counterClockwise,
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
					type: 'Z',
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
