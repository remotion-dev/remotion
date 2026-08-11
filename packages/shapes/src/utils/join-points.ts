import type {Instruction} from '@remotion/paths';

const shortenVector = (vector: readonly [number, number], radius: number) => {
	const [x, y] = vector;
	const currentLength = Math.sqrt(x * x + y * y);
	const scalingFactor = (currentLength - radius) / currentLength;
	return [x * scalingFactor, y * scalingFactor] as const;
};

const scaleVectorToLength = (
	vector: readonly [number, number],
	length: number,
) => {
	const [x, y] = vector;
	const currentLength = Math.sqrt(x * x + y * y);
	const scalingFactor = length / currentLength;
	return [x * scalingFactor, y * scalingFactor] as const;
};

export const joinPoints = (
	points: [number, number][],
	{
		edgeRoundness,
		cornerRadius,
		roundCornerStrategy,
	}: {
		edgeRoundness: number | null;
		cornerRadius: number;
		roundCornerStrategy: 'arc' | 'bezier';
	},
) => {
	return points
		.map(([x, y], i): Instruction[] => {
			const prevPointIndex = i === 0 ? points.length - 2 : i - 1;
			const prevPoint = points[prevPointIndex];
			const nextPointIndex = i === points.length - 1 ? 1 : i + 1;
			const nextPoint = points[nextPointIndex];
			const middleOfLine = [(x + nextPoint[0]) / 2, (y + nextPoint[1]) / 2];
			const prevPointMiddleOfLine = [
				(x + prevPoint[0]) / 2,
				(y + prevPoint[1]) / 2,
			];
			const prevVector = [x - prevPoint[0], y - prevPoint[1]] as const;
			const nextVector = [nextPoint[0] - x, nextPoint[1] - y] as const;

			if (i === 0) {
				if (edgeRoundness !== null) {
					return [
						{
							type: 'M',
							x: middleOfLine[0],
							y: middleOfLine[1],
						},
					];
				}

				if (cornerRadius !== 0) {
					const computeRadius = shortenVector(nextVector, cornerRadius);

					return [
						{
							type: 'M',
							x: computeRadius[0] + x,
							y: computeRadius[1] + y,
						},
					];
				}

				return [
					{
						type: 'M',
						x,
						y,
					},
				];
			}

			if (cornerRadius && edgeRoundness !== null) {
				throw new Error(
					`"cornerRadius" and "edgeRoundness" cannot be specified at the same time.`,
				);
			}

			if (edgeRoundness === null) {
				if (cornerRadius === 0) {
					return [
						{
							type: 'L',
							x,
							y,
						},
					];
				}

				const prevVectorMinusRadius = shortenVector(prevVector, cornerRadius);
				const prevVectorLength = scaleVectorToLength(prevVector, cornerRadius);
				const nextVectorMinusRadius = scaleVectorToLength(
					nextVector,
					cornerRadius,
				);

				const firstDraw = [
					prevPoint[0] + prevVectorMinusRadius[0],
					prevPoint[1] + prevVectorMinusRadius[1],
				];

				return [
					{
						type: 'L',
						x: firstDraw[0],
						y: firstDraw[1],
					},
					roundCornerStrategy === 'arc'
						? {
								type: 'a',
								rx: cornerRadius,
								ry: cornerRadius,
								xAxisRotation: 0,
								dx: prevVectorLength[0] + nextVectorMinusRadius[0],
								dy: prevVectorLength[1] + nextVectorMinusRadius[1],
								largeArcFlag: false,
								sweepFlag: true,
							}
						: {
								type: 'C',
								x:
									firstDraw[0] + prevVectorLength[0] + nextVectorMinusRadius[0],
								y:
									firstDraw[1] + prevVectorLength[1] + nextVectorMinusRadius[1],
								cp1x: x,
								cp1y: y,
								cp2x: x,
								cp2y: y,
							},
				];
			}

			const controlPoint1 = [
				prevPointMiddleOfLine[0] + prevVector[0] * edgeRoundness * 0.5,
				prevPointMiddleOfLine[1] + prevVector[1] * edgeRoundness * 0.5,
			] as const;

			const controlPoint2 = [
				middleOfLine[0] - nextVector[0] * edgeRoundness * 0.5,
				middleOfLine[1] - nextVector[1] * edgeRoundness * 0.5,
			] as const;

			return [
				{
					type: 'C',
					cp1x: controlPoint1[0],
					cp1y: controlPoint1[1],
					cp2x: controlPoint2[0],
					cp2y: controlPoint2[1],
					x: middleOfLine[0],
					y: middleOfLine[1],
				},
			];
		})
		.flat(1);
};
