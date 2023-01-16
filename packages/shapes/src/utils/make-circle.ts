import type {ShapeInfo} from './shape-info';

const circleParams = {
	name: 'radius' as const,
	description: 'The radius of the circle',
	exampleValue: 10 as number,
};

const options = [circleParams] as const;

type Values = typeof options[number];
export type MakeCircleProps = {[key in Values['name']]: Values['exampleValue']};

export const makeCircle = ({radius}: MakeCircleProps): ShapeInfo => {
	const cx = radius;
	const cy = radius;

	return {
		height: radius * 2,
		width: radius * 2,
		path: `M ${cx} ${cy} m -${radius} 0 a ${radius} ${radius} 0 1 0 ${
			(radius as number) * 2
		} 0 ${radius} ${radius} 0 1 0 ${-radius * 2} 0`,
	};
};
