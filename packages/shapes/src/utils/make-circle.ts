export type MakeCircleProps = {
	radius: number;
};

export const makeCircle = ({radius}: MakeCircleProps) => {
	const cx = radius;
	const cy = radius;

	return `M ${cx} ${cy} m -${radius} 0 a ${radius} ${radius} 0 1 0 ${
		(radius as number) * 2
	} 0 ${radius} ${radius} 0 1 0 ${-radius * 2} 0`;
};
