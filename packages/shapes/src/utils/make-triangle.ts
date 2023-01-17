// Copied from https://stackblitz.com/edit/react-triangle-svg?file=index.js

import type {ShapeInfo} from './shape-info';

export type MakeTriangleProps = {
	length: number;
	direction: 'right' | 'left' | 'top' | 'bottom';
};

export const makeTriangle = ({
	length,
	direction = 'right',
}: MakeTriangleProps): ShapeInfo => {
	const longerDimension = length;
	const shorterSize = Math.sqrt(length ** 2 * 0.75); // Calculated on paper;

	const points = {
		top: [
			`${longerDimension / 2} 0`,
			'L',
			`0 ${shorterSize}`,
			'L',
			`${longerDimension} ${shorterSize}`,
		],
		right: [
			`0 0`,
			'L',
			`0 ${longerDimension}`,
			'L',
			`${shorterSize} ${longerDimension / 2}`,
		],
		bottom: [
			`0 0`,
			'L',
			`${longerDimension} 0`,
			'L',
			`${longerDimension / 2} ${shorterSize}`,
		],
		left: [
			`${shorterSize} 0`,
			'L',
			`${shorterSize} ${longerDimension}`,
			'L',
			`0 ${longerDimension / 2}`,
		],
	};

	const transformOriginX = {
		left: (shorterSize / 3) * 2,
		right: shorterSize / 3,
		top: longerDimension / 2,
		bottom: longerDimension / 2,
	}[direction];

	const transformOriginY = {
		top: (shorterSize / 3) * 2,
		bottom: shorterSize / 3,
		left: longerDimension / 2,
		right: longerDimension / 2,
	}[direction];

	return {
		path: `M ${points[direction].join(' ')} z`,
		width: direction === 'top' || direction === 'bottom' ? length : shorterSize,
		height:
			direction === 'top' || direction === 'bottom' ? shorterSize : length,
		transformOrigin: `${transformOriginX} ${transformOriginY}`,
	};
};
