import {serializeInstructions} from './instructions';
import {joinPoints} from './join-points';

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
	edgeRoundness: number | null;
	cornerRadius: number;
};

export const star = ({
	centerX,
	centerY,
	points,
	innerRadius,
	outerRadius,
	cornerRadius,
	edgeRoundness,
}: StarProps): string => {
	const degreeIncrement = 360 / (points * 2);
	const d = new Array(points * 2)
		.fill('true')
		.map((_p, i): [number, number] => {
			const radius = i % 2 === 0 ? outerRadius : innerRadius;
			const degrees = degreeIncrement * i;
			const point = polarToCartesian({
				centerX,
				centerY,
				radius,
				angleInDegrees: degrees,
			});

			return [point.x, point.y];
		});

	return serializeInstructions(
		joinPoints([...d, d[0]], {
			edgeRoundness,
			cornerRadius,
			roundCornerStrategy: 'arc',
		})
	);
};
