export type MakeRectOptions = {
	x?: number;
	y?: number;
	width: number;
	height: number;
};

export const makeRect = ({x = 0, y = 0, width, height}: MakeRectOptions) => {
	return `M ${x} ${y} l ${width} 0 l 0 ${height} l ${-width} 0 Z`;
};
