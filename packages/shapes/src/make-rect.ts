export type MakeRectOptions = {
	width: number;
	height: number;
};

export const makeRect = ({width, height}: MakeRectOptions) => {
	const x = 0;
	const y = 0;
	return `M ${x} ${y} l ${width} 0 l 0 ${height} l ${-width} 0 Z`;
};
