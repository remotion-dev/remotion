import type {Instruction} from './instructions';

const shortenVector = (vector: readonly [number, number], radius: number) => {
	const [x, y] = vector;
	const currentLength = Math.sqrt(x * x + y * y);
	const scalingFactor = (currentLength - radius) / currentLength;
	return [x * scalingFactor, y * scalingFactor] as const;
};

const scaleVectorToLength = (
	vector: readonly [number, number],
	length: number
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
	}: {
		edgeRoundness: number | null;
		cornerRadius: number;
	}
) => {
	return points
		.map(([x, y], i): Instruction | Instruction[] => {
			const prevPointIndex = i === 0 ? points.length - 2 : i - 1;
			const prevPoint = points[prevPointIndex];
			const nextPointIndex = i === points.length - 1 ? 1 : i + 1;
			const nextPoint = points[nextPointIndex];
			const middleOfLine = [(x + nextPoint[0]) / 2, (y + nextPoint[1]) / 2];
			const prevPointMiddleOfLine = [
				(x + prevPoint[0]) / 2,
				(y + prevPoint[1]) / 2,
			];

			if (i === 0) {
				if (edgeRoundness !== null) {
					return {
						type: 'M',
						x: middleOfLine[0],
						y: middleOfLine[1],
					};
				}

				return {
					type: 'M',
					x,
					y,
				};
			}

			const prevVector = [x - prevPoint[0], y - prevPoint[1]] as const;
			const nextVector = [nextPoint[0] - x, nextPoint[1] - y] as const;

			if (cornerRadius && edgeRoundness !== null) {
				throw new Error(
					`"cornerRadius" and "edgeRoundness" cannot be specified at the same time.`
				);
			}

			if (edgeRoundness === null) {
				const prevVectorMinusRadius = shortenVector(prevVector, cornerRadius);
				const prevVectorLenght = scaleVectorToLength(prevVector, cornerRadius);
				const nextVectorMinusRadius = scaleVectorToLength(
					nextVector,
					cornerRadius
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
					{
						type: 'C',
						x: firstDraw[0] + prevVectorLenght[0] + nextVectorMinusRadius[0],
						y: firstDraw[1] + prevVectorLenght[1] + nextVectorMinusRadius[1],
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

			return {
				type: 'C',
				cp1x: controlPoint1[0],
				cp1y: controlPoint1[1],
				cp2x: controlPoint2[0],
				cp2y: controlPoint2[1],
				x: middleOfLine[0],
				y: middleOfLine[1],
			};
		})
		.flat(1);
};
