// https://github.com/Luobata/svg-triangle/blob/master/src/core/index.ts

interface IPoint {
	x: number;
	y: number;
}

interface SvgTriangle {
	path: string;
	width: number;
	height: number;
}

export const getTriangle = ({
	radius,
	width,
	height,
}: {
	radius: number;
	width: number;
	height: number;
}): SvgTriangle => {
	const margin: number = radius / Math.sqrt(2);

	const start: IPoint = {
		x: 0,
		y: 0,
	};
	const end: IPoint = {
		x: width,
		y: 0,
	};

	const between = {
		x: width / 2,
		y: height,
	};
	const b1 = {
		x: width / 2 - margin,
		y: height - margin,
	};
	const b2 = {
		x: width / 2 + margin,
		y: height - margin,
	};
	const path = `M ${start.x} ${start.y} L ${b1.x} ${b1.y} A ${radius} ${radius} 0 0 0 ${b2.x} ${b2.y} L ${end.x} ${end.y}`;
	const viewBoxWidth = end.x;
	const viewBoxHeight = between.y > 0 ? between.y : -between.y;
	return {
		path,
		width: viewBoxWidth,
		height: viewBoxHeight,
	};
};
