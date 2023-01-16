export type MakeCircleProps = {
	cx: number;
	cy: number;
	radius: number;
};

export const makeCircle = ({cx, cy, radius}: MakeCircleProps) => {
	return `M ${cx} ${cy} m -${radius} 0 a ${radius} ${radius} 0 1 0 ${
		(radius as number) * 2
	} 0 ${radius} ${radius} 0 1 0 ${-radius * 2} 0`;
};
