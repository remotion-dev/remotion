export type MakeSquareProps = {
	x?: number;
	y?: number;
	width: number;
	height: number;
};

export const makeSquare = ({x = 0, y = 0, width, height}: MakeSquareProps) => {
	return `M ${x} ${y} l ${width} 0 l 0 ${height} l ${-width} 0 Z`;
};
