import type {ShapeInfo} from './shape-info';

export type MakeCircleProps = {
	radius: number;
};

export const makeCircle = ({radius}: MakeCircleProps): ShapeInfo => {
	return {
		height: radius * 2,
		width: radius * 2,
		path: `M ${radius} ${radius} m -${radius} 0 a ${radius} ${radius} 0 1 0 ${
			(radius as number) * 2
		} 0 ${radius} ${radius} 0 1 0 ${-radius * 2} 0`,
		transformOrigin: `${radius} ${radius}`,
	};
};
