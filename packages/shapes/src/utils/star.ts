type PolarToCartesianProps = {
	centerX: number;
	centerY: number;
	radius: number;
	angleInDegrees: number;
	outerRadius?: number;
};

const polarToCartesian = ({
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
	const d = new Array(points * 2).fill('true').map((_p, i) => {
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
