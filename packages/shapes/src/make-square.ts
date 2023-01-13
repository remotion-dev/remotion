export type MakeSquareProps = {
	x?: number;
	y?: number;
	size: number;
};

export const makeSquare = ({x = 50, y = 50, size}: MakeSquareProps) => {
	return `M ${x}, ${y} l ${size}, 0 l 0, ${size} l ${-size}, 0 Z`;
};
