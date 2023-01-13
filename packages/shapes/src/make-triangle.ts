// Copied from https://stackblitz.com/edit/react-triangle-svg?file=index.js

export type MakeTriangleProps = {
	width: number;
	height: number;
	direction: 'right' | 'left' | 'top' | 'bottom';
};

export const makeTriangle = ({
	width,
	height,
	direction = 'right',
}: MakeTriangleProps) => {
	const points = {
		top: [`${width / 2},0`, 'L', `0,${height}`, 'L', `${width},${height}`],
		right: [`0,0`, 'L', `0,${height}`, 'L', `${width},${height / 2}`],
		bottom: [`0,0`, 'L', `${width},0`, 'L', `${width / 2},${height}`],
		left: [`${width},0`, 'L', `${width},${height}`, 'L', `0,${height / 2}`],
	};
	return `M ${points[direction].join(' ')} z`;
};
