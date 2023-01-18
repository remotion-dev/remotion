export type PolarToCartesianProps = {
	centerX: number;
	centerY: number;
	radius: number;
	angleInDegrees: number;
	outerRadius?: number;
};

export const polarToCartesian = ({
	centerX,
	centerY,
	radius,
	angleInDegrees,
}: PolarToCartesianProps) => {
	const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
	return {
		x: centerX + radius * Math.cos(angleInRadians),
		y: centerY + radius * Math.sin(angleInRadians),
	};
};

export type ArcProps = {
	x: number;
	y: number;
	radius: number;
	startAngle: number;
	endAngle: number;
	closeShape?: boolean;
};
export const arc = ({
	x,
	y,
	radius,
	startAngle,
	endAngle,
	closeShape,
}: ArcProps) => {
	const fullCircle = endAngle - startAngle === 360;
	const start = polarToCartesian({
		centerX: x,
		centerY: y,
		radius,
		angleInDegrees: endAngle - (fullCircle ? 0.01 : 0),
	});
	const end = polarToCartesian({
		centerX: x,
		centerY: y,
		radius,
		angleInDegrees: startAngle,
	});
	const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

	const d = [
		'M',
		start.x,
		start.y,
		'A',
		radius,
		radius,
		0,
		largeArcFlag,
		0,
		end.x,
		end.y,
		closeShape && !fullCircle ? `L ${x} ${y} Z` : null,
		fullCircle && !closeShape ? 'Z' : null,
	].join(' ');
	return d;
};

export type PieProps = {
	x: number;
	y: number;
	radius: number;
	startAngle: number;
	endAngle: number;
};

export const pie = ({x, y, radius, startAngle, endAngle}: PieProps) => {
	return arc({x, y, radius, startAngle, endAngle});
};

export type StarProps = {
	centerX: number;
	centerY: number;
	points: number;
	innerRadius: number;
	outerRadius: number;
};

export const star = ({
	centerX,
	centerY,
	points,
	innerRadius,
	outerRadius,
}: StarProps): string => {
	const degreeIncrement = 360 / (points * 2);
	const d = new Array(points * 2).fill('foo').map((_p, i) => {
		const radius = i % 2 === 0 ? outerRadius : innerRadius;
		const degrees = degreeIncrement * i;
		const point = polarToCartesian({
			centerX,
			centerY,
			radius,
			angleInDegrees: degrees,
		});
		return `${point.x},${point.y}`;
	});
	return `M${d}Z`;
};
