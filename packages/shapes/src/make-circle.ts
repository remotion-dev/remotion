export type MakeCircleProps = {
	cx?: number | string;
	cy?: number | string;
	radius?: number | string;
};

export const makeCircle = ({
	cx = 50,
	cy = 50,
	radius = 50,
}: MakeCircleProps) => {
	return `M ${cx} ${cy} m -${radius}, 0 a ${radius},${radius} 0 1,0 ${
		(radius as number) * 2
	},0  ${radius},${radius} 0 1,0 ${-radius * 2},0`;
};
